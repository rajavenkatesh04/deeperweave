// app/(inside)/profile/notifications/RequestActions.tsx
'use client';

import { useTransition } from 'react';
import { approveFollowRequest, denyFollowRequest } from '@/lib/actions/social-actions';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export default function RequestActions({ requesterId }: { requesterId: string }) {
    const [isApproving, startApproveTransition] = useTransition();
    const [isDenying, startDenyTransition] = useTransition();

    const handleApprove = async () => {
        await approveFollowRequest(requesterId);
    };

    const handleDeny = async () => {
        await denyFollowRequest(requesterId);
    };

    const isPending = isApproving || isDenying;

    // Common styles:
    // - Mobile: h-9 w-9 (Square)
    // - Desktop: w-auto px-4 (Rectangle with text)
    const buttonBase = "group flex h-9 w-9 md:w-auto md:px-3 items-center justify-center rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed";

    // Typography for the text label (hidden on mobile)
    const labelClass = "hidden md:inline-block ml-2 text-[10px] font-bold uppercase tracking-widest";

    return (
        <div className="flex items-center gap-2">

            {/* --- ACCEPT BUTTON --- */}
            <form action={() => startApproveTransition(handleApprove)}>
                <button
                    type="submit"
                    disabled={isPending}
                    className={clsx(
                        buttonBase,
                        // Colors: Solid Black/White -> Hover: Dark Grey
                        "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 hover:shadow-md hover:-translate-y-0.5",
                        "dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
                    )}
                    title="Accept"
                >
                    {isApproving ? (
                        <LoadingSpinner className="h-4 w-4" />
                    ) : (
                        <>
                            <CheckIcon className="w-5 h-5" />
                            <span className={labelClass}>Accept</span>
                        </>
                    )}
                </button>
            </form>

            {/* --- REJECT BUTTON --- */}
            <form action={() => startDenyTransition(handleDeny)}>
                <button
                    type="submit"
                    disabled={isPending}
                    className={clsx(
                        buttonBase,
                        // Colors: Transparent/Grey -> Hover: Red Border & Text (Destructive hint)
                        "border border-zinc-200 bg-transparent text-zinc-400",
                        "hover:border-red-500 hover:bg-red-50 hover:text-red-600",
                        "dark:border-zinc-800 dark:hover:border-red-400 dark:hover:bg-red-900/10 dark:hover:text-red-400"
                    )}
                    title="Reject"
                >
                    {isDenying ? (
                        <LoadingSpinner className="h-4 w-4" />
                    ) : (
                        <>
                            <XMarkIcon className="w-5 h-5" />
                            <span className={labelClass}>Reject</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}