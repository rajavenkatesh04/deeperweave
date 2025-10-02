// @/app/ui/profile/TimelineDisplay.tsx

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type TimelineEntry } from '@/lib/data/timeline-data';
// ✅ RENAMED IMPORTS: Using aliases to distinguish between solid and outline icons
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import {
    StarIcon as OutlineStarIcon,
    CalendarDaysIcon,
    PencilSquareIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import MovieInfoCard from '@/app/ui/blog/MovieInfoCard';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 80,
            damping: 12,
        },
    },
};

// Card for a single timeline entry
function TimelineEntryCard({ entry, index }: { entry: TimelineEntry; index: number }) {
    const [selectedMovie, setSelectedMovie] = useState<{ tmdb_id: number; title: string } | null>(null);

    const watchedDate = new Date(entry.watched_on);
    const day = watchedDate.getDate();
    const month = watchedDate.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    const year = watchedDate.getFullYear();
    const rating = Number(entry.rating);

    return (
        <>
            <motion.div variants={itemVariants} className="group">
                <div className="flex gap-4 md:gap-6 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 -mx-2 md:-mx-4 px-2 md:px-4 py-3 md:py-4 rounded-xl transition-colors">
                    {/* Date Section */}
                    <div className="flex-shrink-0 w-16 md:w-20 text-center pt-1">
                        <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-none">
                            {day}
                        </div>
                        <div className="text-xs md:text-sm font-bold text-red-600 dark:text-red-500 uppercase tracking-wider mt-1">
                            {month}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 font-medium mt-0.5">
                            {year}
                        </div>
                    </div>

                    {/* Poster */}
                    <motion.div
                        className="flex-shrink-0 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedMovie({
                            tmdb_id: entry.movies.tmdb_id,
                            title: entry.movies.title,
                        })}
                    >
                        <Image
                            src={entry.movies.poster_url || '/placeholder-poster.png'}
                            alt={`Poster for ${entry.movies.title}`}
                            width={80}
                            height={120}
                            className="rounded-lg object-cover shadow-md md:w-[90px] md:h-[135px]"
                        />
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                        <h3
                            className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 cursor-pointer hover:text-red-600 dark:hover:text-red-500 transition-colors leading-tight"
                            onClick={() => setSelectedMovie({
                                tmdb_id: entry.movies.tmdb_id,
                                title: entry.movies.title,
                            })}
                        >
                            {entry.movies.title}
                        </h3>

                        <p className="text-sm md:text-base text-gray-500 dark:text-zinc-400 font-medium mb-2">
                            {entry.movies.release_date?.split('-')[0]}
                        </p>

                        {/* ✅ NEW: Star Rating Logic with Half-Star Icon */}
                        {rating > 0 && (
                            <div className="flex items-center gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((starValue) => {
                                    if (rating >= starValue) {
                                        // Full star
                                        return <SolidStarIcon key={starValue} className="w-4 h-4 md:w-5 md:h-5 text-red-500" />;
                                    }
                                    if (rating >= starValue - 0.5) {
                                        // Half star (using clip-path to show half of a solid star)
                                        return <SolidStarIcon key={starValue} className="w-4 h-4 md:w-5 md:h-5 text-red-500" style={{ clipPath: 'inset(0 50% 0 0)' }}/>;
                                    }
                                    // Empty star
                                    return <OutlineStarIcon key={starValue} className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-zinc-600" />;
                                })}
                                <span className="ml-1 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                                    {rating.toFixed(1)}/5
                                </span>
                            </div>
                        )}

                        {entry.notes && (
                            <p className="text-sm md:text-base text-gray-600 dark:text-zinc-400 italic mb-2 line-clamp-2">
                                &ldquo;{entry.notes}&rdquo;
                            </p>
                        )}

                        {entry.posts?.slug && (
                            <Link
                                href={`/blog/${entry.posts.slug}`}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition-colors"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                                Read Review
                            </Link>
                        )}
                    </div>
                </div>

                {index < 9 && (
                    <div className="border-b border-gray-200 dark:border-zinc-800 ml-20 md:ml-24 my-2 md:my-3" />
                )}
            </motion.div>

            {selectedMovie && (
                <MovieInfoCard
                    movieApiId={selectedMovie.tmdb_id}
                    initialMovieData={entry.movies}
                    isOpen={true}
                    onClose={() => setSelectedMovie(null)}
                />
            )}
        </>
    );
}

// Main display component with pagination
export default function TimelineDisplay({ timelineEntries }: { timelineEntries: TimelineEntry[] }) {
    const INITIAL_ITEMS = 10;
    const ITEMS_PER_PAGE = 10;
    const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS);

    const visibleEntries = timelineEntries.slice(0, visibleCount);
    const hasMore = visibleCount < timelineEntries.length;

    const loadMore = () => {
        setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, timelineEntries.length));
    };

    return (
        <section>
            {timelineEntries.length > 0 ? (
                <>
                    <div className={`flex`}>
                        <div className="mb-6 md:mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Watch History
                            </h2>
                            <p className="text-sm md:text-base text-gray-600 dark:text-zinc-400">
                                {timelineEntries.length} {timelineEntries.length === 1 ? 'film' : 'films'} watched
                            </p>
                        </div>

                        <div>
                            <Link href={`/timeline/create`}>
                                + add new entry
                            </Link>
                        </div>
                    </div>

                    <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        <AnimatePresence>
                            {visibleEntries.map((entry, index) => (
                                <TimelineEntryCard key={entry.id} entry={entry} index={index} />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {hasMore && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center mt-8 md:mt-12"
                        >
                            <motion.button
                                onClick={loadMore}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border-2 border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all"
                            >
                                <span>Show More</span>
                                <ChevronDownIcon className="w-5 h-5" />
                                <span className="text-sm text-gray-600 dark:text-zinc-400">
                                    ({timelineEntries.length - visibleCount} more)
                                </span>
                            </motion.button>
                        </motion.div>
                    )}
                </>
            ) : (
                <motion.div
                    className="text-center py-16 md:py-24 px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="max-w-sm mx-auto">
                        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                            <CalendarDaysIcon className="w-8 h-8 md:w-10 md:h-10 text-gray-400 dark:text-zinc-600" />
                        </div>
                        <p className="text-lg md:text-xl text-gray-700 dark:text-zinc-300 font-semibold mb-2">
                            No films logged yet
                        </p>

                        <div  className={`p-6 bg-red-400/10 dark:bg-red-500/10 rounded-lg shadow-md text-center`}>
                            <Link href={`/LogMovieForm`}>
                                + add new entry
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </section>
    );
}