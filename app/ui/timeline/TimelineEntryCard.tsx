'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    PencilSquareIcon,
    XMarkIcon,
    EllipsisHorizontalIcon,
    ShareIcon,
    PencilIcon,
    TrashIcon,
    BuildingLibraryIcon,
    PhotoIcon,
    DocumentTextIcon,
    PhotoIcon as PhotoSolidIcon,
    StarIcon,
    TvIcon,
    QrCodeIcon,
    LinkIcon,
    CalendarIcon,
    ArrowPathIcon // Added for Rewatch
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import CinematicInfoCard from '@/app/ui/blog/CinematicInfoCard';
import { toast } from 'sonner';
import { deleteTimelineEntry } from '@/lib/actions/timeline-actions';
import { TimelineEntry, UserProfile } from "@/lib/definitions";
import ImageModal from './ImageModal';
import UserProfilePopover from './UserProfilePopover';
import { googleSansCode, geistSans } from "@/app/ui/fonts";

// --- HELPERS ---

const ottPlatformDetails: { [key: string]: { logo: string; color: string } } = {
    'Netflix': { logo: '/logos/netflix.svg', color: '#E50914' },
    'Prime Video': { logo: '/logos/prime-video.svg', color: '#00A8E1' },
    'Disney+': { logo: '/logos/disney-plus.svg', color: '#113CCF' },
    'Hulu': { logo: '/logos/hulu.svg', color: '#1CE783' },
    'Max': { logo: '/logos/max.svg', color: '#0026FF' },
    'Apple TV+': { logo: '/logos/apple-tv.svg', color: '#000000' },
};

