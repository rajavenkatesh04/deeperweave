'use server';

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { getUserProfile } from '@/lib/data/user-data';
import { getMovieDetails } from '@/lib/actions/blog-actions';

// --- Define file validation constants ---
const MAX_FILE_SIZE_MB = 5; // Set to 5MB
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

// --- Updated State type for new errors ---
export type LogMovieState = {
    message?: string | null;
    errors?: {
        movieApiId?: string[];
        watched_on?: string[];
        rating?: string[];
        notes?: string[];
        viewing_medium?: string[];
        ott_platform?: string[];
        photo?: string[];
        watched_with?: string[];
    };
};

// --- Updated Zod Schema ---
const TimelineEntrySchema = z.object({
    movieApiId: z.coerce.number()
        .min(1, 'You must select a movie.'),

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

}).refine(data => {
    if (data.viewing_medium === 'ott') {
        return data.ott_platform && data.ott_platform.trim() !== '';
    }
    return true;
}, {
    message: 'Please select an OTT platform.',
    path: ['ott_platform'],
});

export async function logMovie(prevState: LogMovieState, formData: FormData): Promise<LogMovieState> {
    const supabase = await createClient();
    const userData = await getUserProfile();

    if (!userData?.user || !userData.profile) {
        return { message: 'Authentication Error: You must be logged in to log a movie.' };
    }

    // FIX: Build the object properly with correct types
    const formDataObj: Record<string, FormDataEntryValue | FormDataEntryValue[] | File | number | undefined> = {};

    // Add all regular form entries
    for (const [key, value] of formData.entries()) {
        if (key !== 'watched_with') {
            formDataObj[key] = value;
        }
    }

    // Handle watched_with separately as an array
    formDataObj.watched_with = formData.getAll('watched_with');

    // Handle photo file
    const photoFile = formData.get('photo');
    if (photoFile instanceof File && photoFile.size > 0) {
        formDataObj.photo = photoFile;
    } else {
        formDataObj.photo = undefined;
    }

    // Handle rating edge case
    if (formDataObj.rating === '0') {
        formDataObj.rating = 0;
    }

    const validatedFields = TimelineEntrySchema.safeParse(formDataObj);

    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid data. Please check the form and try again.',
        };
    }

    const {
        movieApiId, watched_on, rating, notes,
        viewing_medium, ott_platform, photo, watched_with
    } = validatedFields.data;

    // --- 1. Upsert Movie Details ---
    try {
        const movieDetails = await getMovieDetails(movieApiId);
        await supabase.from('movies').upsert({
            tmdb_id: movieApiId,
            title: movieDetails.title,
            poster_url: movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : null,
            release_date: movieDetails.release_date,
            director: movieDetails.director,
        });
    } catch (error) {
        console.error("Timeline movie upsert error:", error);
        return { message: "Server Error: Could not save movie details." };
    }

    // --- 2. Check for Rewatch ---
    const { data: existingEntries } = await supabase
        .from('timeline_entries')
        .select('id')
        .eq('user_id', userData.user.id)
        .eq('movie_tmdb_id', movieApiId);

    const isRewatch = !!existingEntries && existingEntries.length > 0;

    // --- 3. Handle Photo Upload ---
    let photoUrl: string | null = null;
    if (photo) {
        const fileExtension = photo.name.split('.').pop();
        const filePath = `${userData.user.id}/${movieApiId}-${Date.now()}.${fileExtension}`;

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
        movie_tmdb_id: movieApiId,
        watched_on,
        rating: rating === 0 ? null : rating,
        notes: notes || null,
        is_rewatch: isRewatch,
        photo_url: photoUrl,
        viewing_context: viewingContext,
    };

    // --- 5. Insert Timeline Entry & Get ID ---
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

        if (collaboratorError) {
            console.error("Collaborator insert error:", collaboratorError);
        }
    }

    // --- 7. Revalidate and Return Success ---
    revalidatePath(`/profile/${userData.profile.username}/timeline`);
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
        .select('user_id')
        .eq('id', entryId)
        .single();

    if (fetchError || !entry) {
        console.error("Timeline entry fetch error:", fetchError);
        return { message: 'Error: Could not find the entry.', success: false };
    }

    if (entry.user_id !== userData.user.id) {
        return { message: 'Authorization Error: You can only delete your own entries.', success: false };
    }

    const { error: deleteError } = await supabase
        .from('timeline_entries')
        .delete()
        .eq('id', entryId);

    if (deleteError) {
        console.error("Timeline delete error:", deleteError);
        return { message: 'Database Error: Could not delete the entry.', success: false };
    }

    revalidatePath(`/profile/${userData.profile.username}/timeline`);
    return { message: 'Entry deleted successfully!', success: true };
}