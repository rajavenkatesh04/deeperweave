import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

export interface SavedItemDisplay {
    id: string;
    item_type: 'movie' | 'series' | 'person';
    created_at: string;
    details: {
        tmdb_id: number;
        title: string;
        image_url: string | null;
        subtitle: string | null;
    };
}

const fetchSavedItems = async (userId: string) => {
    const supabase = createClient();

    // 1. Fetch with "Forgiving" Joins (Removed strict !name tags)
    // Supabase will automatically find the Foreign Key connection.
    const { data, error } = await supabase
        .from('saved_items')
        .select(`
      *,
      movie:movies(*),
      series:series(*),
      person:people(*)
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Saved Items Error:", JSON.stringify(error, null, 2));
        throw error;
    }

    // 2. Normalize
    return (data || []).map((item: any) => {
        // Flatten Arrays
        const movie = Array.isArray(item.movie) ? item.movie[0] : item.movie;
        const series = Array.isArray(item.series) ? item.series[0] : item.series;
        const person = Array.isArray(item.person) ? item.person[0] : item.person;

        let title = 'Unknown';
        let image_url = null;
        let subtitle = 'N/A';
        let tmdb_id = 0;

        if (movie) {
            title = movie.title;
            image_url = movie.poster_url;
            subtitle = movie.release_date ? movie.release_date.split('-')[0] : 'Film';
            tmdb_id = movie.tmdb_id;
        } else if (series) {
            title = series.title;
            image_url = series.poster_url;
            subtitle = series.release_date ? series.release_date.split('-')[0] : 'TV';
            tmdb_id = series.tmdb_id;
        } else if (person) {
            title = person.name;
            image_url = person.profile_path;
            subtitle = 'Star';
            tmdb_id = person.tmdb_id;
        }

        return {
            id: item.id,
            item_type: item.item_type,
            created_at: item.created_at,
            details: { tmdb_id, title, image_url, subtitle }
        };
    });
};

export function useSavedItems(userId: string) {
    return useQuery({
        queryKey: ['saved-items', userId],
        queryFn: () => fetchSavedItems(userId),
        staleTime: 5 * 60 * 1000,
        enabled: !!userId,
    });
}