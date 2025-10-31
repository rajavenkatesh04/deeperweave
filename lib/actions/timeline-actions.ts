// @/lib/actions/timeline-actions.ts

'use server';

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/data/user-data';
// We can reuse this from your blog actions!
import { getMovieDetails } from '@/lib/actions/blog-actions';

export type LogMovieState = {
    message?: string | null;
    errors?: {
        movieApiId?: string[];
        watched_on?: string[];
        rating?: string[];
        notes?: string[];
    };
};

const TimelineEntrySchema = z.object({
    movieApiId: z.coerce.number({ error: 'You must select a movie.' }),
    watched_on: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Please enter a valid date.',
    }),
    rating: z.coerce.number().min(0).max(5).step(0.5).optional(),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters.').optional(),
});

export async function logMovie(prevState: LogMovieState, formData: FormData): Promise<LogMovieState> {
    const supabase = await createClient();
    const userData = await getUserProfile();

    if (!userData?.user || !userData.profile) {
        return { message: 'Authentication Error: You must be logged in to log a movie.' };
    }

    const validatedFields = TimelineEntrySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid data. Please check the form and try again.',
        };
    }

    const { movieApiId, watched_on, rating, notes } = validatedFields.data;

    // --- Reuse existing logic to save movie details ---
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

    // --- Insert the new timeline entry ---
    const { error: insertError } = await supabase.from('timeline_entries').insert({
        user_id: userData.user.id,
        movie_tmdb_id: movieApiId,
        watched_on,
        rating: rating === 0 ? null : rating, // Store 0 as null
        notes: notes || null,
    });

    if (insertError) {
        console.error("Timeline insert error:", insertError);
        return { message: 'Database Error: Could not log your entry.' };
    }

    // --- Revalidate and redirect ---
    revalidatePath(`/profile/${userData.profile.username}/timeline`);
    redirect(`/profile/${userData.profile.username}/timeline`);
}



export type DeleteTimelineEntryState = {
    message?: string | null;
    success?: boolean;
};

// Add this function after logMovie
export async function deleteTimelineEntry(entryId: string): Promise<DeleteTimelineEntryState> {
    const supabase = await createClient();
    const userData = await getUserProfile();

    if (!userData?.user || !userData.profile) {
        return {
            message: 'Authentication Error: You must be logged in to delete an entry.',
            success: false
        };
    }

    // First, verify that this entry belongs to the current user
    const { data: entry, error: fetchError } = await supabase
        .from('timeline_entries')
        .select('user_id')
        .eq('id', entryId)
        .single();

    if (fetchError || !entry) {
        console.error("Timeline entry fetch error:", fetchError);
        return {
            message: 'Error: Could not find the entry.',
            success: false
        };
    }

    // Security check: ensure the entry belongs to the current user
    if (entry.user_id !== userData.user.id) {
        return {
            message: 'Authorization Error: You can only delete your own entries.',
            success: false
        };
    }

    // Delete the entry
    const { error: deleteError } = await supabase
        .from('timeline_entries')
        .delete()
        .eq('id', entryId);

    if (deleteError) {
        console.error("Timeline delete error:", deleteError);
        return {
            message: 'Database Error: Could not delete the entry.',
            success: false
        };
    }

    // Revalidate the timeline page
    revalidatePath(`/profile/${userData.profile.username}/timeline`);

    return {
        message: 'Entry deleted successfully!',
        success: true
    };
}