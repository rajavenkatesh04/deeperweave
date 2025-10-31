'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type TimelineEntry } from '@/lib/data/timeline-data';
import { StarIcon as SolidStarIcon, PlusIcon } from '@heroicons/react/24/solid';
import {
    StarIcon as OutlineStarIcon,
    CalendarDaysIcon,
    PencilSquareIcon,
    ChevronDownIcon,
    XMarkIcon,
    EllipsisVerticalIcon,
    ShareIcon,
    PencilIcon,
    TrashIcon,
    LinkIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import MovieInfoCard from '@/app/ui/blog/MovieInfoCard';
import { toast } from 'sonner';
import { deleteTimelineEntry } from '@/lib/actions/timeline-actions';

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

// Custom Dropdown Menu Component
function DropdownMenu({
                          entry,
                          username,
                          onDownload,
                          isDownloading
                      }: {
    entry: TimelineEntry;
    username: string;
    onDownload: () => void;
    isDownloading: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleEdit = () => {
        toast.info('Edit functionality coming soon!');
        setIsOpen(false);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
            return;
        }

        setIsOpen(false);
        const toastId = toast.loading('Deleting entry...');

        try {
            const result = await deleteTimelineEntry(entry.id);

            if (result.success) {
                toast.success(result.message || 'Entry deleted!', { id: toastId });
            } else {
                toast.error(result.message || 'Failed to delete entry', { id: toastId });
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('An unexpected error occurred', { id: toastId });
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/profile/${username}/timeline#entry-${entry.id}`;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        setShowShareDialog(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex-shrink-0 p-2 -m-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
                <span className="sr-only">Open entry options</span>
                <EllipsisVerticalIcon className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-2 z-50 min-w-[180px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl p-2"
                    >
                        <button
                            onClick={() => {
                                setShowShareDialog(true);
                                setIsOpen(false);
                            }}
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-left"
                        >
                            <ShareIcon className="w-4 h-4" />
                            <span>Share...</span>
                        </button>

                        <button
                            onClick={handleEdit}
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-left"
                        >
                            <PencilIcon className="w-4 h-4" />
                            <span>Edit Entry</span>
                        </button>

                        <div className="h-px bg-gray-200 dark:bg-zinc-800 my-1" />

                        <button
                            onClick={handleDelete}
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-md transition-colors text-left"
                        >
                            <TrashIcon className="w-4 h-4" />
                            <span>Delete Entry</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showShareDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowShareDialog(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-[90vw] max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Share This Entry
                                    </h3>
                                    <button
                                        onClick={() => setShowShareDialog(false)}
                                        className="p-1 rounded-full text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={onDownload}
                                        disabled={isDownloading}
                                        className="flex w-full items-center justify-center gap-3 px-4 py-3 rounded-lg bg-rose-600 text-white font-semibold shadow-sm hover:bg-rose-700 disabled:bg-rose-400 disabled:cursor-wait transition-all"
                                    >
                                        {isDownloading ? (
                                            'Generating...'
                                        ) : (
                                            <>
                                                <ArrowDownTrayIcon className="w-5 h-5" />
                                                Download for Story
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCopyLink}
                                        className="flex w-full items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                                    >
                                        <LinkIcon className="w-5 h-5" />
                                        Copy Link to Entry
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function TimelineEntryCard({
                               entry,
                               index,
                               isOwnProfile,
                               username
                           }: {
    entry: TimelineEntry;
    index: number;
    isOwnProfile: boolean;
    username: string;
}) {
    const [selectedMovie, setSelectedMovie] = useState<{ tmdb_id: number; title: string } | null>(null);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const watchedDate = new Date(entry.watched_on);
    const day = watchedDate.getDate();
    const month = watchedDate.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    const year = watchedDate.getFullYear();
    const rating = Number(entry.rating);

    const displayRating = rating % 1 === 0 ? rating.toString() : rating.toFixed(1);

    const handleDownloadShareImage = async () => {
        setIsDownloading(true);
        const toastId = toast.loading('Generating your story image...');

        try {
            const response = await fetch(`/api/timeline/share/${entry.id}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to generate image.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            const safeTitle = entry.movies.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            a.download = `deeperweave_${safeTitle}_story.png`;
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Image downloaded!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error(`Could not download image.`, { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <motion.div variants={itemVariants} className="group" id={`entry-${entry.id}`}>
                <div className="flex gap-3 sm:gap-4 md:gap-6 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-transparent dark:hover:from-zinc-800/50 dark:hover:to-transparent px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-5 rounded-none sm:rounded-xl md:rounded-2xl transition-all duration-300">
                    <motion.div
                        className="flex-shrink-0 w-20 sm:w-20 md:w-24 text-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-none tracking-tighter">
                            {day}
                        </div>
                        <div className="text-sm md:text-base font-black text-red-600 dark:text-red-400 uppercase tracking-widest mt-1 sm:mt-1.5">
                            {month}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-zinc-400 font-bold mt-0.5">
                            {year}
                        </div>
                    </motion.div>

                    <motion.div
                        className="flex-shrink-0 cursor-pointer relative group/poster"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
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
                            className="rounded-lg sm:rounded-xl object-cover shadow-lg w-[80px] h-[120px] sm:w-[85px] sm:h-[128px] md:w-[95px] md:h-[143px] ring-2 ring-gray-200 dark:ring-zinc-700 group-hover/poster:ring-red-400 dark:group-hover/poster:ring-red-500 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity rounded-lg sm:rounded-xl" />
                    </motion.div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                            <motion.h3
                                className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors leading-tight tracking-tight line-clamp-2 flex-1"
                                whileHover={{ x: 4 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                onClick={() => setSelectedMovie({
                                    tmdb_id: entry.movies.tmdb_id,
                                    title: entry.movies.title,
                                })}
                            >
                                {entry.movies.title}
                            </motion.h3>

                            {isOwnProfile && (
                                <DropdownMenu
                                    entry={entry}
                                    username={username}
                                    onDownload={handleDownloadShareImage}
                                    isDownloading={isDownloading}
                                />
                            )}
                        </div>

                        <div className="flex items-center flex-wrap gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
                            <span className="text-sm md:text-base text-gray-500 dark:text-zinc-400 font-bold">
                                {entry.movies.release_date?.split('-')[0]}
                            </span>

                            {rating > 0 && (
                                <motion.div
                                    className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-red-100 dark:border-red-900/30"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 400 }}
                                >
                                    {[1, 2, 3, 4, 5].map((starValue) => {
                                        const isFullStar = rating >= starValue;
                                        const isHalfStar = !isFullStar && rating >= starValue - 0.5;

                                        return (
                                            <motion.div
                                                key={starValue}
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{
                                                    delay: starValue * 0.05,
                                                    type: 'spring',
                                                    stiffness: 200
                                                }}
                                            >
                                                {isFullStar ? (
                                                    <SolidStarIcon className="w-4 h-4 text-red-500 drop-shadow-sm" />
                                                ) : isHalfStar ? (
                                                    <div className="relative w-4 h-4">
                                                        <OutlineStarIcon className="w-4 h-4 text-gray-300 dark:text-zinc-600 absolute" />
                                                        <SolidStarIcon className="w-4 h-4 text-red-500" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                                                    </div>
                                                ) : (
                                                    <OutlineStarIcon className="w-4 h-4 text-gray-300 dark:text-zinc-600" />
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                    <span className="ml-0.5 text-sm font-black text-gray-800 dark:text-white">
                                        {displayRating}
                                    </span>
                                </motion.div>
                            )}
                        </div>

                        {entry.notes && (
                            <motion.p
                                className="text-sm md:text-base text-gray-600 dark:text-zinc-400 italic mb-2 sm:mb-3 line-clamp-2 leading-relaxed cursor-pointer hover:text-gray-800 dark:hover:text-zinc-300 transition-colors"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                onClick={() => setShowNotesModal(true)}
                            >
                                &ldquo;{entry.notes}&rdquo;
                            </motion.p>
                        )}

                        {entry.posts?.slug && (
                            <Link
                                href={`/blog/${entry.posts.slug}`}
                                className="inline-flex items-center gap-1.5 sm:gap-2 text-sm font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors group/link w-fit"
                            >
                                <PencilSquareIcon className="w-4 h-4 group-hover/link:rotate-12 transition-transform" />
                                <span className="group-hover/link:underline decoration-2 underline-offset-2">Read Review</span>
                            </Link>
                        )}
                    </div>
                </div>

                {index < 9 && (
                    <div className="border-b border-gray-100 dark:border-zinc-800/50 ml-16 sm:ml-20 md:ml-28 my-2 sm:my-3 md:my-4" />
                )}
            </motion.div>

            <AnimatePresence>
                {showNotesModal && entry.notes && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowNotesModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 p-4 sm:p-6 flex items-start justify-between">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                                        {entry.movies.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                                        {month} {day}, {year}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowNotesModal(false)}
                                    className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-zinc-400" />
                                </button>
                            </div>
                            <div className="p-4 sm:p-6">
                                <p className="text-sm sm:text-base text-gray-700 dark:text-zinc-300 italic leading-relaxed whitespace-pre-wrap">
                                    &ldquo;{entry.notes}&rdquo;
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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

export default function TimelineDisplay({ timelineEntries, isOwnProfile, username }: { timelineEntries: TimelineEntry[]; isOwnProfile: boolean; username: string; }) {
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
                                {timelineEntries.length} {timelineEntries.length === 1 ? 'film' : 'films'} watched
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
                                    <span className="text-sm font-semibold hidden sm:inline">Log Film</span>
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
                            No films logged yet
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
                                        <span className="text-sm font-semibold">Log Your First Film</span>
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