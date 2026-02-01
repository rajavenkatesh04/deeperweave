import { useQuery } from '@tanstack/react-query';
import { fetchUserLists } from '@/lib/actions/list-actions';

export function useLists(username: string) {
    return useQuery({
        queryKey: ['lists', username],
        queryFn: async () => await fetchUserLists(username),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}