'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    EllipsisHorizontalIcon,
    ShareIcon,
    PencilIcon,
    TrashIcon,
    PhotoIcon,
    StarIcon,
    ArrowPathIcon,
    LinkIcon,
    XMarkIcon,
    QrCodeIcon,
    DocumentTextIcon,
    PhotoIcon as PhotoSolidIcon,
    TicketIcon,
    TvIcon
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import MediaInfoCard from '@/app/ui/blog/MediaInfoCard';
import { toast } from 'sonner';
import { deleteTimelineEntry } from '@/lib/actions/timeline-actions';
import { TimelineEntry, UserProfile } from "@/lib/definitions";
import ImageModal from './ImageModal';
import UserProfilePopover from './UserProfilePopover';
import { geistSans } from "@/app/ui/fonts";

// --- HELPER: Platform Badge ---

const PlatformBadge = ({ platform }: { platform: string }) => {
    // Normalize string to lowercase for matching
    const p = platform.toLowerCase().trim();

    let config = {
        bg: 'bg-zinc-100 dark:bg-zinc-800',
        text: 'text-zinc-600 dark:text-zinc-400',
        icon: null as React.ReactNode,
        label: platform
    };

    // Platform Configuration Map
    if (p.includes('netflix')) {
        config = { bg: 'bg-black', text: 'text-[#E50914]', icon: <Image src="/logos/netflix.svg" alt="Netflix" width={50} height={14} className="h-3.5 w-auto object-contain" />, label: 'Netflix' };
    } else if (p.includes('prime') || p.includes('amazon')) {
        config = { bg: 'bg-[#00A8E1]', text: 'text-white', icon: <Image src="/logos/prime-video.svg" alt="Prime Video" width={50} height={14} className="h-3.5 w-auto object-contain brightness-0 invert" />, label: 'Prime' };
    } else if (p.includes('disney')) {
        config = { bg: 'bg-[#113CCF]', text: 'text-white', icon: <Image src="/logos/disney-plus.svg" alt="Disney+" width={50} height={16} className="h-4 w-auto object-contain" />, label: 'Disney+' };
    } else if (p.includes('hulu')) {
        config = { bg: 'bg-[#1CE783]', text: 'text-black', icon: <Image src="/logos/hulu.svg" alt="Hulu" width={50} height={14} className="h-3 w-auto object-contain" />, label: 'Hulu' };
    } else if (p.includes('max') || p.includes('hbo')) {
        config = { bg: 'bg-[#002BE7]', text: 'text-white', icon: <Image src="/logos/max.svg" alt="Max" width={50} height={14} className="h-3.5 w-auto object-contain brightness-0 invert" />, label: 'Max' };
    } else if (p.includes('apple') || p.includes('tv+')) {
        // ✨ CHANGED: Set to white background with black text
        config = {
            bg: 'bg-white',
            text: 'text-black',
            icon: <Image src="/logos/apple-tv.svg" alt="Apple TV" width={50} height={14} className="h-3.5 w-auto object-contain" />,
            label: 'Apple TV'
        };
    } else if (p.includes('cinema') || p.includes('theater')) {
        config = { bg: 'bg-rose-600', text: 'text-white', icon: <TicketIcon className="w-3.5 h-3.5" />, label: 'Cinema' };
    } else if (p.includes('tv') || p.includes('television')) {
        config = { bg: 'bg-zinc-800', text: 'text-zinc-300', icon: <TvIcon className="w-3.5 h-3.5" />, label: 'TV' };
    }

    return (
        <div className={`inline-flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-sm ${config.bg} shadow-sm border border-black/5 dark:border-white/5`}>
            {config.icon ? config.icon : <span className={`text-[10px] font-bold uppercase tracking-wide ${config.text}`}>{config.label}</span>}
        </div>
    );
};

// --- ACTION MENU ---

