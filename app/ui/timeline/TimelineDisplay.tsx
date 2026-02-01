'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    PlusIcon,
    ChevronDownIcon,
    ArchiveBoxXMarkIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import TimelineEntryCard from './TimelineEntryCard';
import { TimelineEntry } from "@/lib/definitions";
import { useTimeline } from '@/hooks/api/use-timeline';
// ✨ Import your Skeleton
import { TimelineSkeletonList } from '@/app/ui/skeletons';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

export default function TimelineDisplay({
                                            username,
                                            isOwnProfile
                                        }: {
    username: string;
    isOwnProfile: boolean;
    // We removed 'initialEntries' because we want the client to fetch it for speed
}) {
    // 1. USE THE HOOK
    const { data: timelineEntries, isLoading } = useTimeline(username);

    const entries = timelineEntries || [];
    const INITIAL_ITEMS = 10;
    const ITEMS_PER_PAGE = 10;
    const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS);

    const visibleEntries = entries.slice(0, visibleCount);
    const hasMore = visibleCount < entries.length;

    const loadMore = () => {
        setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, entries.length));
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative z-10 max-w-4xl mx-auto pt-8 px-4 md:px-6">

            {/* --- HEADER --- */}
            <div className="max-w-4xl flex items-center justify-between mb-6">
                <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        Watch History {entries.length > 0 && `(${entries.length})`}
                    </h2>
                </div>

                {isOwnProfile && (
                    <Link
                        href={`/profile/${username}/timeline/create`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-xs font-bold transition-transform active:scale-95 hover:opacity-90"
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Log Entry</span>
                    </Link>
                )}
            </div>

            {/* --- LOADING STATE (The "Snappy" Fix) --- */}
            {isLoading ? (
                <TimelineSkeletonList />
            ) : entries.length > 0 ? (
                // --- DATA CONTENT ---
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-4xl">
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                            <AnimatePresence>
                                {visibleEntries.map((entry, index) => (
                                    <TimelineEntryCard
                                        key={entry.id}
                                        entry={entry}
                                        index={index}
                                        isOwnProfile={isOwnProfile}
                                        username={username}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {hasMore && (
                            <div className="flex justify-center mt-12 mb-8 relative z-20">
                                <motion.button
                                    onClick={loadMore}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group flex items-center gap-3 px-8 py-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-900 dark:text-zinc-100 transition-all rounded-sm shadow-sm"
                                >
                                    <span className="text-xs font-bold uppercase tracking-widest">Expand Log</span>
                                    <ChevronDownIcon className="w-4 h-4 text-zinc-400 group-hover:translate-y-1 transition-transform" />
                                    <span className="text-[10px] font-mono text-zinc-400 ml-2">
                                        [{entries.length - visibleCount} REMAINING]
                                    </span>
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* --- EMPTY STATE --- */
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                        <ArchiveBoxXMarkIcon className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Log Empty</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs text-center">
                        {isOwnProfile
                            ? "No cinematic data recorded. The timeline awaits its first entry."
                            : `${username} hasn't logged any watch history yet.`}
                    </p>
                    {isOwnProfile && (
                        <Link
                            href={`/profile/${username}/timeline/create`}
                            className="mt-6 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Initialize Log &rarr;
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}