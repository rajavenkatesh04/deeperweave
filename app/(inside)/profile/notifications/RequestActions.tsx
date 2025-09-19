// app/(inside)/profile/notifications/RequestActions.tsx

'use client';

import { useTransition } from 'react';
import { approveFollowRequest, denyFollowRequest } from '@/lib/actions/social-actions'; // Make sure this path is correct
import LoadingSpinner from '@/app/ui/loading-spinner';

export default function RequestActions({ requesterId }: { requesterId: string }) {
    const [isApproving, startApproveTransition] = useTransition();
    const [isDenying, startDenyTransition] = useTransition();

    // These functions will be called by the buttons
    const handleApprove = async () => {
        await approveFollowRequest(requesterId);
    };

    const handleDeny = async () => {
        await denyFollowRequest(requesterId);
    };

    return (
        <div className="flex items-center gap-3">
            <form action={() => startApproveTransition(handleApprove)}>
                <button
                    type="submit"
                    disabled={isApproving || isDenying}
                    className="flex h-9 w-24 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                    {isApproving ? <LoadingSpinner /> : 'Accept'}
                </button>
            </form>
            <form action={() => startDenyTransition(handleDeny)}>
                <button
                    type="submit"
                    disabled={isApproving || isDenying}
                    className="flex h-9 w-24 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                    {isDenying ? <LoadingSpinner /> : 'Reject'}
                </button>
            </form>
        </div>
    );
}