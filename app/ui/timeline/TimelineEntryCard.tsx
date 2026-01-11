'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
    QrCodeIcon,
    PhotoIcon,
    DocumentTextIcon,
    PhotoIcon as PhotoSolidIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import CinematicInfoCard from '@/app/ui/blog/CinematicInfoCard';
import { toast } from 'sonner';
import { deleteTimelineEntry } from '@/lib/actions/timeline-actions';
import { TimelineEntry, UserProfile } from "@/lib/definitions";
import ImageModal from './ImageModal';
import UserProfilePopover from './UserProfilePopover';
import { googleSansCode } from "@/app/ui/fonts";

const ottPlatformDetails: { [key: string]: { logo: string; color: string } } = {
    'Netflix': { logo: '/logos/netflix.svg', color: '#E50914' },
    'Prime Video': { logo: '/logos/prime-video.svg', color: '#00A8E1' },
    'Disney+': { logo: '/logos/disney-plus.svg', color: '#113CCF' },
    'Hulu': { logo: '/logos/hulu.svg', color: '#1CE783' },
    'Max': { logo: '/logos/max.svg', color: '#0026FF' },
    'Apple TV+': { logo: '/logos/apple-tv.svg', color: '#000000' },
};

// --- COMPACT MENU ---
function DropdownMenu({
                          entry,
                          username,
                          onDownload,
                          isDownloading,
                          safeTitle
                      }: {
    entry: TimelineEntry;
    username: string;
    onDownload: (mode: 'notes' | 'clean') => void; // Updated signature
    isDownloading: boolean;
    safeTitle: string;
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
        if (!confirm('CONFIRM: PURGE ENTRY?')) return;
        setIsOpen(false);
        toast.loading('Purging...');
        await deleteTimelineEntry(entry.id);
        toast.dismiss();
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/profile/${username}/timeline#entry-${entry.id}`);
        toast.success('COORDINATES COPIED');
        setShowShareDialog(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
                <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-6 z-50 w-40 bg-white dark:bg-black border border-zinc-900 dark:border-zinc-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                    >
                        <button onClick={() => { setShowShareDialog(true); setIsOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase hover:bg-zinc-100 dark:hover:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 transition-colors text-left">
                            <ShareIcon className="w-3 h-3" /> Share
                        </button>
                        <Link
                            href={`/profile/${username}/timeline/edit/${entry.id}`}
                            className="flex w-full items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase hover:bg-zinc-100 dark:hover:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 transition-colors text-left"
                            onClick={() => setIsOpen(false)}
                        >
                            <PencilIcon className="w-3 h-3" /> Edit
                        </Link>
                        <button onClick={handleDelete} className="flex w-full items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                            <TrashIcon className="w-3 h-3" /> Purge
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Share Dialog */}
            <AnimatePresence>
                {showShareDialog && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-zinc-900/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setShowShareDialog(false)}>
                        <div className="w-full max-w-sm bg-white dark:bg-black border-2 border-zinc-900 dark:border-zinc-100 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setShowShareDialog(false)} className="absolute top-2 right-2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><XMarkIcon className="w-5 h-5" /></button>
                            <div className="flex items-center gap-2 mb-6 border-b-2 border-zinc-900 dark:border-zinc-100 pb-2">
                                <QrCodeIcon className="w-5 h-5" />
                                <h3 className="text-sm font-bold uppercase tracking-widest">Export Data</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => onDownload('notes')}
                                        disabled={isDownloading}
                                        className="flex flex-col items-center justify-center gap-2 px-2 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity border border-transparent rounded-none"
                                    >
                                        <DocumentTextIcon className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-center">With Notes</span>
                                    </button>

                                    <button
                                        onClick={() => onDownload('clean')}
                                        disabled={isDownloading}
                                        className="flex flex-col items-center justify-center gap-2 px-2 py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors rounded-none"
                                    >
                                        <PhotoSolidIcon className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-center">Poster Only</span>
                                    </button>
                                </div>

                                {isDownloading && (
                                    <div className="text-center py-1 text-[10px] font-mono animate-pulse">
                                        PROCESSING_DATA...
                                    </div>
                                )}

                                <button onClick={handleCopyLink} className="flex w-full items-center justify-center gap-3 px-4 py-3 bg-transparent border border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors rounded-none">
                                    <LinkIcon className="w-4 h-4" /> Copy Direct Link
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

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

    // Updated handler to accept mode
    const handleDownloadShareImage = async (mode: 'notes' | 'clean') => {
        setIsDownloading(true);
        toast.loading('Processing...');
        try {
            // Append mode to query string
            const response = await fetch(`/api/timeline/share/${entry.id}?mode=${mode}`);
            if (!response.ok) throw new Error('Failed.');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Differentiate filename
            a.download = `LOG_${entry.id}_${safeTitle}_${mode.toUpperCase()}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.dismiss();
        } catch (error) {
            console.error(error);
            toast.error(`Failed.`);
        } finally {
            setIsDownloading(false);
        }
    };

    const renderViewingContext = (context: string | null) => {
        if (!context) return null;
        const platform = ottPlatformDetails[context];
        let icon = <DevicePhoneMobileIcon className="w-3 h-3" />;
        if (context === 'Theatre') icon = <BuildingLibraryIcon className="w-3 h-3" />;
        else if (platform?.logo) icon = <Image src={platform.logo} alt={context} width={12} height={12} className="w-3 h-3 object-contain" />;

        return (
            <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-300 dark:border-zinc-700">
                {icon}
                <span className="truncate max-w-[70px] hidden sm:block">{context}</span>
            </div>
        );
    };

    return (
        <>
            <motion.div
                className="group relative mb-5"
                id={`entry-${entry.id}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                {/* --- CARD CONTAINER --- */}
                <div className="flex items-stretch w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">

                    {/* --- 1. DATE MONOLITH --- */}
                    <div className="flex flex-col items-center justify-center w-14 md:w-20 shrink-0 bg-black dark:bg-white text-white dark:text-black">
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80">{month}</span>
                        <span className="text-2xl md:text-4xl font-black leading-none my-0.5">{day}</span>
                        <span className="text-[10px] md:text-xs font-bold opacity-60">{year}</span>
                    </div>

                    {/* --- 2. GAP --- */}
                    <div className="w-1 shrink-0 bg-transparent"></div>

                    {/* --- 3. POSTER --- */}
                    <div
                        className="relative w-24 md:w-32 aspect-[2/3] shrink-0 cursor-pointer group/poster border-r border-zinc-200 dark:border-zinc-800"
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
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover/poster:bg-transparent transition-colors" />
                    </div>

                    {/* --- 4. DETAILS PANE (Reduced Padding) --- */}
                    <div className="flex-1 min-w-0 flex flex-col p-1.5 md:p-3 bg-white dark:bg-black">

                        {/* A. HEADER (Title & Menu) */}
                        <div className="flex justify-between items-start gap-2 mb-1">
                            <h3
                                className={`${googleSansCode.className} text-base md:text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight cursor-pointer hover:underline decoration-2 line-clamp-2`}
                                onClick={() => setSelectedItem({
                                    tmdb_id: cinematicItem.tmdb_id,
                                    title: cinematicItem.title,
                                    media_type: entry.movies ? 'movie' : 'tv'
                                })}
                            >
                                {cinematicItem.title}
                            </h3>

                            {isOwnProfile && (
                                <div className="shrink-0 -mt-1 -mr-1">
                                    <DropdownMenu
                                        entry={entry}
                                        username={username}
                                        onDownload={handleDownloadShareImage}
                                        isDownloading={isDownloading}
                                        safeTitle={safeTitle}
                                    />
                                </div>
                            )}
                        </div>

                        {/* B. NOTES (Compact, Text Only) */}
                        {entry.notes && (
                            <div
                                className="text-[10px] md:text-sm font-mono text-zinc-600 dark:text-zinc-400 line-clamp-2 md:line-clamp-3 mb-2 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                                onClick={() => setShowNotesModal(true)}
                            >
                                {entry.notes}
                            </div>
                        )}

                        {/* C. META STRIP (Rating | Collabs | Source) */}
                        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] md:text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-900">

                            {/* 1. Rating */}
                            <div className="text-zinc-900 dark:text-zinc-100">
                                {rating > 0 ? `RATED [ ${displayRating} ]` : 'UNRATED'}
                            </div>

                            {/* 2. Collaborators (Watched With) */}
                            {entry.timeline_collaborators.length > 0 && (
                                <div className="flex items-center gap-1 pl-2 border-l border-zinc-300 dark:border-zinc-700">
                                    <span className="hidden sm:inline">WITH:</span>
                                    <div className="flex -space-x-1.5">
                                        {entry.timeline_collaborators.map(collab => (
                                            collab.profiles && (
                                                <button
                                                    key={collab.profiles.id}
                                                    onClick={() => setSelectedCollaborator(collab.profiles)}
                                                    className="relative w-4 h-4 md:w-5 md:h-5 rounded-full overflow-hidden ring-1 ring-white dark:ring-black hover:z-10 hover:scale-110 transition-transform"
                                                >
                                                    <Image
                                                        src={collab.profiles.profile_pic_url || '/default-avatar.png'}
                                                        alt={collab.profiles.username}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </button>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 3. Source */}
                            {entry.viewing_context && renderViewingContext(entry.viewing_context)}

                            {/* 4. Evidence / Links (Pushed right) */}
                            <div className="ml-auto flex items-center gap-2">
                                {entry.posts?.slug && (
                                    <Link href={`/blog/${entry.posts.slug}`} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100" title="Read Log">
                                        <PencilSquareIcon className="w-3.5 h-3.5" />
                                    </Link>
                                )}
                                {entry.photo_url && (
                                    <button onClick={() => setSelectedPhotoUrl(entry.photo_url)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100" title="View Image">
                                        <PhotoIcon className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- MODALS --- */}
            <AnimatePresence>
                {showNotesModal && entry.notes && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-6" onClick={() => setShowNotesModal(false)}>
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="w-full max-w-lg bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-zinc-100 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] p-6 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setShowNotesModal(false)} className="absolute top-2 right-2"><XMarkIcon className="w-6 h-6" /></button>
                            <h3 className={`${googleSansCode.className} font-bold text-lg mb-4 pr-8`}>{cinematicItem.title}</h3>
                            <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800">
                                {entry.notes}
                            </div>
                        </motion.div>
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