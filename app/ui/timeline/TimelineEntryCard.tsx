'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import {
    PencilSquareIcon,
    XMarkIcon,
    EllipsisHorizontalIcon,
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
    TvIcon,
    FilmIcon
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

// --- SHARP, TECHNICAL DROPDOWN ---
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
        if (!confirm('CONFIRM DELETION: Purge this record?')) return;
        setIsOpen(false);
        toast.loading('Purging record...');
        await deleteTimelineEntry(entry.id);
        toast.dismiss();
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/profile/${username}/timeline#entry-${entry.id}`);
        toast.success('Coordinates copied.');
        setShowShareDialog(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 text-zinc-400 hover:text-black dark:hover:text-white border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all rounded-none"
            >
                <EllipsisHorizontalIcon className="w-6 h-6" />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-1 z-50 w-[180px] bg-white dark:bg-zinc-950 border border-zinc-900 dark:border-zinc-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                    >
                        <button onClick={() => { setShowShareDialog(true); setIsOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors border-b border-zinc-100 dark:border-zinc-800">
                            <ShareIcon className="w-4 h-4" /><span>Share Data</span>
                        </button>
                        <Link
                            href={`/profile/${username}/timeline/edit/${entry.id}`}
                            className="flex w-full items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors border-b border-zinc-100 dark:border-zinc-800"
                            onClick={() => setIsOpen(false)}
                        >
                            <PencilIcon className="w-4 h-4" />
                            <span>Edit Log</span>
                        </Link>
                        <button onClick={handleDelete} className="flex w-full items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                            <TrashIcon className="w-4 h-4" /><span>Purge</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Share Dialog (Sharp Modal) */}
            <AnimatePresence>
                {showShareDialog && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-zinc-900/80 backdrop-blur-[2px] z-[70] flex items-center justify-center p-4" onClick={() => setShowShareDialog(false)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-sm bg-white dark:bg-black border-2 border-zinc-900 dark:border-zinc-100 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setShowShareDialog(false)} className="absolute top-2 right-2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><XMarkIcon className="w-5 h-5" /></button>

                            <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                                <QrCodeIcon className="w-5 h-5" />
                                <h3 className="text-sm font-bold uppercase tracking-widest">Export Record</h3>
                            </div>

                            <div className="space-y-3">
                                <button onClick={onDownload} disabled={isDownloading} className="flex w-full items-center justify-center gap-3 px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)] active:translate-y-0 active:shadow-none transition-all border border-transparent">
                                    {isDownloading ? (
                                        <span className="animate-pulse">Processing...</span>
                                    ) : (
                                        <><ArrowDownTrayIcon className="w-4 h-4" /> Save Image Card</>
                                    )}
                                </button>
                                <button onClick={handleCopyLink} className="flex w-full items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-black text-black dark:text-white border-2 border-zinc-900 dark:border-zinc-100 text-xs font-bold uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                    <LinkIcon className="w-4 h-4" /> Copy Direct Link
                                </button>
                            </div>
                        </motion.div>
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
        toast.loading('Compiling visual data...');
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
        else if (platform?.logo) icon = <Image src={platform.logo} alt={context} width={14} height={14} className="w-3.5 h-3.5 grayscale contrast-125" />;

        return (
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 border-l border-zinc-300 dark:border-zinc-700 pl-3 ml-3">
                {icon}
                <span className="font-mono">{context}</span>
            </div>
        );
    };

    return (
        <>
            <motion.div
                className="group relative mb-10 last:mb-0"
                id={`entry-${entry.id}`}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
            >
                {/* --- SHARP TIMELINE LINE (Dashed) --- */}
                <div className="absolute left-[2.2rem] md:left-[3rem] top-8 bottom-[-2.5rem] w-px border-l-2 border-dashed border-zinc-300 dark:border-zinc-800 -z-10 group-last:hidden" />

                {/* --- TIMELINE NODE (Square) --- */}
                <div className="absolute left-[2.0rem] md:left-[2.8rem] top-[1.65rem] w-2.5 h-2.5 bg-zinc-900 dark:bg-zinc-100 outline outline-4 outline-zinc-50 dark:outline-black z-10 rotate-45" />

                <div className="flex flex-row gap-5 md:gap-8 items-start pl-14 md:pl-20">

                    {/* --- 1. DATE STAMP (Vertical, Technical) --- */}
                    <div className="hidden md:flex flex-col items-center justify-center border border-zinc-900 dark:border-zinc-100 w-12 shrink-0 py-1.5 bg-zinc-50 dark:bg-zinc-950">
                        <span className="text-[10px] font-mono font-bold uppercase">{month}</span>
                        <span className="text-xl font-black font-mono leading-none my-0.5">{day}</span>
                        <span className="text-[10px] font-mono text-zinc-500">{year}</span>
                    </div>

                    {/* --- 2. MAIN CARD (Sharp Box, Hard Shadow) --- */}
                    <div className="flex-1 w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.08)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 hover:-translate-y-0.5 relative">

                        {/* Mobile Date Strip */}
                        <div className="md:hidden flex items-center justify-between bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono font-bold uppercase tracking-widest">
                            <span>{day} {month} {year}</span>
                            <span>{entry.movies ? 'FILM' : 'TV'}</span>
                        </div>

                        <div className="p-4 flex gap-4 md:gap-6">

                            {/* POSTER (Sharp, Bordered) */}
                            <div
                                className="relative shrink-0 w-[70px] md:w-[85px] aspect-[2/3] border border-black dark:border-white cursor-pointer group/poster bg-zinc-200"
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
                                    className="object-cover grayscale group-hover/poster:grayscale-0 transition-all duration-300"
                                />
                            </div>

                            {/* CONTENT BLOCK */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">

                                <div className="space-y-2">
                                    {/* Top Row: Type & Menu */}
                                    <div className="flex justify-between items-start">
                                        <div className="hidden md:flex items-center gap-2">
                                            <span className="bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold uppercase px-1.5 py-0.5 tracking-wider">
                                                {entry.movies ? 'Feature Film' : 'TV Series'}
                                            </span>
                                            {entry.is_rewatch && (
                                                <span className="border border-zinc-300 dark:border-zinc-700 text-zinc-500 text-[9px] font-bold uppercase px-1.5 py-0.5 tracking-wider bg-zinc-50 dark:bg-zinc-900">
                                                    // REWATCH
                                                </span>
                                            )}
                                        </div>
                                        {isOwnProfile && (
                                            <div className="ml-auto">
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

                                    {/* Title */}
                                    <h3
                                        className={`${PlayWriteNewZealandFont.className} text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight cursor-pointer hover:underline decoration-2 underline-offset-4 decoration-zinc-400`}
                                        onClick={() => setSelectedItem({
                                            tmdb_id: cinematicItem.tmdb_id,
                                            title: cinematicItem.title,
                                            media_type: entry.movies ? 'movie' : 'tv'
                                        })}
                                    >
                                        {cinematicItem.title}
                                    </h3>

                                    {/* Status Bar: Rating & Context */}
                                    <div className="flex items-center flex-wrap pt-1">
                                        {rating > 0 ? (
                                            <div className="flex items-center gap-1 text-zinc-900 dark:text-zinc-100">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <SolidStarIcon
                                                            key={i}
                                                            className={`w-3.5 h-3.5 ${rating >= i + 1 ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-200 dark:text-zinc-800'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-mono text-xs font-bold ml-1">[{displayRating}]</span>
                                            </div>
                                        ) : (
                                            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">[ NO_RATING ]</span>
                                        )}

                                        {renderViewingContext(entry.viewing_context)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- FOOTER (Sharp Division) --- */}
                        {(entry.notes || entry.photo_url || entry.posts?.slug || (entry.timeline_collaborators && entry.timeline_collaborators.length > 0)) && (
                            <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3 flex flex-col sm:flex-row gap-4 text-sm relative">

                                <div className="flex-1 space-y-3">
                                    {/* Collaborators */}
                                    {entry.timeline_collaborators && entry.timeline_collaborators.length > 0 && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-mono uppercase text-zinc-400 tracking-wider">COLLAB_USERS:</span>
                                            <div className="flex -space-x-2">
                                                {entry.timeline_collaborators.map(collab => (
                                                    collab.profiles && (
                                                        <button
                                                            key={collab.profiles.id}
                                                            onClick={() => setSelectedCollaborator(collab.profiles)}
                                                            className="relative w-6 h-6 border border-zinc-900 dark:border-zinc-100 bg-zinc-300 hover:z-10 hover:scale-110 transition-transform"
                                                            title={collab.profiles.username}
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

                                    {/* Notes */}
                                    {entry.notes && (
                                        <div
                                            className="group/note cursor-pointer flex items-start gap-2"
                                            onClick={() => setShowNotesModal(true)}
                                        >
                                            <span className="text-[10px] font-bold text-zinc-400 mt-0.5 font-mono">NOTES_&gt;</span>
                                            <p className="font-mono text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed group-hover/note:text-black dark:group-hover/note:text-white transition-colors">
                                                {entry.notes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Full Review Link */}
                                    {entry.posts?.slug && (
                                        <div className="pt-1">
                                            <Link
                                                href={`/blog/${entry.posts.slug}`}
                                                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black px-2 py-1 border border-zinc-900 dark:border-zinc-100 transition-colors"
                                            >
                                                <PencilSquareIcon className="w-3 h-3" />
                                                Read Full Log
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Attachment */}
                                {entry.photo_url && (
                                    <button
                                        onClick={() => setSelectedPhotoUrl(entry.photo_url)}
                                        className="relative w-16 h-16 border border-zinc-400 dark:border-zinc-600 bg-white p-0.5 shrink-0 group/photo"
                                    >
                                        <div className="relative w-full h-full grayscale group-hover/photo:grayscale-0 transition-all">
                                            <Image
                                                src={entry.photo_url}
                                                alt="Evidence"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="absolute -top-1.5 -right-1.5 bg-black text-white p-0.5 border border-white z-10">
                                            <PhotoIcon className="w-3 h-3" />
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* --- MODALS (Technical Design) --- */}
            <AnimatePresence>
                {showNotesModal && entry.notes && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-grayscale z-[80] flex items-center justify-center p-4" onClick={() => setShowNotesModal(false)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-lg bg-white dark:bg-black border-2 border-zinc-900 dark:border-zinc-100 p-8 shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute -top-3 left-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                                User Log Data
                            </div>
                            <button onClick={() => setShowNotesModal(false)} className="absolute top-2 right-2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900"><XMarkIcon className="w-6 h-6" /></button>

                            <h3 className={`${PlayWriteNewZealandFont.className} text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 mt-2`}>{cinematicItem.title}</h3>

                            <div className="prose dark:prose-invert prose-sm max-w-none font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed border-l-2 border-zinc-300 dark:border-zinc-700 pl-4">
                                {entry.notes}
                            </div>

                            <div className="mt-8 pt-4 border-t border-dashed border-zinc-300 dark:border-zinc-700 flex justify-between items-center text-[10px] font-mono uppercase text-zinc-500">
                                <span>Recorded: {year}-{month}-{day}</span>
                                <span>ID: {entry.id.substring(0,8)}</span>
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