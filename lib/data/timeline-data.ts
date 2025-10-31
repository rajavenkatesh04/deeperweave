// @/lib/data/timeline-data.ts

'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { unstable_noStore as noStore } from 'next/cache';
import {
    TimelineEntry,
    TimelineEntryWithUser,
    TimelineCollaboratorWithProfile,
    Movie, // Import Movie
    UserProfile // Import UserProfile
} from '@/lib/definitions';
// import { PostgrestError } from '@supabase/supabase-js'; // <-- REMOVED (This was the unused warning)

// Define a type for the raw data coming from Supabase before we clean it.
// ✨ NO MORE 'any'. We use the real types.
type RawTimelineEntry = Omit<TimelineEntry, 'movies' | 'posts' | 'timeline_collaborators'> & {
    movies: Movie | Movie[] | null; // <-- FIXED
    posts: { slug: string } | { slug: string }[] | null; // <-- FIXED
    timeline_collaborators: TimelineCollaboratorWithProfile[] | null; // <-- FIXED
};

export async function getTimelineEntriesByUserId(userId: string): Promise<TimelineEntry[]> {
    noStore();

    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('timeline_entries')
        .select(`
            *,
            movies (*),
            posts (slug),
            timeline_collaborators (*, profiles (id, username, profile_pic_url))
        `)
        .eq('user_id', userId)
        .order('watched_on', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching timeline entries:", error);
        return [];
    }

    // ✨ We cast the incoming data to our Raw type
    const typedData = (data as RawTimelineEntry[]).map((item) => ({
        ...item,
        movies: Array.isArray(item.movies) ? item.movies[0] : item.movies,
        posts: Array.isArray(item.posts) ? item.posts[0] : item.posts,

        timeline_collaborators: (item.timeline_collaborators || []).map((collab) => ({
            ...collab,
            profiles: Array.isArray(collab.profiles) ? collab.profiles[0] : collab.profiles,
        })),
    }));

    return typedData as TimelineEntry[];
}

// Define the raw type for the single entry query
type RawTimelineEntryWithUser = RawTimelineEntry & {
    // ✨ NO MORE 'any'. We use the real (or a Pick) type.
    profiles: Pick<UserProfile, 'username' | 'display_name' | 'profile_pic_url'> | Pick<UserProfile, 'username' | 'display_name' | 'profile_pic_url'>[] | null; // <-- FIXED
};

export async function getTimelineEntryById(entryId: string): Promise<TimelineEntryWithUser | null> {
    noStore();

    const supabaseService = await createAdminClient();

    const { data, error } = await supabaseService
        .from('timeline_entries')
        .select(`
            *,
            movies (*),
            posts (slug),
            profiles:user_id (username, display_name, profile_pic_url),
            timeline_collaborators (*, profiles (id, username, profile_pic_url))
        `)
        .eq('id', entryId)
        .single<RawTimelineEntryWithUser>();

    if (error || !data) {
        console.error(`Supabase error fetching timeline entry ${entryId} (as admin):`, error);
        return null;
    }

    // ✨ All types are now strong
    const typedData = {
        ...data,
        movies: Array.isArray(data.movies) ? data.movies[0] : data.movies,
        posts: Array.isArray(data.posts) ? data.posts[0] : data.posts,
        profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
        timeline_collaborators: (data.timeline_collaborators || []).map((collab) => ({
            ...collab,
            profiles: Array.isArray(collab.profiles) ? collab.profiles[0] : collab.profiles,
        })),
    };

    if (!typedData.movies) {
        console.error(`Error: Timeline entry ${entryId} has no associated movie data.`);
        return null;
    }
    if (!typedData.profiles) {
        console.error(`Error: Timeline entry ${entryId} has no associated profile.`);
        return null;
    }

    return typedData as TimelineEntryWithUser;
}