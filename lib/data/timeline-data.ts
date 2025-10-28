'use server';

// ✨ 1. Import the admin client (with service role key)
import { createAdminClient } from '@/utils/supabase/admin';
import { unstable_noStore as noStore } from 'next/cache';
import { Movie, UserProfile } from '@/lib/definitions';

export type TimelineEntry = {
    id: string;
    watched_on: string;
    rating: number | null;
    notes: string | null;
    movies: Pick<Movie, 'tmdb_id' | 'title' | 'release_date' | 'poster_url'>;
    posts: { slug: string } | null;
};
export type TimelineEntryWithUser = TimelineEntry & {
    username: UserProfile['username'];
    display_name: UserProfile['display_name'];
    profile_pic_url?: UserProfile['profile_pic_url'];
};

export async function getTimelineEntriesByUserId(userId: string): Promise<TimelineEntry[]> {
    noStore();

    // ✨ 2. Use the regular user client (respects RLS)
    const { createClient } = await import('@/utils/supabase/server');
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

    const typedData = data.map(item => ({
        ...item,
        movies: Array.isArray(item.movies) ? item.movies[0] : item.movies,
        posts: Array.isArray(item.posts) ? item.posts[0] : item.posts,
    }));

    return typedData as TimelineEntry[];
}


export async function getTimelineEntryById(entryId: string): Promise<TimelineEntryWithUser | null> {
    noStore();

    // ✨ 3. Use the admin client (service role with bypass RLS)
    const supabaseService = await createAdminClient();

    const { data, error } = await supabaseService
        .from('timeline_entries')
        .select(`
            id,
            watched_on,
            rating,
            notes,
            user_id,
            movies (tmdb_id, title, release_date, poster_url),
            posts (slug),
            profiles:user_id (username, display_name, profile_pic_url)
        `)
        .eq('id', entryId)
        .single();

    if (error || !data) {
        console.error(`Supabase error fetching timeline entry ${entryId} (as admin):`, error);
        return null;
    }

    const typedData = {
        ...data,
        movies: Array.isArray(data.movies) ? data.movies[0] : data.movies,
        posts: Array.isArray(data.posts) ? data.posts[0] : data.posts,
        profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
    };

    if (!typedData.movies) {
        console.error(`Error: Timeline entry ${entryId} has no associated movie data.`);
        return null;
    }
    if (!typedData.profiles) {
        console.error(`Error: Timeline entry ${entryId} has no associated profile.`);
        return null;
    }

    return {
        id: typedData.id,
        watched_on: typedData.watched_on,
        rating: typedData.rating,
        notes: typedData.notes,
        movies: typedData.movies,
        posts: typedData.posts,
        username: typedData.profiles.username,
        display_name: typedData.profiles.display_name,
        profile_pic_url: typedData.profiles.profile_pic_url,
    };
}