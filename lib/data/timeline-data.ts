'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { unstable_noStore as noStore } from 'next/cache';
import {
    TimelineEntry,
    TimelineEntryWithUser,
    TimelineCollaboratorWithProfile,
    Movie,
    UserProfile,
    Series // ✨ 1. IMPORT Series
} from '@/lib/definitions';

// ✨ 2. UPDATE RAW TYPE
type RawTimelineEntry = Omit<TimelineEntry, 'movies' | 'series' | 'posts' | 'timeline_collaborators'> & {
    movies: Movie | Movie[] | null;
    series: Series | Series[] | null; // ✨ ADDED
    posts: { slug: string } | { slug: string }[] | null;
    timeline_collaborators: TimelineCollaboratorWithProfile[] | null;
};

export async function getTimelineEntriesByUserId(userId: string): Promise<TimelineEntry[]> {
    noStore();

    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();

    // ✨ 3. UPDATE SELECT
    const { data, error } = await supabase
        .from('timeline_entries')
        .select(`
            *,
            movies (*),
            series (*),
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

    // ✨ 4. UPDATE MAPPING
    const typedData = (data as RawTimelineEntry[]).map((item) => ({
        ...item,
        movies: Array.isArray(item.movies) ? item.movies[0] : item.movies,
        series: Array.isArray(item.series) ? item.series[0] : item.series, // ✨ ADDED
        posts: Array.isArray(item.posts) ? item.posts[0] : item.posts,

        timeline_collaborators: (item.timeline_collaborators || []).map((collab) => ({
            ...collab,
            profiles: Array.isArray(collab.profiles) ? collab.profiles[0] : collab.profiles,
        })),
    }));

    return typedData as TimelineEntry[];
}

// ✨ 5. UPDATE RAW TYPE
type RawTimelineEntryWithUser = RawTimelineEntry & {
    profiles: Pick<UserProfile, 'username' | 'display_name' | 'profile_pic_url'> | Pick<UserProfile, 'username' | 'display_name' | 'profile_pic_url'>[] | null;
};

export async function getTimelineEntryById(entryId: string): Promise<TimelineEntryWithUser | null> {
    noStore();

    const supabaseService = await createAdminClient();

    // ✨ 6. UPDATE SELECT
    const { data, error } = await supabaseService
        .from('timeline_entries')
        .select(`
            *,
            movies (*),
            series (*),
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

    // ✨ 7. UPDATE MAPPING
    const typedData = {
        ...data,
        movies: Array.isArray(data.movies) ? data.movies[0] : data.movies,
        series: Array.isArray(data.series) ? data.series[0] : data.series, // ✨ ADDED
        posts: Array.isArray(data.posts) ? data.posts[0] : data.posts,
        profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
        timeline_collaborators: (data.timeline_collaborators || []).map((collab) => ({
            ...collab,
            profiles: Array.isArray(collab.profiles) ? collab.profiles[0] : collab.profiles,
        })),
    };

    // ✨ 8. UPDATE FINAL CHECK
    if (!typedData.movies && !typedData.series) {
        console.error(`Error: Timeline entry ${entryId} has no associated movie or series data.`);
        return null;
    }
    if (!typedData.profiles) {
        console.error(`Error: Timeline entry ${entryId} has no associated profile.`);
        return null;
    }

    return typedData as TimelineEntryWithUser;
}