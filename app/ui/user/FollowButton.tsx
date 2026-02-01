'use client';

import { useTransition } from 'react';
import { followUser, unfollowUser } from '@/lib/actions/social-actions';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
    // Minimalist border button.
    // Hover reveals "Unfollow" with a sharp icon, keeping within the zinc palette.
    if (initialFollowStatus === 'accepted') {
        return (
            <button
                onClick={handleUnfollow}
                disabled={isPending}
                className="group flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-zinc-200 bg-white px-6 text-xs font-bold uppercase tracking-wider text-zinc-900 transition-all hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-black dark:text-zinc-100 dark:hover:bg-zinc-900 dark:hover:border-zinc-700"
            >
                {isPending ? <LoadingSpinner /> : (
                    <>
                        <span className="flex items-center gap-2 group-hover:hidden">
                            Following
                        </span>
                        <span className="hidden group-hover:flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                            <XMarkIcon className="w-4 h-4" />
                            Unfollow
                        </span>
                    </>
                )}
            </button>
        );
    }

    // --- State: Requested ---
    // Muted, disabled state.
    if (initialFollowStatus === 'pending') {
        return (
            <button
                disabled
                className="flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-sm bg-zinc-100 px-6 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600"
            >
                Requested
            </button>
        );
    }

    // --- State: Not Following (Default) ---
    // High-contrast primary action (Black on Light / White on Dark).
    return (
        <button
            onClick={handleFollow}
            disabled={isPending}
            className="flex h-10 w-full items-center justify-center rounded-sm bg-zinc-900 px-6 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-transform active:scale-95 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
        >
            {isPending ? <LoadingSpinner /> : 'Follow'}
        </button>
    );
}