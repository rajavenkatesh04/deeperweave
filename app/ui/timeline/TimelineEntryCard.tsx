'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import {
    PencilSquareIcon,
    XMarkIcon,
    EllipsisVerticalIcon,
    ShareIcon,
    PencilIcon,
    TrashIcon,
    LinkIcon,
    ArrowDownTrayIcon,
    BuildingLibraryIcon,
    DevicePhoneMobileIcon,
    TvIcon,
    FilmIcon,
    ChatBubbleBottomCenterTextIcon,
    QrCodeIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import CinematicInfoCard from '@/app/ui/blog/CinematicInfoCard';
import { toast } from 'sonner';
import { deleteTimelineEntry } from '@/lib/actions/timeline-actions';
import { TimelineEntry, UserProfile } from "@/lib/definitions";
import ImageModal from './ImageModal';
import UserProfilePopover from './UserProfilePopover';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

const ottPlatformDetails: { [key: string]: { logo: string; color: string } } = {
    'Netflix': { logo: '/logos/netflix.svg', color: '#E50914' },
    'Prime Video': { logo: '/logos/prime-video.svg', color: '#00A8E1' },
    'Disney+': { logo: '/logos/disney-plus.svg', color: '#113CCF' },
    'Hulu': { logo: '/logos/hulu.svg', color: '#1CE783' },
    'Max': { logo: '/logos/max.svg', color: '#0026FF' },
    'Apple TV+': { logo: '/logos/apple-tv.svg', color: '#000000' },
};

