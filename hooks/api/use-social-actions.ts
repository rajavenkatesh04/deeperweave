import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likePost, unlikePost } from '@/lib/actions/blog-actions';
import { toast } from 'sonner';

export function useLikePost(postId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (isLiked: boolean) => isLiked ? unlikePost(postId) : likePost(postId),
        onMutate: async (isLiked) => {
            // cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['post-likes', postId] });

            // snapshot previous value
            const previousData = queryClient.getQueryData(['post-likes', postId]);

            // optimistic update
            queryClient.setQueryData(['post-likes', postId], (old: any) => ({
                ...old,
                isLiked: !isLiked,
                count: isLiked ? old.count - 1 : old.count + 1,
            }));

            return { previousData };
        },
        onError: (err, newLike, context) => {
            queryClient.setQueryData(['post-likes', postId], context?.previousData);
            toast.error("Failed to update like");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['post-likes', postId] });
        }
    });
}