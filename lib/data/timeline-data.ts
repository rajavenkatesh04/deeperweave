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
import { createClient } from '@/utils/supabase/server';

// Define the shape of the raw return from Supabase before we clean it up
type RawTimelineEntry = Omit<TimelineEntry, 'movies' | 'series' | 'posts' | 'timeline_collaborators'> & {
    movies: Movie | Movie[] | null;
    series: Series | Series[] | null;
    posts: { slug: string } | { slug: string }[] | null;
    timeline_collaborators: TimelineCollaboratorWithProfile[] | null;
};

export async function getTimelineEntriesByUserId(userId: string): Promise<TimelineEntry[]> {
    noStore();
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();

    // 1. Fetch Data
    // Order by watched_on ASCENDING first so we can count chronologically (1st, 2nd, 3rd...)
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
        .order('watched_on', { ascending: true })
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching timeline entries:", error);
        return [];
    }

    // 2. Calculate Rewatch Counts
    // We maintain a running count for every movie/show ID encountered
    const counts: Record<string, number> = {};

    const typedData = (data as RawTimelineEntry[]).map((item) => {
        const movie = Array.isArray(item.movies) ? item.movies[0] : item.movies;
        const series = Array.isArray(item.series) ? item.series[0] : item.series;

        // Generate a unique key (e.g., "movie_550" or "tv_1399")
        const mediaKey = movie ? `movie_${movie.tmdb_id}` : (series ? `tv_${series.tmdb_id}` : null);

        let totalViews = 0;

        if (mediaKey) {
            // Increment total views for this specific item
            counts[mediaKey] = (counts[mediaKey] || 0) + 1;
            totalViews = counts[mediaKey];
        }

        // Calculate "Rewatch Index"
        // If totalViews is 1, index is 0 (First watch, not a rewatch)
        // If totalViews is 2, index is 1 (Rewatch #1)
        const rewatchIndex = totalViews > 0 ? totalViews - 1 : 0;

        // Determine if this specific entry is a rewatch based on our calculation
        // (This overrides the manual boolean from the DB if you prefer automated logic)
        const isCalculatedRewatch = rewatchIndex > 0;

        return {
            ...item,
            movies: movie,
            series: series,
            posts: Array.isArray(item.posts) ? item.posts[0] : item.posts,
            timeline_collaborators: (item.timeline_collaborators || []).map((collab) => ({
                ...collab,
                profiles: Array.isArray(collab.profiles) ? collab.profiles[0] : collab.profiles,
            })),

            // Inject the calculated values
            is_rewatch: isCalculatedRewatch,
            rewatch_count: rewatchIndex
        };
    });

    // 3. Reverse the array to show Newest First (Descending)
    return typedData.reverse() as TimelineEntry[];
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


/**
 * ✨ NEW: Fetches engagement data for a specific media item.
 * Returns:
 * 1. The current user's history with this item (for rewatch counts/dates).
 * 2. The history of people the user follows (social context).
 */
export async function getCinematicEngagement(userId: string, mediaType: 'movie' | 'tv', tmdbId: number) {
    noStore();
    const supabase = await createClient();

    // Determine correct column based on media type
    const column = mediaType === 'movie' ? 'movie_id' : 'series_id';

    // 1. Fetch My History (All entries for this item by current user)
    const { data: myEntries } = await supabase
        .from('timeline_entries')
        .select('*')
        .eq('user_id', userId)
        .eq(column, tmdbId)
        .order('watched_on', { ascending: false });

    // 2. Fetch Friends' History
    // A. Get list of people I follow
    const { data: following } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', userId)
        .eq('status', 'accepted'); // Ensure we only get accepted friends

    const followingIds = following?.map(f => f.following_id) || [];

    let friendEntries: TimelineEntryWithUser[] = [];

    // B. If I follow anyone, fetch their entries for this item
    if (followingIds.length > 0) {
        const { data: friendsData } = await supabase
            .from('timeline_entries')
            .select(`
                *,
                profiles:user_id (username, display_name, profile_pic_url)
            `)
            .in('user_id', followingIds)
            .eq(column, tmdbId)
            .order('watched_on', { ascending: false });

        // Cast to ensure TS is happy with the joined profile data
        if (friendsData) {
            friendEntries = friendsData as unknown as TimelineEntryWithUser[];
        }
    }

    return {
        myEntries: myEntries || [],
        friendEntries: friendEntries || [],
        watchCount: myEntries?.length || 0 // ✨ Calculated Rewatch Count
    };
}