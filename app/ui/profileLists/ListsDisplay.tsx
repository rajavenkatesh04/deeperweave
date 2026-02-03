'use client';

import { useLists } from '@/hooks/api/use-lists';
import ProfileListCard from './ProfileListCard';
import Link from 'next/link';
import { PlusIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import { ProfileListsSkeletonGrid } from "@/app/ui/skeletons";

export default function ListsDisplay({
                                         username,
                                         isOwnProfile
                                     }: {
    username: string;
    isOwnProfile: boolean;
}) {
    // 1. USE THE HOOK
    const { data: lists, isLoading } = useLists(username);

    // 2. LOADING STATE
    if (isLoading) {
        return (
            <div className="w-full max-w-4xl mx-auto pt-8 px-4 md:px-3 pb-20">
                {/* --- Header Skeleton --- */}
                <div className="flex items-center justify-between mb-6">
                    {/* Title Skeleton (e.g. "Lists (4)") */}
                    <div className="h-7 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />

                    {/* Button Skeleton (e.g. "New List") */}
                    <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                </div>

                {/* --- Grid Skeleton --- */}
                <ProfileListsSkeletonGrid />
            </div>
        );
    }

    // 3. EMPTY STATE
    if (!lists || lists.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/20 max-w-4xl mx-auto mt-8 mx-4">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                    <ArchiveBoxXMarkIcon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No Lists Yet</h3>
                <p className="text-xs text-zinc-500 mt-1 mb-6 max-w-xs text-center">
                    {isOwnProfile
                        ? "Start curating your favorite collections. Create your first list now."
                        : `${username} hasn't created any lists.`}
                </p>
                {isOwnProfile && (
                    <Link
                        href="/lists/create"
                        className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 rounded-full text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                        <PlusIcon className="w-4 h-4" /> Create List
                    </Link>
                )}
            </div>
        );
    }

    // 4. DATA CONTENT
    return (
        <div className="w-full max-w-4xl mx-auto pt-8 px-4 pb-20">
            {/* --- Header Section --- */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Lists ({lists.length})
                </h2>

                {/* Always show button here if it is your profile */}
                {isOwnProfile && (
                    <Link
                        href="/lists/create"
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-xs font-bold transition-transform active:scale-95 hover:opacity-90"
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Create List</span>
                    </Link>
                )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lists.map((list: any) => (
                    <ProfileListCard
                        key={list.id}
                        list={list}
                        // ✨ FIXED: Passed the isOwner prop correctly
                        isOwner={isOwnProfile}
                    />
                ))}
            </div>
        </div>
    );
}