// --- SHARP DROPDOWN MENU ---
function DropdownMenu({ entry, username, onDownload, isDownloading, safeTitle }: { entry: TimelineEntry; username: string; onDownload: () => void; isDownloading: boolean; safeTitle: string; }) {
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
        if (!confirm('CONFIRM PROTOCOL: Delete log entry?')) return;
        setIsOpen(false);
        toast.loading('Executing purge...');
        await deleteTimelineEntry(entry.id);
        toast.dismiss();
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/profile/${username}/timeline#entry-${entry.id}`);
        toast.success('Coordinates acquired.');
        setShowShareDialog(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 rounded-sm"
            >
                <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-2 z-50 min-w-[180px] bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-1"
                    >
                        <button onClick={() => { setShowShareDialog(true); setIsOpen(false); }} className="flex w-full items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors text-left border-b border-zinc-100 dark:border-zinc-900">
                            <ShareIcon className="w-4 h-4" /><span>Share Data</span>
                        </button>
                        <Link
                            href={`/profile/${username}/timeline/edit/${entry.id}`}
                            className="flex w-full items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors text-left border-b border-zinc-100 dark:border-zinc-900"
                            onClick={() => setIsOpen(false)}
                        >
                            <PencilIcon className="w-4 h-4" />
                            <span>Edit Log</span>
                        </Link>
                        <button onClick={handleDelete} className="flex w-full items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left">
                            <TrashIcon className="w-4 h-4" /><span>Purge Entry</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Share Dialog (Sharp) */}
            <AnimatePresence>
                {showShareDialog && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowShareDialog(false)}>
                        <div className="w-full max-w-sm bg-white dark:bg-black border-2 border-zinc-900 dark:border-zinc-100 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] relative" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setShowShareDialog(false)} className="absolute top-2 right-2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><XMarkIcon className="w-5 h-5" /></button>
                            <h3 className="text-lg font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                                <QrCodeIcon className="w-5 h-5" /> Export Data
                            </h3>
                            <div className="space-y-3">
                                <button onClick={onDownload} disabled={isDownloading} className="flex w-full items-center justify-center gap-3 px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all border border-black dark:border-white">
                                    {isDownloading ? 'Compiling...' : (<><ArrowDownTrayIcon className="w-4 h-4" /> Download Asset</>)}
                                </button>
                                <button onClick={handleCopyLink} className="flex w-full items-center justify-center gap-3 px-4 py-3 border border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
                                    <LinkIcon className="w-4 h-4" /> Copy Coordinates
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "linear" } },
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
    const cinematicItem = entry.movies || entry.series;
    const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
    const [selectedCollaborator, setSelectedCollaborator] = useState<Pick<UserProfile, 'id' | 'username' | 'profile_pic_url'> | null>(null);
    const [selectedItem, setSelectedItem] = useState<{ tmdb_id: number; title: string; media_type: 'movie' | 'tv' } | null>(null);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!cinematicItem) return null;

    const watchedDate = new Date(entry.watched_on);
    const day = watchedDate.getDate().toString().padStart(2, '0');
    const month = watchedDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const year = watchedDate.getFullYear();
    const rating = Number(entry.rating);
    const displayRating = rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
    const safeTitle = cinematicItem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const handleDownloadShareImage = async () => {
        setIsDownloading(true);
        toast.loading('Initiating download...');
        try {
            const response = await fetch(`/api/timeline/share/${entry.id}`);
            if (!response.ok) throw new Error('Generation failed.');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `LOG_${entry.id}_${safeTitle}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.dismiss();
        } catch (error) {
            console.error(error);
            toast.error(`Download failed.`);
        } finally {
            setIsDownloading(false);
        }
    };

    const renderViewingContext = (context: string | null) => {
        if (!context) return null;
        const platform = ottPlatformDetails[context];

        let icon = <DevicePhoneMobileIcon className="w-3.5 h-3.5" />;
        if (context === 'Theatre') icon = <BuildingLibraryIcon className="w-3.5 h-3.5" />;
        else if (platform?.logo) icon = <Image src={platform.logo} alt={context} width={14} height={14} className="w-3.5 h-3.5 grayscale" />;

        return (
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 px-2 py-1 bg-zinc-100 dark:bg-zinc-800/50">
                {icon}
                <span className="font-mono">{context}</span>
            </div>
        );
    };
    return (
        <>
            <motion.div
                // variants={itemVariants}
                className="group relative mb-6"
                id={`entry-${entry.id}`}
            >
                {/* --- CONNECTOR LINE (Sharp, dashed) --- */}
                <div className="absolute left-[2.5rem] md:left-[3.5rem] top-0 bottom-0 w-px border-l border-dashed border-zinc-300 dark:border-zinc-700 -z-10 group-last:h-16" />

                <div className="flex gap-4 md:gap-6 items-start">

                    {/* --- 1. DATE ANCHOR (Technical Block) --- */}
                    <div className="w-10 md:w-14 shrink-0 flex flex-col items-center py-2 z-10 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-100">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest leading-none mb-0.5">{month}</span>
                        <span className="text-xl md:text-2xl font-black leading-none font-mono">{day}</span>
                        <span className="text-[9px] font-mono font-bold leading-none mt-0.5">{year}</span>
                    </div>

                    {/* --- 2. MAIN DATA SLATE (Sharp, High Contrast) --- */}
                    <div className="flex-1 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 p-3 md:p-4 relative group/card shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] transition-shadow">

                        <div className="flex gap-3 md:gap-5">

                            {/* POSTER (Sharp, Full Color, Technical Hover) */}
                            <div
                                className="relative shrink-0 w-[75px] md:w-[90px] aspect-[2/3] border border-zinc-900 dark:border-zinc-100 cursor-pointer group/poster overflow-hidden"
                                onClick={() => setSelectedItem({
                                    tmdb_id: cinematicItem.tmdb_id,
                                    title: cinematicItem.title,
                                    media_type: entry.movies ? 'movie' : 'tv'
                                })}
                            >
                                <Image
                                    src={cinematicItem.poster_url || '/placeholder-poster.png'}
                                    alt={cinematicItem.title}
                                    fill
                                    className="object-cover" // Full color
                                />
                                {/* Technical Scanline Overlay on Hover */}
                                <div className="absolute inset-0 bg-zinc-900/80 dark:bg-zinc-100/20 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center bg-[url('/scanline.png')] bg-cover blend-overlay">
                                    <ArrowPathIcon className="w-6 h-6 text-white animate-pulse" />
                                </div>
                            </div>

                            {/* DATA CONSOLE */}
                            <div className="flex-1 min-w-0 flex flex-col gap-2">

                                {/* Header Row */}
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        {/* Type Badge */}
                                        <div className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-zinc-100 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 px-1.5 py-0.5 font-mono mb-1">
                                            {entry.movies ? 'FILM' : 'TV_SERIES'}
                                            {entry.is_rewatch && <span className="text-rose-400 ml-1">// REWATCH</span>}
                                        </div>

                                        {/* Title */}
                                        <h3
                                            className={`${PlayWriteNewZealandFont.className} text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight cursor-pointer hover:underline decoration-2 underline-offset-2 line-clamp-2`}
                                            onClick={() => setSelectedItem({
                                                tmdb_id: cinematicItem.tmdb_id,
                                                title: cinematicItem.title,
                                                media_type: entry.movies ? 'movie' : 'tv'
                                            })}
                                        >
                                            {cinematicItem.title}
                                        </h3>
                                    </div>

                                    {isOwnProfile && (
                                        <DropdownMenu
                                            entry={entry}
                                            username={username}
                                            onDownload={handleDownloadShareImage}
                                            isDownloading={isDownloading}
                                            safeTitle={safeTitle}
                                        />
                                    )}
                                </div>

                                {/* Data Readout Row */}
                                <div className="flex flex-wrap items-center gap-2 mt-1 p-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs">
                                    {rating > 0 ? (
                                        <div className="flex items-center gap-1 pr-2 border-r border-zinc-300 dark:border-zinc-700">
                                            <span className="text-[9px] uppercase text-zinc-500">RATING:</span>
                                            <div className="flex gap-0.5 text-amber-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <SolidStarIcon key={i} className={`w-3 h-3 ${rating >= i + 1 ? 'opacity-100' : 'opacity-20'}`} />
                                                ))}
                                            </div>
                                            <span className="font-bold">{displayRating}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[9px] uppercase text-zinc-400 pr-2 border-r border-zinc-300 dark:border-zinc-700">NO_RATING_DATA</span>
                                    )}

                                    <div className="flex items-center gap-1">
                                        <span className="text-[9px] uppercase text-zinc-500">SOURCE:</span>
                                        {renderViewingContext(entry.viewing_context) || <span className="text-[9px] text-zinc-400">UNKNOWN</span>}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Footer: Notes & Evidence (Sharp Separation) */}
                        {(entry.notes || entry.photo_url || entry.posts?.slug || (entry.timeline_collaborators && entry.timeline_collaborators.length > 0)) && (
                            <div className="mt-3 pt-2 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 flex justify-between items-end gap-4">

                                <div className="space-y-2 flex-1">
                                    {/* Collaborators */}
                                    {entry.timeline_collaborators && entry.timeline_collaborators.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-mono uppercase text-zinc-500">With:</span>
                                            <div className="flex -space-x-2">
                                                {entry.timeline_collaborators.map(collab => (
                                                    collab.profiles && (
                                                        <button
                                                            key={collab.profiles.id}
                                                            onClick={() => setSelectedCollaborator(collab.profiles)}
                                                            className="relative w-5 h-5 border border-zinc-900 dark:border-zinc-100 overflow-hidden hover:z-10 hover:scale-110 transition-transform bg-zinc-100"
                                                        >
                                                            <Image
                                                                src={collab.profiles.profile_pic_url || '/default-avatar.png'}
                                                                alt={collab.profiles.username}
                                                                fill
                                                                className="object-cover grayscale"
                                                            />
                                                        </button>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Notes Snippet */}
                                    {entry.notes && (
                                        <div
                                            className="group/note cursor-pointer flex items-start gap-1"
                                            onClick={() => setShowNotesModal(true)}
                                        >
                                            <span className="text-[9px] font-mono uppercase text-zinc-500 mt-0.5">NOTE:</span>
                                            <p className="text-xs text-zinc-800 dark:text-zinc-200 font-mono line-clamp-1 group-hover/note:underline">
                                                {entry.notes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Review Link */}
                                    {entry.posts?.slug && (
                                        <Link
                                            href={`/blog/${entry.posts.slug}`}
                                            className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100 hover:underline decoration-2 font-mono"
                                        >
                                            <PencilSquareIcon className="w-3 h-3" />
                                            <span>Read Full Log Entry </span>
                                        </Link>
                                    )}
                                </div>

                                {/* Attached Evidence (Sharp Thumbnail) */}
                                {entry.photo_url && (
                                    <button
                                        onClick={() => setSelectedPhotoUrl(entry.photo_url)}
                                        className="relative w-12 h-12 border border-zinc-900 dark:border-zinc-100 hover:opacity-80 transition-opacity shrink-0 bg-zinc-100"
                                    >
                                        <Image
                                            src={entry.photo_url}
                                            alt="Evidence"
                                            fill
                                            className="object-cover grayscale"
                                        />
                                        <div className="absolute bottom-0right-0 bg-zinc-900 text-white text-[7px] font-mono uppercase px-1">IMG</div>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* --- SHARP MODALS --- */}
            <AnimatePresence>
                {showNotesModal && entry.notes && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowNotesModal(false)}>
                        <div className="w-full max-w-lg bg-white dark:bg-black border-2 border-zinc-900 dark:border-zinc-100 p-6 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]" onClick={(e) => e.stopPropagation()}>
                            <div className="absolute top-0 left-0 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-[10px] font-mono uppercase px-2 py-1">Log Entry Note</div>
                            <button onClick={() => setShowNotesModal(false)} className="absolute top-2 right-2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"><XMarkIcon className="w-5 h-5" /></button>

                            <h3 className={`${PlayWriteNewZealandFont.className} text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 mt-6`}>{cinematicItem.title}</h3>
                            <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                                {entry.notes}
                            </div>
                            <div className="mt-4 text-[10px] font-mono uppercase text-zinc-500">
                                TIMESTAMP: {year}-{month}-{day} // ID: {entry.id}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedItem && (
                <CinematicInfoCard
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