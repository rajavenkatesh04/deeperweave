// @/lib/data/timeline-data.ts

'use server';

import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import { Movie } from '@/lib/definitions'; // Assuming Movie type is in definitions

// Define a type for our timeline entries to ensure type safety
export type TimelineEntry = {
    id: string;
    watched_on: string;
    rating: number | null;
    notes: string | null;
    movies: Pick<Movie, 'tmdb_id' | 'title' | 'release_date' | 'poster_url'>;
    // We'll also fetch the post slug if a review is linked
    posts: { slug: string } | null;
};

export async function getTimelineEntriesByUserId(userId: string): Promise<TimelineEntry[]> {
    noStore();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('timeline_entries')
        .select(`
            id,
            watched_on,
            rating,
            notes,
            movies (tmdb_id, title, release_date, poster_url),
            posts (slug)
        `)
        .eq('user_id', userId)
        .order('watched_on', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching timeline entries:", error);
        return [];
    }

    // Supabase might return a single object or an array for joins. This handles it.
    const typedData = data.map(item => ({
        ...item,
        movies: Array.isArray(item.movies) ? item.movies[0] : item.movies,
        posts: Array.isArray(item.posts) ? item.posts[0] : item.posts,
    }));


    return typedData as TimelineEntry[];
}