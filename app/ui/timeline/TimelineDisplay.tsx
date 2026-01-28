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
                                            timelineEntries,
                                            isOwnProfile,
                                            username
                                        }: {
    timelineEntries: TimelineEntry[];
    isOwnProfile: boolean;
    username: string;
}) {
    const INITIAL_ITEMS = 10;
    const ITEMS_PER_PAGE = 10;
    const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS);

    const visibleEntries = timelineEntries.slice(0, visibleCount);
    const hasMore = visibleCount < timelineEntries.length;

    const loadMore = () => {
        setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, timelineEntries.length));
    };

    return (
        // 1. APPLIED REFERENCE WRAPPER CLASSES HERE FOR EXACT ALIGNMENT
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative z-10 max-w-7xl mx-auto pt-8 px-4 md:px-6">

            {/* --- COMPACT HEADER SECTION --- */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        Watch History ({timelineEntries.length})
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

            {/* --- CONTENT SECTION --- */}
            {timelineEntries.length > 0 ? (
                <div className="flex flex-col items-center">
                    {/* Inner wrapper for cards to keep them readable (not too wide), but centered in the 7xl container */}
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

                        {/* --- LOAD MORE BUTTON --- */}
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
                                        [{timelineEntries.length - visibleCount} REMAINING]
                                    </span>
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* --- EMPTY STATE (Matched to ProfileListsPage Style) --- */
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