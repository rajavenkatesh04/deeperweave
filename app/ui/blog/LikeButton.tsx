'use client';

import { useQuery } from '@tanstack/react-query';
import { useLikePost } from '@/hooks/api/use-social-actions'; // Import the hook we created
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
    // 1. READ from the Global Cache (replaces useState)
    // We use 'initialData' so it renders instantly with data from the server
    const { data } = useQuery({
        queryKey: ['post-likes', postId],
        // This sets the default values in the cache if they don't exist yet
        initialData: { isLiked: userHasLiked, count: initialLikes },
        // (Optional) If you have a fetcher to get the latest like count, add queryFn here
        staleTime: Infinity, // For now, trust the server data + our optimistic updates
    });

    // 2. WRITE using the Mutation Hook (replaces useTransition & manual rollback)
    const { mutate, isPending } = useLikePost(postId);

    const handleClick = () => {
        // We just tell the hook "toggle the current state"
        // The hook handles the optimistic update (instant red heart) automatically
        mutate(data.isLiked);
    };

    const Icon = data.isLiked ? HeartSolid : HeartOutline;

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className="flex items-center gap-2 text-gray-500 transition-colors duration-200 ease-in-out hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-400 dark:hover:text-red-500"
            aria-label={data.isLiked ? 'Unlike post' : 'Like post'}
        >
            {/* The icon now reacts to the Global Cache 'data.isLiked' */}
            <Icon className={`h-6 w-6 transition-all duration-150 ${data.isLiked ? 'text-red-500 scale-110' : 'scale-100'}`} />

            {/* The count also comes from the cache, so it stays in sync everywhere */}
            <span className="font-semibold">{data.count.toLocaleString()}</span>
        </button>
    );
}