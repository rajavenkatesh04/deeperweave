'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/solid';
import { CalendarDaysIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import TimelineEntryCard from './TimelineEntryCard';
import {TimelineEntry} from "@/lib/definitions";

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
        <section className="-mx-4 sm:mx-0">
            {timelineEntries.length > 0 ? (
                <>
                    <div className="mb-4 sm:mb-6 md:mb-8 px-2 sm:px-0 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                                Watch History
                            </h2>
                            <p className="text-sm md:text-base text-gray-600 dark:text-zinc-400">
                                {timelineEntries.length} {timelineEntries.length === 1 ? 'entry' : 'entries'} logged
                            </p>
                        </div>
                        {isOwnProfile && (
                            <Link href={`/profile/${username}/timeline/create`} passHref>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-rose-600 text-white rounded-lg shadow-sm hover:bg-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 dark:focus:ring-offset-zinc-900"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    <span className="text-sm font-semibold hidden sm:inline">Log Entry</span>
                                </motion.button>
                            </Link>
                        )}
                    </div>

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
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center mt-6 sm:mt-8 md:mt-12"
                        >
                            <motion.button
                                onClick={loadMore}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border-2 border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all text-sm sm:text-base"
                            >
                                <span>Show More</span>
                                <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400">
                                    ({timelineEntries.length - visibleCount} more)
                                </span>
                            </motion.button>
                        </motion.div>
                    )}
                </>
            ) : (
                <motion.div
                    className="text-center py-12 sm:py-16 md:py-24 px-2 sm:px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="max-w-sm mx-auto">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                            <CalendarDaysIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400 dark:text-zinc-600" />
                        </div>
                        <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-zinc-300 font-semibold mb-2">
                            No entries logged yet
                        </p>
                        {isOwnProfile && (
                            <div className="mt-6">
                                <Link href={`/profile/${username}/timeline/create`} passHref>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center mx-auto gap-2 px-5 py-3 bg-rose-600 text-white rounded-lg shadow-sm hover:bg-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 dark:focus:ring-offset-zinc-900"
                                    >
                                        <PlusIcon className="h-5 w-5" />
                                        <span className="text-sm font-semibold">Log Your First Entry</span>
                                    </motion.button>
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </section>
    );
}