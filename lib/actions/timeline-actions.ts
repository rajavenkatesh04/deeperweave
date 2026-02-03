'use server';

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {getProfileByUsername, getUserProfile} from '@/lib/data/user-data';
import { cacheMovie, cacheSeries } from './cinematic-actions';
import {getTimelineEntriesByUserId} from "@/lib/data/timeline-data";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export type LogEntryState = {
    message?: string | null;
    errors?: {
        cinematicApiId?: string[];
        media_type?: string[];
        watched_on?: string[];
        rating?: string[];
        notes?: string[];
        viewing_medium?: string[];
        ott_platform?: string[];
        photo?: string[];
        watched_with?: string[];
    };
};
export type UpdateEntryState = LogEntryState;

const TimelineEntrySchema = z.object({
    cinematicApiId: z.coerce.number().optional(),
    media_type: z.enum(['movie', 'tv']).optional(),
    watched_on: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Please enter a valid date.',
    }),
    rating: z.coerce.number()
        .min(0, 'A rating is required.')
        .max(5)
        .step(0.5),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters.').optional(),
    viewing_medium: z.enum(['theatre', 'ott']).optional(),
    ott_platform: z.string().optional(),
    photo: z.instanceof(File).optional()
        .refine(file => !file || file.size === 0 || file.size <= MAX_FILE_SIZE_BYTES,
            `Max image size is ${MAX_FILE_SIZE_MB}MB.`)
        .refine(file => !file || file.size === 0 || ALLOWED_IMAGE_TYPES.includes(file.type),
            'Only .jpg, .png, .webp, and .heic formats are supported.'),
    watched_with: z.array(z.string().uuid()).optional(),
})
    .superRefine((data, ctx) => {
        if (!data.cinematicApiId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'You must select a movie or series.',
                path: ['cinematicApiId'],
            });
        }
        if (data.cinematicApiId && !data.media_type) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Media type is missing. Please re-select your item.',
                path: ['cinematicApiId'],
            });
        }
        if (data.viewing_medium === 'ott' && (!data.ott_platform || data.ott_platform.trim() === '')) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please select an OTT platform.',
                path: ['ott_platform'],
            });
        }
    });

