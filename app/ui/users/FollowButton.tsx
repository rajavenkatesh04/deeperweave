// app/(inside)/profile/[username]/FollowButton.tsx

'use client';

import { useTransition } from 'react';
import { followUser, unfollowUser } from '@/lib/actions/social-actions';
import LoadingSpinner from '@/app/ui/loading-spinner';

type FollowStatus = 'not_following' | 'pending' | 'accepted';

export default function FollowButton({
                                         profileId,
                                            isPrivate,
                                         initialFollowStatus,
                                     }: {
    profileId: string;
    isPrivate: boolean;
    initialFollowStatus: FollowStatus;
}) {
    const [isPending, startTransition] = useTransition();

    const handleFollow = () => {
        startTransition(() => {
            followUser(profileId, isPrivate);
        });
    };

    const handleUnfollow = () => {
        startTransition(() => {
            unfollowUser(profileId);
        });
    };

    // Render different buttons based on the status
    if (initialFollowStatus === 'accepted') {
        return (
            <button
                onClick={handleUnfollow}
                disabled={isPending}
                className="flex h-9 w-28 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
                {isPending ? <LoadingSpinner /> : 'Following'}
            </button>
        );
    }

    if (initialFollowStatus === 'pending') {
        return (
            <button
                disabled
                className="flex h-9 w-28 cursor-not-allowed items-center justify-center rounded-lg border border-gray-300 bg-gray-100 px-4 text-sm font-medium text-gray-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
            >
                Requested
            </button>
        );
    }

    // Default case is 'not_following'
    return (
        <button
            onClick={handleFollow}
            disabled={isPending}
            className="flex h-9 w-28 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
            {isPending ? <LoadingSpinner /> : 'Follow'}
        </button>
    );
}