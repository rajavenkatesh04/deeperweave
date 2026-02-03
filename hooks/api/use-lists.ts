import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

const fetchUserLists = async (username: string) => {
    const supabase = createClient();

    // 1. Fetch Lists with their Entries (Movies/Series)
    const { data, error } = await supabase
        .from('lists')
        .select(`
      *,
      owner:profiles!inner(username, display_name),
      list_entries(
        rank,
        movie:movies(poster_url),
        series:series(poster_url)
      )
    `)
        .eq('owner.username', username)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error("Supabase Lists Error:", JSON.stringify(error, null, 2));
        throw error;
    }

    // 2. Normalize Data to match 'ListSummary' interface
    return (data || []).map((list: any) => {
        const owner = Array.isArray(list.owner) ? list.owner[0] : list.owner;
        const rawEntries = list.list_entries || [];

        // Sort items by rank so the best ones appear in the preview
        rawEntries.sort((a: any, b: any) => (a.rank || 0) - (b.rank || 0));

        // 🛠️ THE FIX: Generate 'preview_items' as Objects, not Strings
        const previewItems = rawEntries
            .slice(0, 4) // Take top 4
            .map((entry: any) => {
                const m = Array.isArray(entry.movie) ? entry.movie[0] : entry.movie;
                const s = Array.isArray(entry.series) ? entry.series[0] : entry.series;

                return {
                    poster_url: m?.poster_url || s?.poster_url || null
                };
            })
            .filter((item: any) => item.poster_url !== null);

        return {
            ...list,
            owner,
            item_count: rawEntries.length,
            preview_items: previewItems, // ✅ Matches your UI exactly
        };
    });
};

export function useLists(username: string) {
    return useQuery({
        queryKey: ['lists', username],
        queryFn: () => fetchUserLists(username),
        staleTime: 5 * 60 * 1000,
    });
}