import { useQuery } from '@tanstack/react-query';
import { fetchUserTimeline } from '@/lib/actions/timeline-actions';
import { TimelineEntry } from '@/lib/definitions';

export function useTimeline(username: string, initialData?: TimelineEntry[]) {
    return useQuery({
        // Unique key: ['timeline', 'raj']
        queryKey: ['timeline', username],

        // Fetcher: Calls the Server Action
        queryFn: async () => await fetchUserTimeline(username),

        // Hybrid Magic: Use Server Data first (Instant Load)
        initialData: initialData,

        // Data stays fresh for 5 minutes
        staleTime: 5 * 60 * 1000,
    });
}