// =====================================================================
// == CREATE (logEntry)
// =====================================================================
export async function logEntry(prevState: LogEntryState, formData: FormData): Promise<LogEntryState> {
    const supabase = await createClient();
    const userData = await getUserProfile();

    if (!userData?.user || !userData.profile) {
        return { message: 'Authentication Error: You must be logged in to log an entry.' };
    }

    const formDataObj: Record<string, FormDataEntryValue | FormDataEntryValue[] | File | number | undefined> = {};
    for (const [key, value] of formData.entries()) {
        if (key !== 'watched_with') formDataObj[key] = value;
    }
    formDataObj.watched_with = formData.getAll('watched_with');
    const photoFile = formData.get('photo');
    if (photoFile instanceof File && photoFile.size > 0) {
        formDataObj.photo = photoFile;
    } else {
        formDataObj.photo = undefined;
    }
    if (formDataObj.rating === '0') formDataObj.rating = 0;

    const validatedFields = TimelineEntrySchema.safeParse(formDataObj);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid data. Please check the form and try again.',
        };
    }

    const {
        cinematicApiId, media_type, watched_on, rating, notes,
        viewing_medium, ott_platform, photo, watched_with
    } = validatedFields.data;

    if (!cinematicApiId || !media_type) {
        return { message: 'Validation failed unexpectedly. Missing cinematic ID or media type.' };
    }

    let movieId: number | undefined = undefined;
    let seriesId: number | undefined = undefined;

    // --- 1. ✨ CRITICAL: Upsert Cinematic Details (CACHE ON WRITE) ---
    try {
        if (media_type === 'movie') {
            await cacheMovie(cinematicApiId);
            movieId = cinematicApiId;
        } else if (media_type === 'tv') {
            await cacheSeries(cinematicApiId);
            seriesId = cinematicApiId;
        }
    } catch (error) {
        console.error("Timeline cinematic upsert error:", error);
        return { message: "Server Error: Could not save movie/series details." };
    }

    // --- 2. Check for Rewatch ---
    const rewatchQuery = supabase
        .from('timeline_entries')
        .select('id')
        .eq('user_id', userData.user.id);

    if (media_type === 'movie') {
        rewatchQuery.eq('movie_id', cinematicApiId);
    } else {
        rewatchQuery.eq('series_id', cinematicApiId);
    }

    const { data: existingEntries } = await rewatchQuery;
    const isRewatch = !!existingEntries && existingEntries.length > 0;

    // --- 3. Handle Photo Upload ---
    let photoUrl: string | null = null;
    if (photo) {
        const fileExtension = photo.name.split('.').pop();
        const filePath = `${userData.user.id}/${cinematicApiId}-${Date.now()}.${fileExtension}`;
        const { error: uploadError } = await supabase.storage
            .from('timeline_photos')
            .upload(filePath, photo, { upsert: true, cacheControl: '3600' });

        if (uploadError) {
            console.error('Photo upload error:', uploadError);
            return { message: 'Database Error: Could not upload photo.' };
        }
        const { data: { publicUrl } } = supabase.storage
            .from('timeline_photos')
            .getPublicUrl(filePath);
        photoUrl = publicUrl;
    }

    // --- 4. Prepare Timeline Entry Data ---
    let viewingContext: string | null = null;
    if (viewing_medium === 'theatre') viewingContext = 'Theatre';
    else if (viewing_medium === 'ott' && ott_platform) viewingContext = ott_platform;

    const entryToInsert = {
        user_id: userData.user.id,
        movie_id: movieId,
        series_id: seriesId,
        watched_on,
        rating: rating === 0 ? null : rating,
        notes: notes || null,
        is_rewatch: isRewatch,
        photo_url: photoUrl,
        viewing_context: viewingContext,
    };

    // --- 5. Insert Timeline Entry ---
    const { data: newEntry, error: insertError } = await supabase
        .from('timeline_entries')
        .insert(entryToInsert)
        .select('id')
        .single();

    if (insertError) {
        console.error("Timeline insert error:", insertError);
        return { message: 'Database Error: Could not log your entry.' };
    }

    // --- 6. Insert Collaborators ---
    if (watched_with && watched_with.length > 0) {
        const collaboratorsToInsert = watched_with.map(userId => ({
            entry_id: newEntry.id,
            user_id: userId,
        }));
        const { error: collaboratorError } = await supabase
            .from('timeline_collaborators')
            .insert(collaboratorsToInsert);
        if (collaboratorError) console.error("Collaborator insert error:", collaboratorError);
    }

    revalidatePath(`/profile/${userData.profile.username}/timeline`);
    redirect(`/profile/${userData.profile.username}/timeline`);
    return { message: 'Success' };
}

