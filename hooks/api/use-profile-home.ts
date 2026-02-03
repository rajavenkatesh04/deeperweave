import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

const fetchProfileHome = async (username: string) => {
    const supabase = createClient();

    // ⚡️ FIX: Use (*) wildcard for joined tables.
    // This fetches ALL columns (including tmdb_id) and avoids syntax errors.
    const { data: sections, error } = await supabase
        .from('profile_sections')
        .select(`
            *,
            user:profiles!inner(username),
            items:section_items(
                *,
                movie:movies(*),
                series:series(*),
                person:people(*)
            )
        `)
        .eq('user.username', username)
        .order('rank', { ascending: true });

    if (error) throw error;
    return sections;
};

export function useProfileHome(username: string) {
    return useQuery({
        queryKey: ['profile-home', username],
        queryFn: () => fetchProfileHome(username),
        staleTime: 10 * 60 * 1000,
    });
}