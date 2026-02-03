import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { TimelineEntry } from '@/lib/definitions';

const fetchUserTimeline = async (username: string) => {
    const supabase = createClient();

    // 1. Fetch
    const { data, error } = await supabase
        .from('timeline_entries')
        .select(`
      *,
      user:profiles!timeline_entries_user_id_fkey!inner(username, display_name, profile_pic_url),
      movies:movies(*),
      series:series(*),
      timeline_collaborators(*, profiles(id, username, display_name, profile_pic_url))
    `)
        .eq('user.username', username)
        .order('watched_on', { ascending: true })
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Supabase Timeline Error:", JSON.stringify(error, null, 2));
        throw error;
    }

    // 2. Normalize
    const counts: Record<string, number> = {};

    const normalizedData = (data || []).map((item: any) => {
        // Flatten Main Data
        const movie = Array.isArray(item.movies) ? item.movies[0] : item.movies;
        const series = Array.isArray(item.series) ? item.series[0] : item.series;
        const user = Array.isArray(item.user) ? item.user[0] : item.user;

        // Flatten Collaborators (The Fix for your Error)
        const collaborators = (item.timeline_collaborators || []).map((collab: any) => ({
            ...collab,
            // Ensure the nested profile is an object, not an array
            profiles: Array.isArray(collab.profiles) ? collab.profiles[0] : collab.profiles
        }));

        // Calculate Rewatches
        const mediaKey = movie ? `movie_${movie.tmdb_id}` : (series ? `tv_${series.tmdb_id}` : null);
        let rewatchIndex = 0;

        if (mediaKey) {
            counts[mediaKey] = (counts[mediaKey] || 0) + 1;
            rewatchIndex = counts[mediaKey] - 1;
        }

        return {
            ...item,
            movies: movie || null,
            series: series || null,
            profiles: user || null,
            timeline_collaborators: collaborators, // ✅ Now defined
            is_rewatch: rewatchIndex > 0,
            rewatch_count: rewatchIndex
        };
    });

    return normalizedData.reverse() as unknown as TimelineEntry[];
};

export function useTimeline(username: string) {
    return useQuery({
        queryKey: ['timeline', username],
        queryFn: () => fetchUserTimeline(username),
        staleTime: 5 * 60 * 1000,
    });
}