export async function updateTimelineEntry(prevState: UpdateEntryState, formData: FormData): Promise<UpdateEntryState> {
    const supabase = await createClient();
    const userData = await getUserProfile();

    if (!userData?.user || !userData.profile) {
        return { message: 'Authentication Error: You must be logged in.' };
    }

    const entryId = formData.get('entryId') as string;
    if (!entryId) {
        return { message: 'Error: Entry ID is missing. Cannot update.' };
    }

    const { data: existingEntry, error: fetchError } = await supabase
        .from('timeline_entries')
        .select('user_id, photo_url, movie_id, series_id')
        .eq('id', entryId)
        .single();

    if (fetchError || !existingEntry) {
        return { message: 'Error: Could not find the entry to update.' };
    }

    if (existingEntry.user_id !== userData.user.id) {
        return { message: 'Authorization Error: You can only edit your own entries.' };
    }

    const formDataObj: Record<string, FormDataEntryValue | FormDataEntryValue[] | File | number | undefined> = {};
    for (const [key, value] of formData.entries()) {
        if (key !== 'watched_with') formDataObj[key] = value;
    }
    formDataObj.watched_with = formData.getAll('watched_with');
    const photoFile = formData.get('photo');
    if (photoFile instanceof File && photoFile.size > 0) {
        formDataObj.photo = photoFile;
    } else {
        formDataObj.photo = undefined;
    }
    if (formDataObj.rating === '0') formDataObj.rating = 0;

    const validatedFields = TimelineEntrySchema.safeParse(formDataObj);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid data. Please check the form and try again.',
        };
    }

    const {
        cinematicApiId, media_type, watched_on, rating, notes,
        viewing_medium, ott_platform, photo, watched_with
    } = validatedFields.data;

    const dbItemId = existingEntry.movie_id || existingEntry.series_id;
    const dbItemType = existingEntry.movie_id ? 'movie' : 'tv';

    if (cinematicApiId !== dbItemId || media_type !== dbItemType) {
        return { message: 'Error: Cinematic item cannot be changed when editing an entry.' };
    }

    let photoUrl: string | null = existingEntry.photo_url;
    const removePhoto = formData.get('remove_photo') === 'true';
    const oldPhotoUrl = existingEntry.photo_url;

    const deleteOldPhoto = async () => {
        if (oldPhotoUrl) {
            try {
                const oldFilePath = oldPhotoUrl.split('/timeline_photos/')[1];
                await supabase.storage.from('timeline_photos').remove([oldFilePath]);
            } catch (delError) {
                console.error("Could not delete old photo:", delError);
            }
        }
    };

    if (photo) {
        await deleteOldPhoto();
        const fileExtension = photo.name.split('.').pop();
        const filePath = `${userData.user.id}/${cinematicApiId}-${Date.now()}.${fileExtension}`;
        const { error: uploadError } = await supabase.storage
            .from('timeline_photos')
            .upload(filePath, photo, { upsert: true, cacheControl: '3600' });
        if (uploadError) return { message: 'Database Error: Could not upload new photo.' };
        const { data: { publicUrl } } = supabase.storage.from('timeline_photos').getPublicUrl(filePath);
        photoUrl = publicUrl;
    } else if (removePhoto) {
        await deleteOldPhoto();
        photoUrl = null;
    }

    let viewingContext: string | null = null;
    if (viewing_medium === 'theatre') viewingContext = 'Theatre';
    else if (viewing_medium === 'ott' && ott_platform) viewingContext = ott_platform;

    const entryToUpdate = {
        watched_on,
        rating: rating === 0 ? null : rating,
        notes: notes || null,
        photo_url: photoUrl,
        viewing_context: viewingContext,
    };

    const { error: updateError } = await supabase
        .from('timeline_entries')
        .update(entryToUpdate)
        .eq('id', entryId);

    if (updateError) {
        return { message: 'Database Error: Could not update your entry.' };
    }

    const { error: deleteCollabError } = await supabase
        .from('timeline_collaborators')
        .delete()
        .eq('entry_id', entryId);
    if (deleteCollabError) console.error("Collaborator delete error:", deleteCollabError);

    if (watched_with && watched_with.length > 0) {
        const collaboratorsToInsert = watched_with.map(userId => ({
            entry_id: entryId,
            user_id: userId,
        }));
        const { error: collabInsertError } = await supabase
            .from('timeline_collaborators')
            .insert(collaboratorsToInsert);
        if (collabInsertError) console.error("Collaborator insert error:", collabInsertError);
    }

    revalidatePath(`/profile/${userData.profile.username}/timeline`);
    redirect(`/profile/${userData.profile.username}/timeline`)
    return { message: 'Success' };
}

export type DeleteTimelineEntryState = {
    message?: string | null;
    success?: boolean;
};

export async function deleteTimelineEntry(entryId: string): Promise<DeleteTimelineEntryState> {
    const supabase = await createClient();
    const userData = await getUserProfile();

    if (!userData?.user || !userData.profile) {
        return { message: 'Authentication Error: You must be logged in to delete an entry.', success: false };
    }

    const { data: entry, error: fetchError } = await supabase
        .from('timeline_entries')
        .select('user_id, photo_url')
        .eq('id', entryId)
        .single();

    if (fetchError || !entry) {
        return { message: 'Error: Could not find the entry.', success: false };
    }

    if (entry.user_id !== userData.user.id) {
        return { message: 'Authorization Error: You can only delete your own entries.', success: false };
    }

    if (entry.photo_url) {
        try {
            const oldFilePath = entry.photo_url.split('/timeline_photos/')[1];
            await supabase.storage.from('timeline_photos').remove([oldFilePath]);
        } catch (delError) {
            console.error("Could not delete photo during entry deletion:", delError);
        }
    }

    const { error: deleteError } = await supabase
        .from('timeline_entries')
        .delete()
        .eq('id', entryId);

    if (deleteError) {
        return { message: 'Database Error: Could not delete the entry.', success: false };
    }

    revalidatePath(`/profile/${userData.profile.username}/timeline`);
    return { message: 'Entry deleted successfully!', success: true };
}


export async function fetchUserTimeline(username: string) {
    const profile = await getProfileByUsername(username);

    if (!profile) {
        return [];
    }

    // Reuse your existing data logic
    return await getTimelineEntriesByUserId(profile.id);
}