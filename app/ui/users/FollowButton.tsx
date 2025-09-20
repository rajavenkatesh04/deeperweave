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

    // --- State: Following ---
    // A more subtle, secondary-style button.
    // On hover, it changes to a pinkish hue as a visual cue for the "unfollow" action.
    if (initialFollowStatus === 'accepted') {
        return (
            <button
                onClick={handleUnfollow}
                disabled={isPending}
                className="group flex h-10 w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm transition-colors duration-200 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-rose-800 dark:hover:bg-rose-950 dark:hover:text-rose-400"
            >
                {isPending ? <LoadingSpinner /> : (
                    <>
                        <span className="group-hover:hidden">Following</span>
                        <span className="hidden group-hover:block text-rose-500 dark:text-rose-400">Unfollow</span>
                    </>
                )}
            </button>
        );
    }

    // --- State: Requested ---
    // A disabled, muted button to show a pending state.
    if (initialFollowStatus === 'pending') {
        return (
            <button
                disabled
                className="flex h-10 w-full cursor-not-allowed items-center justify-center rounded-lg border border-gray-200 bg-gray-100 px-4 text-sm font-medium text-gray-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-500"
            >
                Requested
            </button>
        );
    }

    // --- State: Not Following (Default) ---
    // The primary action button with a vibrant gradient.
    return (
        <button
            onClick={handleFollow}
            disabled={isPending}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:from-pink-600 hover:to-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 disabled:opacity-75"
        >
            {isPending ? <LoadingSpinner /> : 'Follow'}
        </button>
    );
}
