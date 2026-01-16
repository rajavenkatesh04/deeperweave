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
    LinkIcon
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
    };
}

// --- SUB-COMPONENTS ---

// Action Menu
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
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
                <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        className="absolute right-0 top-8 z-50 w-44 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden py-1"
                    >
                        <button onClick={() => { setShowShareDialog(true); setIsOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-left">
                            <ShareIcon className="w-3.5 h-3.5" /> Share
                        </button>
                        <Link
                            href={`/profile/${username}/timeline/edit/${entry.id}`}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-left"
                            onClick={() => setIsOpen(false)}
                        >
                            <PencilIcon className="w-3.5 h-3.5" /> Edit
                        </Link>
                        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                        <button onClick={handleDelete} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 text-left">
                            <TrashIcon className="w-3.5 h-3.5" /> Delete
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Share Modal */}
            <AnimatePresence>
                {showShareDialog && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setShowShareDialog(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setShowShareDialog(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"><XMarkIcon className="w-5 h-5" /></button>
                            <div className="flex items-center gap-2 mb-6">
                                <QrCodeIcon className="w-5 h-5 text-zinc-500" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Share Log</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <button onClick={() => onDownload('notes')} disabled={isDownloading} className="flex flex-col items-center gap-2 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group">
                                    <DocumentTextIcon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">With Notes</span>
                                </button>
                                <button onClick={() => onDownload('clean')} disabled={isDownloading} className="flex flex-col items-center gap-2 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group">
                                    <PhotoSolidIcon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Poster Only</span>
                                </button>
                            </div>

                            {isDownloading && <p className="text-center text-[10px] text-zinc-400 animate-pulse mb-3">GENERATING...</p>}

                            <button onClick={handleCopyLink} className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2">
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

    const { day, month, year } = formatDateParts(entry.watched_on);
    const rating = Number(entry.rating);
    const displayRating = rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
    const safeTitle = cinematicItem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

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
        if (context === 'Theatre') return <BuildingLibraryIcon className="w-3 h-3 text-zinc-500 dark:text-zinc-400"/>;
        if (platform?.logo) return <Image src={platform.logo} alt={context} width={14} height={14} className="w-3.5 h-3.5 object-contain" />;
        return <TvIcon className="w-3 h-3 text-zinc-500" />;
    };

    return (
        <>
            <motion.div
                className="group relative w-full mb-6"
                id={`entry-${entry.id}`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
            >
                {/* --- BENTO CARD STRUCTURE --- */}
                {/* We use `h-auto md:h-48` to ensure consistent height on desktop for that grid look.
                   On mobile, it stacks gracefully.
                */}
                <div className="flex flex-col md:flex-row w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                    {/* CELL 1: DATE (Left Column) */}
                    <div className="w-full md:w-20 bg-zinc-50 dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-row md:flex-col items-center justify-between md:justify-center p-3 md:p-0 shrink-0">
                        {/* Mobile view text arrangement */}
                        <div className="md:hidden text-xs font-bold text-zinc-500 uppercase">{month} {day}, {year}</div>

                        {/* Desktop view centered stack */}
                        <div className="hidden md:flex flex-col items-center">
                            <span className={`${googleSansCode.className} text-[10px] uppercase tracking-widest text-zinc-400`}>{month}</span>
                            <span className="text-3xl font-light text-zinc-900 dark:text-zinc-100 my-0.5">{day}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">{year}</span>
                        </div>
                    </div>

                    {/* CELL 2: POSTER (Next to Date) */}
                    <div
                        className="relative w-full md:w-32 aspect-[21/9] md:aspect-auto cursor-pointer overflow-hidden border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shrink-0 group/poster"
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
                            className="object-cover object-center group-hover/poster:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* CELL 3: INFO & CONTENT (Right Area) */}
                    <div className="flex-1 p-4 md:p-5 flex flex-col justify-between min-w-0">

                        {/* Top Row: Title + Menu */}
                        <div className="flex justify-between items-start gap-4 mb-3">
                            <div>
                                <h3
                                    className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
                                    onClick={() => setSelectedItem({
                                        tmdb_id: cinematicItem.tmdb_id,
                                        title: cinematicItem.title,
                                        media_type: entry.movies ? 'movie' : 'tv'
                                    })}
                                >
                                    {cinematicItem.title}
                                </h3>

                                {/* Meta Row: Rating | Platform | Review */}
                                <div className="flex items-center gap-3 mt-1.5">
                                    <div className="flex items-center gap-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                        <StarIcon className="w-3.5 h-3.5 text-amber-500" />
                                        {rating > 0 ? displayRating : <span className="text-xs text-zinc-400 font-normal">NR</span>}
                                    </div>

                                    {entry.viewing_context && (
                                        <>
                                            <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-800" />
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400" title={entry.viewing_context}>
                                                {renderPlatformIcon(entry.viewing_context)}
                                                <span className="uppercase tracking-wide text-[10px] font-medium hidden sm:inline-block max-w-[80px] truncate">{entry.viewing_context}</span>
                                            </div>
                                        </>
                                    )}

                                    {entry.posts?.slug && (
                                        <>
                                            <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-800" />
                                            <Link href={`/blog/${entry.posts.slug}`} className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                                <PencilSquareIcon className="w-3 h-3"/> Review
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Action Menu (Top Right) */}
                            {isOwnProfile && (
                                <ActionMenu
                                    entry={entry}
                                    username={username}
                                    onDownload={handleDownloadShareImage}
                                    isDownloading={isDownloading}
                                />
                            )}
                        </div>

                        {/* Middle: Notes "Bento Box" */}
                        {/* A distinct sub-container for the notes */}
                        <div
                            className={`
                                relative rounded-lg p-3 mb-3 border border-zinc-100 dark:border-zinc-800/50
                                ${entry.notes ? 'bg-zinc-50 dark:bg-zinc-900/40 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-colors' : 'bg-transparent border-dashed'}
                            `}
                            onClick={() => entry.notes && setShowNotesModal(true)}
                        >
                            {entry.notes ? (
                                <p className={`${googleSansCode.className} text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-2`}>
                                    <span className="text-zinc-400 dark:text-zinc-600 mr-2">NOTES_</span>
                                    {entry.notes}
                                </p>
                            ) : (
                                <p className={`${googleSansCode.className} text-[10px] text-zinc-300 dark:text-zinc-700 uppercase`}>// No Log Entry</p>
                            )}
                        </div>

                        {/* Bottom: Footer Info (Collaborators & Evidence) */}
                        <div className="flex items-center justify-between mt-auto">
                            {/* Collaborators */}
                            <div className="flex items-center gap-2 h-6">
                                {entry.timeline_collaborators.length > 0 && (
                                    <div className="flex -space-x-2">
                                        {entry.timeline_collaborators.map(collab => (
                                            collab.profiles && (
                                                <div
                                                    key={collab.profiles.id}
                                                    className="relative w-6 h-6 rounded-full ring-2 ring-white dark:ring-black cursor-pointer hover:z-10 hover:scale-110 transition-transform bg-zinc-100 dark:bg-zinc-800"
                                                    onClick={() => setSelectedCollaborator(collab.profiles)}
                                                >
                                                    <Image
                                                        src={collab.profiles.profile_pic_url || '/default-avatar.png'}
                                                        alt={collab.profiles.username}
                                                        fill
                                                        className="object-cover rounded-full"
                                                        title={collab.profiles.username}
                                                    />
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Evidence / Photo */}
                            {entry.photo_url && (
                                <button
                                    onClick={() => setSelectedPhotoUrl(entry.photo_url)}
                                    className="flex items-center gap-1.5 pl-2 pr-1 py-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-[10px] font-bold uppercase tracking-wider group/ev"
                                >
                                    <PhotoIcon className="w-3.5 h-3.5" />
                                    <span className="hidden group-hover/ev:inline">Evidence</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- MODALS --- */}

            {/* Notes Modal */}
            <AnimatePresence>
                {showNotesModal && entry.notes && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-sm z-[80] flex items-center justify-center p-6"
                        onClick={() => setShowNotesModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl rounded-xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setShowNotesModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                            <div className="mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <span className={`${googleSansCode.className} text-xs text-zinc-400 uppercase tracking-widest`}>Log Entry</span>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{cinematicItem.title}</h3>
                            </div>
                            <div className="prose dark:prose-invert max-h-[60vh] overflow-y-auto">
                                <p className="whitespace-pre-wrap leading-loose text-zinc-700 dark:text-zinc-300 text-base font-serif">{entry.notes}</p>
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