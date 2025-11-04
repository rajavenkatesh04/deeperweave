'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import {
    StarIcon as OutlineStarIcon,
    PencilSquareIcon,
    XMarkIcon,
    EllipsisVerticalIcon,
    ShareIcon,
    PencilIcon,
    TrashIcon,
    LinkIcon,
    ArrowDownTrayIcon,
    ArrowPathIcon,
    BuildingLibraryIcon,
    DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import MovieInfoCard from '@/app/ui/blog/MovieInfoCard';
import { toast } from 'sonner';
import { deleteTimelineEntry } from '@/lib/actions/timeline-actions';
import { TimelineEntry, UserProfile } from "@/lib/definitions";
import ImageModal from './ImageModal';
import UserProfilePopover from './UserProfilePopover';

const ottPlatformDetails: { [key: string]: { logo: string; color: string } } = {
    'Netflix': { logo: '/logos/netflix.svg', color: '#E50914' },
    'Prime Video': { logo: '/logos/prime-video.svg', color: '#00A8E1' },
    'Disney+': { logo: '/logos/disney-plus.svg', color: '#113CCF' },
    'Hulu': { logo: '/logos/hulu.svg', color: '#1CE783' },
    'Max': { logo: '/logos/max.svg', color: '#0026FF' },
    'Apple TV+': { logo: '/logos/apple-tv.svg', color: '#000000' },
};

