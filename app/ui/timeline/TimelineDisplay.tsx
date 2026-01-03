'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusIcon, ChevronDownIcon, ClockIcon, FilmIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import TimelineEntryCard from './TimelineEntryCard';
import { TimelineEntry } from "@/lib/definitions";
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

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
        <section className="relative min-h-[50vh] pb-12">

            {/* --- HEADER SECTION --- */}
            {timelineEntries.length > 0 ? (
                <>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-2 sm:px-0">
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
                                <ClockIcon className="w-4 h-4" />
                                <span>Temporal Log</span>
                            </div>
                            <h2 className={`${PlayWriteNewZealandFont.className} text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 leading-none`}>
                                Watch History
                            </h2>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Entry Counter */}
                            <div className="hidden md:block text-right border-r border-zinc-200 dark:border-zinc-800 pr-6">
                                <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">
                                    Total Entries
                                </p>
                                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 leading-none font-mono">
                                    {timelineEntries.length.toString().padStart(3, '0')}
                                </p>
                            </div>

                            {/* Create Button */}
                            {isOwnProfile && (
                                <Link href={`/profile/${username}/timeline/create`} passHref>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-sm shadow-md transition-all"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Log Entry</span>
                                    </motion.button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* --- ENTRIES LIST --- */}
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
                </>
            ) : (
                /* --- EMPTY STATE --- */
                <motion.div
                    className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-20 h-20 border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center rotate-45 mb-8 bg-white dark:bg-black">
                        <ArchiveBoxXMarkIcon className="w-10 h-10 text-zinc-400 dark:text-zinc-600 -rotate-45" />
                    </div>

                    <h3 className="text-xl font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                        Log Empty
                    </h3>
                    <p className="text-sm font-mono text-zinc-500 mt-2 mb-8">
                        // No cinematic data recorded in this sector.
                    </p>

                    {isOwnProfile && (
                        <Link href={`/profile/${username}/timeline/create`} passHref>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest rounded-sm shadow-lg hover:shadow-xl transition-all"
                            >
                                <PlusIcon className="h-4 w-4" />
                                <span>Initialize Log</span>
                            </motion.button>
                        </Link>
                    )}
                </motion.div>
            )}
        </section>
    );
}