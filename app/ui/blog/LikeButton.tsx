'use client';
import { useState, useTransition } from 'react';
import { likePost, unlikePost } from '@/lib/actions/blog-actions';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

export default function LikeButton({ postId, initialLikes, userHasLiked }: { postId: string; initialLikes: number; userHasLiked: boolean; }) {
    const [isLiked, setIsLiked] = useState(userHasLiked);
    const [likeCount, setLikeCount] = useState(initialLikes);
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        if (isLiked) {
            setIsLiked(false);
            setLikeCount(c => c - 1);
            startTransition(async () => {
                const result = await unlikePost(postId);
                // Handle errors by reverting optimistic updates if needed
                if (result.error) {
                    setIsLiked(true);
                    setLikeCount(c => c + 1);
                    console.error('Failed to unlike post:', result.error);
                }
            });
        } else {
            setIsLiked(true);
            setLikeCount(c => c + 1);
            startTransition(async () => {
                const result = await likePost(postId);
                // Handle errors by reverting optimistic updates if needed
                if (result.error) {
                    setIsLiked(false);
                    setLikeCount(c => c - 1);
                    console.error('Failed to like post:', result.error);
                }
            });
        }
    };

    const Icon = isLiked ? HeartSolid : HeartOutline;
    return (
        <button onClick={handleClick} disabled={isPending} className="flex items-center gap-2 text-gray-500 transition-colors hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-500">
            <Icon className={`h-6 w-6 ${isLiked ? 'text-red-500' : ''}`} />
            <span className="font-semibold">{likeCount.toLocaleString()}</span>
        </button>
    );
}