function ActionMenu({
                        entry,
                        username,
                        onDownload,
                        isDownloading,
                    }: {
    entry: TimelineEntry;
    username: string;
    onDownload: (mode: 'notes' | 'clean') => void;
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
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this log?')) return;
        setIsOpen(false);
        toast.promise(deleteTimelineEntry(entry.id), {
            loading: 'Deleting...',
            success: 'Entry deleted',
            error: 'Failed to delete'
        });
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/profile/${username}/timeline#entry-${entry.id}`);
        toast.success('Link copied to clipboard');
        setShowShareDialog(false);
    };

    return (
        <div className="relative shrink-0" ref={dropdownRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
                <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5, x: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        className="absolute right-0 top-8 w-36 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg z-20 py-1 ring-1 ring-black/5"
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowShareDialog(true); setIsOpen(false); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                            <ShareIcon className="w-3.5 h-3.5" /> Share
                        </button>
                        <Link
                            href={`/profile/${username}/timeline/edit/${entry.id}`}
                            className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        >
                            <PencilIcon className="w-3.5 h-3.5" /> Edit
                        </Link>
                        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                            <TrashIcon className="w-3.5 h-3.5" /> Delete
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Share Modal */}
            <AnimatePresence>
                {showShareDialog && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={(e) => { e.stopPropagation(); setShowShareDialog(false); }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-2xl relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setShowShareDialog(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"><XMarkIcon className="w-5 h-5" /></button>

                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md">
                                    <QrCodeIcon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Share Log</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button onClick={() => onDownload('notes')} disabled={isDownloading} className="flex flex-col items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
                                    <DocumentTextIcon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">With Notes</span>
                                </button>
                                <button onClick={() => onDownload('clean')} disabled={isDownloading} className="flex flex-col items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
                                    <PhotoSolidIcon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Poster Only</span>
                                </button>
                            </div>

                            {isDownloading && <p className="text-center text-[10px] text-zinc-400 animate-pulse mb-3 font-medium tracking-wide">GENERATING IMAGE...</p>}

                            <button onClick={handleCopyLink} className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-md text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg">
                                <LinkIcon className="w-4 h-4" /> Copy Link
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- MAIN CARD COMPONENT ---

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
    const cinematicItem = entry.movies || entry.series;
    const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
    const [selectedCollaborator, setSelectedCollaborator] = useState<Pick<UserProfile, 'id' | 'username' | 'profile_pic_url'> | null>(null);
    const [selectedItem, setSelectedItem] = useState<{ tmdb_id: number; title: string; media_type: 'movie' | 'tv' } | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);

    if (!cinematicItem) return null;

    // Readable Date: "Sun, Oct 25, 2023"
    const dateObj = new Date(entry.watched_on);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const rating = Number(entry.rating);
    const displayRating = rating % 1 === 0 ? rating.toString() : rating.toFixed(1);

    const rewatchCount = (entry as any).rewatch_count || 0;
    const isRewatch = (entry as any).is_rewatch || rewatchCount > 0;

    const releaseYear = (cinematicItem.release_date)?.split('-')[0];
    const safeTitle = cinematicItem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const handleDownloadShareImage = async (mode: 'notes' | 'clean') => {
        setIsDownloading(true);
        toast.loading('Generating share image...');
        try {
            const response = await fetch(`/api/timeline/share/${entry.id}?mode=${mode}`);
            if (!response.ok) throw new Error('Failed.');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${safeTitle}_${mode}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.dismiss();
            toast.success('Image saved');
        } catch (error) {
            console.error(error);
            toast.error('Error generating image.');
        } finally {
            setIsDownloading(false);
        }
    };

    const openDetails = () => setSelectedItem({
        tmdb_id: cinematicItem.tmdb_id,
        title: cinematicItem.title,
        media_type: entry.movies ? 'movie' : 'tv'
    });

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                className="group relative w-full mb-4"
                id={`entry-${entry.id}`}
            >
                <div className="flex flex-row w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">

                    {/* POSTER */}
                    <div
                        className="relative w-24 min-h-[140px] md:w-32 shrink-0 cursor-pointer bg-zinc-100 dark:bg-zinc-900"
                        onClick={openDetails}
                    >
                        <Image
                            src={cinematicItem.poster_url || '/placeholder-poster.png'}
                            alt={cinematicItem.title}
                            fill
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 flex flex-col p-4 min-w-0 relative">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs uppercase tracking-wide font-semibold text-zinc-500 dark:text-zinc-500 italic">
                                {formattedDate}
                            </span>
                            {isOwnProfile && (
                                <ActionMenu
                                    entry={entry}
                                    username={username}
                                    onDownload={handleDownloadShareImage}
                                    isDownloading={isDownloading}
                                />
                            )}
                        </div>

                        {/* Title */}
                        <div className="flex items-baseline gap-2 mb-2 pr-6">
                            <h3
                                className="text-base md:text-lg font-bold leading-tight text-zinc-900 dark:text-zinc-100 cursor-pointer hover:underline decoration-zinc-300 underline-offset-2 truncate"
                                onClick={openDetails}
                                title={cinematicItem.title}
                            >
                                {cinematicItem.title}
                            </h3>
                            {releaseYear && (
                                <span className="text-sm font-normal text-zinc-400 shrink-0">
                                    ({releaseYear})
                                </span>
                            )}
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 mb-2.5">

                            {/* Rating */}
                            {rating > 0 && (
                                <div className="flex items-center gap-1 font-bold text-zinc-900 dark:text-zinc-100">
                                    <StarIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
                                    <span>{displayRating}</span>
                                </div>
                            )}

                            {/* Separator */}
                            {(rating > 0 && entry.viewing_context) && <span className="text-zinc-300 dark:text-zinc-700">•</span>}

                            {/* Platform Logo/Badge */}
                            {entry.viewing_context && (
                                <PlatformBadge platform={entry.viewing_context} />
                            )}

                            {/* Separator */}
                            {((rating > 0 || entry.viewing_context) && isRewatch) && <span className="text-zinc-300 dark:text-zinc-700">•</span>}

                            {/* Rewatch Badge */}
                            {isRewatch && (
                                <div
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 font-bold uppercase tracking-wider text-[10px]"
                                    title={`You have rewatched this ${rewatchCount} times`}
                                >
                                    <ArrowPathIcon className="w-3 h-3 stroke-[3]" />
                                    <span>
                                        {rewatchCount > 0 ? `Rewatch ${rewatchCount}` : 'Rewatch'}
                                    </span>
                                </div>
                            )}

                            {/* Separator */}
                            {((rating > 0 || entry.viewing_context || isRewatch) && entry.timeline_collaborators.length > 0) && <span className="text-zinc-300 dark:text-zinc-700">•</span>}

                            {/* Collaborators */}
                            {entry.timeline_collaborators.length > 0 && (
                                <div className="flex -space-x-1">
                                    {entry.timeline_collaborators.slice(0, 3).map(collab => (
                                        collab.profiles && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                key={collab.profiles.id}
                                                src={collab.profiles.profile_pic_url || '/placeholder-user.jpg'}
                                                alt={collab.profiles.username}
                                                className="w-4 h-4 rounded-sm ring-1 ring-white dark:ring-zinc-950 object-cover hover:scale-110 hover:z-10 transition-transform cursor-pointer"
                                                onClick={(e) => {e.stopPropagation(); setSelectedCollaborator(collab.profiles)}}
                                                title={collab.profiles.username}
                                            />
                                        )
                                    ))}
                                </div>
                            )}

                            {/* Separator */}
                            {((rating > 0 || entry.viewing_context || isRewatch || entry.timeline_collaborators.length > 0) && entry.photo_url) && <span className="text-zinc-300 dark:text-zinc-700">•</span>}

                            {/* Photo */}
                            {entry.photo_url && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedPhotoUrl(entry.photo_url); }}
                                    className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors"
                                >
                                    <PhotoIcon className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Notes Preview */}
                        {entry.notes && (
                            <div
                                className="mb-2 group/notes cursor-pointer"
                                onClick={() => setShowNotesModal(true)}
                                title="Click to read full notes"
                            >
                                <p className={`text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-2 group-hover/notes:text-zinc-900 dark:group-hover/notes:text-zinc-100 transition-colors ${geistSans.className}`}>
                                    {entry.notes}
                                </p>
                            </div>
                        )}

                        {/* Review Link */}
                        {entry.posts?.slug && (
                            <div className="mt-auto pt-1">
                                <Link href={`/blog/${entry.posts.slug}`} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                                    <LinkIcon className="w-3 h-3" />
                                    <span>Read Review</span>
                                </Link>
                            </div>
                        )}

                    </div>
                </div>
            </motion.div>

            {/* --- MODALS --- */}

            <AnimatePresence>
                {showNotesModal && entry.notes && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6"
                    >
                        <div
                            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
                            onClick={() => setShowNotesModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                transition: { type: "spring", duration: 0.5, bounce: 0.3 }
                            }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="shrink-0 flex items-start gap-4 p-5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
                                <div className="relative w-12 h-16 shrink-0 rounded-sm overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800">
                                    <Image
                                        src={cinematicItem.poster_url || '/placeholder-poster.png'}
                                        alt="Poster"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight truncate pr-8">
                                        {cinematicItem.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                        <span className="font-medium">{formattedDate}</span>
                                        {rating > 0 && (
                                            <>
                                                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                                <div className="flex items-center gap-1 text-zinc-900 dark:text-zinc-100 font-semibold">
                                                    <StarIcon className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
                                                    {displayRating}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowNotesModal(false)}
                                    className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="overflow-y-auto p-5 custom-scrollbar">
                                <div className={`${geistSans.className} text-base leading-relaxed text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap`}>
                                    {entry.notes}
                                </div>
                            </div>
                            <div className="shrink-0 h-4 bg-gradient-to-t from-white dark:from-zinc-950 to-transparent pointer-events-none" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedItem && (
                <MediaInfoCard
                    tmdbId={selectedItem.tmdb_id}
                    mediaType={selectedItem.media_type}
                    initialData={selectedItem.media_type === 'movie' ? entry.movies! : entry.series!}
                    isOpen={true}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            {selectedPhotoUrl && <ImageModal imageUrl={selectedPhotoUrl} onClose={() => setSelectedPhotoUrl(null)} />}
            {selectedCollaborator && <UserProfilePopover user={selectedCollaborator} onClose={() => setSelectedCollaborator(null)} />}
        </>
    );
}