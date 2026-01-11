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
    QrCodeIcon,
    PhotoIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import CinematicInfoCard from '@/app/ui/blog/CinematicInfoCard';
import { toast } from 'sonner';
import { deleteTimelineEntry } from '@/lib/actions/timeline-actions';
import { TimelineEntry, UserProfile } from "@/lib/definitions";
import ImageModal from './ImageModal';
import UserProfilePopover from './UserProfilePopover';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import clsx from 'clsx';

const ottPlatformDetails: { [key: string]: { logo: string; color: string } } = {
    'Netflix': { logo: '/logos/netflix.svg', color: '#E50914' },
    'Prime Video': { logo: '/logos/prime-video.svg', color: '#00A8E1' },
    'Disney+': { logo: '/logos/disney-plus.svg', color: '#113CCF' },
    'Hulu': { logo: '/logos/hulu.svg', color: '#1CE783' },
    'Max': { logo: '/logos/max.svg', color: '#0026FF' },
    'Apple TV+': { logo: '/logos/apple-tv.svg', color: '#000000' },
};

// --- COMPACT MENU ---
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
                                <h3 className="text-sm font-bold uppercase tracking-widest">Export</h3>
                            </div>
                            <div className="space-y-3">
                                <button onClick={onDownload} disabled={isDownloading} className="flex w-full items-center justify-center gap-3 px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity border border-transparent rounded-none">
                                    {isDownloading ? 'Processing...' : (<><ArrowDownTrayIcon className="w-4 h-4" /> Download Card</>)}
                                </button>
                                <button onClick={handleCopyLink} className="flex w-full items-center justify-center gap-3 px-4 py-3 bg-transparent border border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors rounded-none">
                                    <LinkIcon className="w-4 h-4" /> Copy Link
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

    const handleDownloadShareImage = async () => {
        setIsDownloading(true);
        toast.loading('Processing...');
        try {
            const response = await fetch(`/api/timeline/share/${entry.id}`);
            if (!response.ok) throw new Error('Failed.');
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
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-500 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 bg-white dark:bg-zinc-900">
                {icon}
                <span className="truncate max-w-[60px]">{context}</span>
            </div>
        );
    };

    return (
        <>
            <motion.div
                className="group relative mb-4"
                id={`entry-${entry.id}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <div className="flex w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">

                    {/* --- 1. THE POWER DATE (High Contrast Monolith) --- */}
                    <div className="flex flex-col items-center justify-center w-14 md:w-20 shrink-0 bg-black dark:bg-white text-white dark:text-black py-2 md:py-4">
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80">{month}</span>
                        <span className="text-2xl md:text-4xl font-black leading-none my-0.5">{day}</span>
                        <span className="text-[10px] md:text-xs font-bold opacity-60">{year}</span>
                    </div>

                    {/* --- 2. MAIN CONTENT AREA --- */}
                    <div className="flex-1 flex flex-col min-w-0">

                        <div className="flex p-2 md:p-4 gap-3 md:gap-5">
                            {/* POSTER (Full Color, Compact on Mobile) */}
                            <div
                                className="relative shrink-0 w-12 md:w-20 aspect-[2/3] border border-zinc-200 dark:border-zinc-800 cursor-pointer shadow-sm"
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
                                    className="object-cover" // FULL COLOR
                                />
                            </div>

                            {/* TEXT DATA */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <div>
                                    <div className="flex justify-between items-start">
                                        {/* Title */}
                                        <h3
                                            className={`${PlayWriteNewZealandFont.className} text-base md:text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight cursor-pointer hover:underline decoration-2 line-clamp-2 pr-2`}
                                            onClick={() => setSelectedItem({
                                                tmdb_id: cinematicItem.tmdb_id,
                                                title: cinematicItem.title,
                                                media_type: entry.movies ? 'movie' : 'tv'
                                            })}
                                        >
                                            {cinematicItem.title}
                                        </h3>

                                        {/* Menu (Desktop only, mobile moves below or stays compact) */}
                                        {isOwnProfile && (
                                            <div className="shrink-0 -mr-1 -mt-1">
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

                                    {/* Sub-header: Stars & Context */}
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        {rating > 0 ? (
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <SolidStarIcon
                                                        key={i}
                                                        className={`w-3 h-3 md:w-3.5 md:h-3.5 ${rating >= i + 1 ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-200 dark:text-zinc-800'}`}
                                                    />
                                                ))}
                                            </div>
                                        ) : <span className="text-[10px] text-zinc-400">NO RATING</span>}

                                        <div className="hidden md:block w-px h-3 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
                                        {renderViewingContext(entry.viewing_context)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- 3. FOOTER (Notes, Collabs, Evidence) --- */}
                        {/* Only show if there's content to keep mobile compact */}
                        {(entry.notes || entry.photo_url || entry.timeline_collaborators.length > 0) && (
                            <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2 flex items-center justify-between gap-3 text-xs">

                                <div className="flex items-center gap-3 overflow-hidden">
                                    {/* Collaborators (Full Color) */}
                                    {entry.timeline_collaborators.length > 0 && (
                                        <div className="flex -space-x-1.5 shrink-0">
                                            {entry.timeline_collaborators.map(collab => (
                                                collab.profiles && (
                                                    <button
                                                        key={collab.profiles.id}
                                                        onClick={() => setSelectedCollaborator(collab.profiles)}
                                                        className="relative w-5 h-5 md:w-6 md:h-6 border border-white dark:border-black rounded-full overflow-hidden hover:z-10 hover:scale-110 transition-transform"
                                                    >
                                                        <Image
                                                            src={collab.profiles.profile_pic_url || '/default-avatar.png'}
                                                            alt={collab.profiles.username}
                                                            fill
                                                            className="object-cover" // Full Color
                                                        />
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    )}

                                    {/* Note Snippet */}
                                    {entry.notes && (
                                        <div
                                            className="flex items-center gap-1.5 cursor-pointer group/note text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 truncate"
                                            onClick={() => setShowNotesModal(true)}
                                        >
                                            <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 shrink-0" />
                                            <span className="font-mono text-[10px] md:text-xs truncate max-w-[150px] md:max-w-xs">{entry.notes}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Evidence Icon / Link */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {entry.posts?.slug && (
                                        <Link href={`/blog/${entry.posts.slug}`} className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </Link>
                                    )}
                                    {entry.photo_url && (
                                        <button onClick={() => setSelectedPhotoUrl(entry.photo_url)} className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                                            <PhotoIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* --- MODALS (Kept Sharp) --- */}
            <AnimatePresence>
                {showNotesModal && entry.notes && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-6" onClick={() => setShowNotesModal(false)}>
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="w-full max-w-lg bg-white dark:bg-zinc-950 border-2 border-zinc-900 dark:border-zinc-100 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] p-6 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setShowNotesModal(false)} className="absolute top-2 right-2"><XMarkIcon className="w-6 h-6" /></button>
                            <h3 className="font-bold text-lg mb-4 pr-8">{cinematicItem.title}</h3>
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