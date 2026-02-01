import { useQuery } from '@tanstack/react-query';
import {fetchPodiumSections} from "@/lib/actions/profile-actions";


export function useProfileSections(username: string) {
    return useQuery({
        queryKey: ['profile-sections', username],
        queryFn: async () => await fetchPodiumSections(username),
        // Data stays "fresh" for 30 minutes.
        staleTime: 30 * 60 * 1000,
    });
}