function formatDateParts(dateString: string) {
    const date = new Date(dateString);
    return {
        day: date.getDate().toString().padStart(2, '0'),
        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        year: date.getFullYear(),
        full: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
}

// --- SUB-COMPONENTS ---

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
        toast.loading('Deleting...');
        await deleteTimelineEntry(entry.id);
        toast.dismiss();
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/profile/${username}/timeline#entry-${entry.id}`);
        toast.success('Link copied');
        setShowShareDialog(false);
    };

    return (
        <div className="relative z-10" ref={dropdownRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
                <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5, x: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        className="absolute right-0 top-8 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden py-1 ring-1 ring-black/5"
                    >
                        <button onClick={(e) => { e.stopPropagation(); setShowShareDialog(true); setIsOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left transition-colors">
                            <ShareIcon className="w-3.5 h-3.5" /> Share
                        </button>
                        <Link
                            href={`/profile/${username}/timeline/edit/${entry.id}`}
                            className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left transition-colors"
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        >
                            <PencilIcon className="w-3.5 h-3.5" /> Edit
                        </Link>
                        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left transition-colors">
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
                            className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setShowShareDialog(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"><XMarkIcon className="w-5 h-5" /></button>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                                    <QrCodeIcon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Share Log</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button onClick={() => onDownload('notes')} disabled={isDownloading} className="flex flex-col items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
                                    <DocumentTextIcon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">With Notes</span>
                                </button>
                                <button onClick={() => onDownload('clean')} disabled={isDownloading} className="flex flex-col items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
                                    <PhotoSolidIcon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Poster Only</span>
                                </button>
                            </div>

                            {isDownloading && <p className="text-center text-[10px] text-zinc-400 animate-pulse mb-3 font-medium tracking-wide">GENERATING IMAGE...</p>}

                            <button onClick={handleCopyLink} className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg">
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

    const { day, month, year, full: fullDate } = formatDateParts(entry.watched_on);
    const rating = Number(entry.rating);
    const displayRating = rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
    const safeTitle = cinematicItem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    // Check for rewatch (Added safe check in case it's undefined)
    const isRewatch = (entry as any).is_rewatch || false;

    // Download Handler
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
            toast.success('Saved');
        } catch (error) {
            console.error(error);
            toast.error('Error generating image.');
        } finally {
            setIsDownloading(false);
        }
    };

    const renderPlatformIcon = (context: string | null) => {
        if (!context) return null;
        const platform = ottPlatformDetails[context];
        if (context === 'Theatre') return <BuildingLibraryIcon className="w-3 h-3 text-zinc-600 dark:text-zinc-400"/>;
        if (platform?.logo) return <Image src={platform.logo} alt={context} width={14} height={14} className="w-3.5 h-3.5 object-contain" />;
        return <TvIcon className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />;
    };

    return (
        <>
            <motion.div
                className="group relative w-full mb-3 md:mb-4"
                id={`entry-${entry.id}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3 }}
            >
                {/* COMPACT ROW LAYOUT:
                   We use `flex-row` on all screens now.
                   Mobile: Image is w-24 (approx 96px).
                   Desktop: Image is w-32 or w-40.
                */}
                <div className="flex flex-row w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">

                    {/* POSTER: Fixed width, height auto to maintain aspect ratio */}
                    <div
                        className="relative w-24 min-h-[140px] md:w-36 md:min-h-[200px] shrink-0 cursor-pointer bg-zinc-100 dark:bg-zinc-900"
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
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* CONTENT: Right side */}
                    <div className="flex-1 flex flex-col p-3 md:p-5 min-w-0 justify-between">

                        {/* Top Section */}
                        <div className="space-y-1">
                            {/* Date Row */}
                            <div className="flex items-center justify-between">
                                <div className={`${googleSansCode.className} flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest`}>
                                    <span>{month} {day}, {year}</span>
                                </div>
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
                            <h3
                                className="text-base md:text-xl font-bold leading-tight text-zinc-900 dark:text-zinc-100 cursor-pointer line-clamp-2 md:line-clamp-1 hover:text-blue-600 dark:hover:text-blue-500 transition-colors pt-0.5"
                                onClick={() => setSelectedItem({
                                    tmdb_id: cinematicItem.tmdb_id,
                                    title: cinematicItem.title,
                                    media_type: entry.movies ? 'movie' : 'tv'
                                })}
                            >
                                {cinematicItem.title}
                            </h3>

                            {/* Badges Row - Tightly packed */}
                            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 pt-1.5">
                                {/* Rating Badge */}
                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 text-[10px] md:text-xs font-bold border border-amber-100 dark:border-amber-900/30">
                                    <StarIcon className="w-3 h-3" />
                                    <span>{rating > 0 ? displayRating : 'NR'}</span>
                                </div>

                                {/* Rewatch Badge */}
                                {isRewatch && (
                                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-500 text-[10px] md:text-xs font-bold border border-emerald-100 dark:border-emerald-900/30">
                                        <ArrowPathIcon className="w-3 h-3" />
                                        <span className="hidden md:inline">Rewatch</span>
                                    </div>
                                )}

                                {/* Platform */}
                                {entry.viewing_context && (
                                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-[10px] md:text-xs font-medium border border-zinc-200 dark:border-zinc-800 max-w-[80px] md:max-w-[120px]">
                                        {renderPlatformIcon(entry.viewing_context)}
                                        <span className="truncate">{entry.viewing_context}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Section: Notes Snippet & Footer */}
                        <div className="mt-3">
                            {/* Notes Snippet */}
                            {entry.notes && (
                                <div
                                    className="mb-2.5 cursor-pointer group/notes"
                                    onClick={() => setShowNotesModal(true)}
                                >
                                    <p className={`${googleSansCode.className} text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed border-l-2 border-zinc-200 dark:border-zinc-800 pl-2 group-hover/notes:border-zinc-400 transition-colors`}>
                                        {entry.notes}
                                    </p>
                                </div>
                            )}

                            {/* Footer: Review Link & Evidence */}
                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                                <div className="flex items-center gap-3">
                                    {entry.posts?.slug && (
                                        <Link href={`/blog/${entry.posts.slug}`} className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                            <PencilSquareIcon className="w-3 h-3"/> <span className="hidden xs:inline">Read Review</span>
                                        </Link>
                                    )}
                                </div>

                                {/* Right Side Footer: Collabs + Evidence Icon */}
                                <div className="flex items-center gap-3">
                                    {entry.timeline_collaborators.length > 0 && (
                                        <div className="flex -space-x-1.5">
                                            {entry.timeline_collaborators.slice(0, 3).map(collab => (
                                                collab.profiles && (
                                                    <div key={collab.profiles.id} className="relative w-4 h-4 md:w-5 md:h-5 rounded-full ring-1 ring-white dark:ring-black">
                                                        <Image
                                                            src={collab.profiles.profile_pic_url || '/default-avatar.png'}
                                                            alt={collab.profiles.username}
                                                            fill
                                                            className="object-cover rounded-full"
                                                        />
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    )}
                                    {entry.photo_url && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedPhotoUrl(entry.photo_url); }}
                                            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                        >
                                            <PhotoIcon className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- MODALS --- */}

            <AnimatePresence>
                {showNotesModal && entry.notes && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-[80] flex items-center justify-center p-6"
                        onClick={() => setShowNotesModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl rounded-2xl relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setShowNotesModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                            <div className="mb-6">
                                <div className={`${googleSansCode.className} flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-widest mb-2`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span>Personal Log</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-50">{cinematicItem.title}</h3>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                <p className={`${geistSans.className} whitespace-pre-wrap leading-loose text-zinc-800 dark:text-zinc-200 text-base md:text-lg`}>
                                    {entry.notes}
                                </p>
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