import { useQuery } from '@tanstack/react-query';
import { fetchUserPosts } from '@/lib/actions/blog-actions';

export function usePosts(username: string) {
    return useQuery({
        queryKey: ['posts', username],
        queryFn: async () => await fetchUserPosts(username),
        staleTime: 5 * 60 * 1000,
    });
}