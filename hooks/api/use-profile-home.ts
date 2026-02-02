import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

const fetchProfileHome = async (username: string) => {
    const supabase = createClient();

    // 1. Fetch Sections configured by the user
    const { data: sections, error } = await supabase
        .from('profile_sections')
        .select(`
      *,
      user:profiles!inner(username),
      items:section_items(
        *,
        movie:movies(title, poster_url, release_date),
        series:series(title, poster_url, release_date),
        person:people(name, profile_path)
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
        staleTime: 10 * 60 * 1000, // 10 mins (This changes rarely)
    });
}