function DropdownMenu({ entry, username, onDownload, isDownloading }: { entry: TimelineEntry; username: string; onDownload: () => void; isDownloading: boolean; }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) return;
        setIsOpen(false);
        const toastId = toast.loading('Deleting entry...');
        try {
            const result = await deleteTimelineEntry(entry.id);
            if (result.success) toast.success(result.message || 'Entry deleted!', { id: toastId });
            else toast.error(result.message || 'Failed to delete entry', { id: toastId });
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
                        <button onClick={() => { setShowShareDialog(true); setIsOpen(false); }} className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-left"><ShareIcon className="w-4 h-4" /><span>Share...</span></button>
                        <Link
                            href={`/profile/${username}/timeline/edit/${entry.id}`}
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-left"
                            onClick={() => setIsOpen(false)}
                        >
                            <PencilIcon className="w-4 h-4" />
                            <span>Edit Entry</span>
                        </Link>
                        <div className="h-px bg-gray-200 dark:bg-zinc-800 my-1" />
                        <button onClick={handleDelete} className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-md transition-colors text-left"><TrashIcon className="w-4 h-4" /><span>Delete Entry</span></button>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showShareDialog && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowShareDialog(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-[90vw] max-w-md" onClick={(e) => e.stopPropagation()}>
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Share This Entry</h3>
                                    <button onClick={() => setShowShareDialog(false)} className="p-1 rounded-full text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                                </div>
                                <div className="space-y-4">
                                    <button onClick={onDownload} disabled={isDownloading} className="flex w-full items-center justify-center gap-3 px-4 py-3 rounded-lg bg-rose-600 text-white font-semibold shadow-sm hover:bg-rose-700 disabled:bg-rose-400 disabled:cursor-wait transition-all">
                                        {isDownloading ? 'Generating...' : (<><ArrowDownTrayIcon className="w-5 h-5" /> Download for Story</>)}
                                    </button>
                                    <button onClick={handleCopyLink} className="flex w-full items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all">
                                        <LinkIcon className="w-5 h-5" /> Copy Link to Entry
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

export const itemVariants = {
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

export default function TimelineEntryCard({
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
    const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
    const [selectedCollaborator, setSelectedCollaborator] = useState<Pick<UserProfile, 'id' | 'username' | 'profile_pic_url'> | null>(null);
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
            if (!response.ok) throw new Error('Failed to generate image.');
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

    const renderViewingContext = (context: string | null) => {
        if (!context) return null;

        const platform = ottPlatformDetails[context];

        if (context === 'Theatre') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 text-xs font-medium text-gray-700 dark:text-zinc-300">
                    <BuildingLibraryIcon className="w-3.5 h-3.5" />
                    <span>Theatre</span>
                </span>
            );
        }

        if (platform && platform.logo) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-zinc-800">
                    <Image src={platform.logo} alt={context} width={14} height={14} className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">{context}</span>
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 text-xs font-medium text-gray-700 dark:text-zinc-300">
                <DevicePhoneMobileIcon className="w-3.5 h-3.5" />
                <span>{context}</span>
            </span>
        );
    };

    return (
        <>
            <motion.div variants={itemVariants} className="group" id={`entry-${entry.id}`}>
                <div className="grid grid-cols-[auto_auto_1fr] gap-x-3 sm:gap-x-4 md:gap-x-6 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-transparent dark:hover:from-zinc-800/50 dark:hover:to-transparent px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-5 rounded-none sm:rounded-xl md:rounded-2xl transition-all duration-300">

                    <motion.div
                        className="flex-shrink-0 w-20 sm:w-20 md:w-24 text-center row-span-2"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-none tracking-tighter">{day}</div>
                        <div className="text-sm md:text-base font-black text-red-600 dark:text-red-400 uppercase tracking-widest mt-1 sm:mt-1.5">{month}</div>
                        <div className="text-sm text-gray-600 dark:text-zinc-400 font-bold mt-0.5">{year}</div>
                    </motion.div>

                    <motion.div
                        className="flex-shrink-0 cursor-pointer relative group/poster"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onClick={() => setSelectedMovie({ tmdb_id: entry.movies.tmdb_id, title: entry.movies.title })}
                    >
                        <Image src={entry.movies.poster_url || '/placeholder-poster.png'} alt={`Poster for ${entry.movies.title}`} width={80} height={120} className="rounded-lg sm:rounded-xl object-cover shadow-lg w-[80px] h-[120px] sm:w-[85px] sm:h-[128px] md:w-[95px] md:h-[143px] ring-2 ring-gray-200 dark:ring-zinc-700 group-hover/poster:ring-red-400 dark:group-hover/poster:ring-red-500 transition-all duration-300"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity rounded-lg sm:rounded-xl" />
                    </motion.div>

                    <div className="flex-1 min-w-0 flex flex-col justify-start">
                        <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                            <div className="flex-1 min-w-0">
                                <motion.h3
                                    className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors leading-tight tracking-tight line-clamp-2"
                                    whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}
                                    onClick={() => setSelectedMovie({ tmdb_id: entry.movies.tmdb_id, title: entry.movies.title })}
                                >
                                    {entry.movies.title}
                                </motion.h3>
                                {entry.is_rewatch && (
                                    <div className="mt-1">
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            <ArrowPathIcon className="w-3 h-3" />
                                            Rewatch
                                        </span>
                                    </div>
                                )}
                            </div>
                            {isOwnProfile && <DropdownMenu entry={entry} username={username} onDownload={handleDownloadShareImage} isDownloading={isDownloading} />}
                        </div>

                        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
                            <span className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
                                {entry.movies.release_date?.split('-')[0]}
                            </span>

                            {renderViewingContext(entry.viewing_context)}

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
                                            <motion.div key={starValue} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: starValue * 0.05, type: 'spring', stiffness: 200 }}>
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

                        {entry.timeline_collaborators && entry.timeline_collaborators.length > 0 && (
                            <div className="flex items-center gap-2 mt-2 sm:mt-3">
                                <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">With:</span>
                                <div className="flex -space-x-2 overflow-hidden">
                                    {entry.timeline_collaborators.map(collab => (
                                        collab.profiles ? (
                                            <button
                                                type="button"
                                                key={collab.profiles.id}
                                                title={collab.profiles.username}
                                                onClick={() => setSelectedCollaborator(collab.profiles)}
                                            >
                                                <Image
                                                    src={collab.profiles.profile_pic_url || '/default-avatar.png'}
                                                    alt={collab.profiles.username}
                                                    width={24}
                                                    height={24}
                                                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900 hover:ring-rose-500 transition-all"
                                                />
                                            </button>
                                        ) : null
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="col-start-2 col-span-2 mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                        {entry.photo_url && (
                            <motion.button
                                type="button"
                                className="w-full sm:w-48 h-auto block"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ delay: 0.3 }}
                                onClick={() => setSelectedPhotoUrl(entry.photo_url)}
                            >
                                <Image
                                    src={entry.photo_url}
                                    alt="User-uploaded photo for this entry"
                                    width={25}
                                    height={25}
                                    className="object-cover rounded-lg border dark:border-zinc-700 hover:opacity-80 transition-opacity"
                                />
                            </motion.button>
                        )}

                        {entry.notes && (
                            <motion.p
                                className="text-sm md:text-base text-gray-600 dark:text-zinc-400 italic line-clamp-3 leading-relaxed cursor-pointer hover:text-gray-800 dark:hover:text-zinc-300 transition-colors"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                onClick={() => setShowNotesModal(true)}
                            >
                                &ldquo;{entry.notes}&rdquo;
                            </motion.p>
                        )}

                        {entry.posts?.slug && (
                            <Link href={`/blog/${entry.posts.slug}`} className="inline-flex items-center gap-1.5 sm:gap-2 text-sm font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors group/link w-fit">
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNotesModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 25 }} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 p-4 sm:p-6 flex items-start justify-between">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">{entry.movies.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400">{month} {day}, {year}</p>
                                </div>
                                <button onClick={() => setShowNotesModal(false)} className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"><XMarkIcon className="w-6 h-6 text-gray-500 dark:text-zinc-400" /></button>
                            </div>
                            <div className="p-4 sm:p-6">
                                <p className="text-sm sm:text-base text-gray-700 dark:text-zinc-300 italic leading-relaxed whitespace-pre-wrap">&ldquo;{entry.notes}&rdquo;</p>
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

            {selectedPhotoUrl && (
                <ImageModal
                    imageUrl={selectedPhotoUrl}
                    onClose={() => setSelectedPhotoUrl(null)}
                />
            )}

            {selectedCollaborator && (
                <UserProfilePopover
                    user={selectedCollaborator}
                    onClose={() => setSelectedCollaborator(null)}
                />
            )}
        </>
    );
}