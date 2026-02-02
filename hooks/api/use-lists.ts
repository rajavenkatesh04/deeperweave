import { useQuery } from '@tanstack/react-query';
import { fetchUserLists } from '@/lib/actions/list-actions';

export function useLists(username: string) {
    return useQuery({
        // Unique key: ['lists', 'raj']
        queryKey: ['lists', username],

        // Fetcher: Calls the Server Action
        queryFn: async () => await fetchUserLists(username),

        // Data stays fresh for 5 minutes
        staleTime: 5 * 60 * 1000,
    });
}