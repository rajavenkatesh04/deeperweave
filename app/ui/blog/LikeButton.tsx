'use client';
import { useState, useTransition } from 'react';
import { toast } from 'sonner'; // Ensure toast is imported
import { likePost, unlikePost } from '@/lib/actions/blog-actions';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

export default function LikeButton({
                                       postId,
                                       initialLikes,
                                       userHasLiked
                                   }: {
    postId: string;
    initialLikes: number;
    userHasLiked: boolean;
}) {
    const [isLiked, setIsLiked] = useState(userHasLiked);
    const [likeCount, setLikeCount] = useState(initialLikes);
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        if (isLiked) {
            // Optimistic unlike
            setIsLiked(false);
            setLikeCount(c => c - 1);
            startTransition(async () => {
                const result = await unlikePost(postId);
                if (result.error) {
                    // Revert on error and show toast
                    setIsLiked(true);
                    setLikeCount(c => c + 1);
                    toast.error(result.error); // Show error toast from server
                }
            });
        } else {
            // Optimistic like
            setIsLiked(true);
            setLikeCount(c => c + 1);
            startTransition(async () => {
                const result = await likePost(postId);
                if (result.error) {
                    // Revert on error and show toast
                    setIsLiked(false);
                    setLikeCount(c => c - 1);
                    toast.error(result.error); // Show error toast from server
                }
            });
        }
    };

    const Icon = isLiked ? HeartSolid : HeartOutline;
    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className="flex items-center gap-2 text-gray-500 transition-colors duration-200 ease-in-out hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-400 dark:hover:text-red-500"
            aria-label={isLiked ? 'Unlike post' : 'Like post'}
        >
            <Icon className={`h-6 w-6 transition-all duration-150 ${isLiked ? 'text-red-500 scale-110' : 'scale-100'}`} />
            <span className="font-semibold">{likeCount.toLocaleString()}</span>
        </button>
    );
}
