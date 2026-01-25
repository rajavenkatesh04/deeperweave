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
    DocumentTextIcon,
    LinkIcon,
    XMarkIcon,
    QrCodeIcon,
    PhotoIcon as PhotoSolidIcon
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import CinematicInfoCard from '@/app/ui/blog/CinematicInfoCard';
import { toast } from 'sonner';
import { deleteTimelineEntry } from '@/lib/actions/timeline-actions';
import { TimelineEntry, UserProfile } from "@/lib/definitions";
import ImageModal from './ImageModal';
import UserProfilePopover from './UserProfilePopover';
import { geistSans } from "@/app/ui/fonts";

// --- HELPERS ---

function formatDateMinimal(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// --- ACTION MENU COMPONENT (With Share Logic Restored) ---

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
            {/* Trigger Button */}
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
                <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5, x: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        className="absolute right-0 top-8 w-36 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 py-1 ring-1 ring-black/5"
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

            {/* Share Modal Overlay */}
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
    const [isDownloading, setIsDownloading] = useState(false); // Restored State

    if (!cinematicItem) return null;

    const formattedDate = formatDateMinimal(entry.watched_on);
    const rating = Number(entry.rating);
    const displayRating = rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
    const isRewatch = (entry).is_rewatch || false;
    const releaseYear = (cinematicItem.release_date)?.split('-')[0];
    const safeTitle = cinematicItem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    // Restored Download Functionality
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
                <div className="flex flex-row w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">

                    {/* POSTER (Left side) */}
                    <div
                        className="relative w-24 min-h-[130px] md:w-32 shrink-0 cursor-pointer bg-zinc-100 dark:bg-zinc-900"
                        onClick={openDetails}
                    >
                        <Image
                            src={cinematicItem.poster_url || '/placeholder-poster.png'}
                            alt={cinematicItem.title}
                            fill
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* CONTENT (Right side) */}
                    <div className="flex-1 flex flex-col p-4 min-w-0 relative">

                        {/* Header: Date & Menu */}
                        <div className="flex justify-between items-start mb-1.5">
                            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{formattedDate}</span>
                            {/* Restored fully functional ActionMenu */}
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
                            className="text-base md:text-lg font-bold leading-tight text-zinc-900 dark:text-zinc-100 cursor-pointer truncate pr-6 mb-2"
                            onClick={openDetails}
                            title={cinematicItem.title}
                        >
                            {cinematicItem.title}
                        </h3>

                        {/* RATING & METADATA ROW */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 mb-auto">
                            {/* Rating */}
                            {rating > 0 && (
                                <div className="flex items-center gap-1 text-zinc-900 dark:text-zinc-100 font-bold">
                                    <StarIcon className="w-3.5 h-3.5 text-amber-500" />
                                    <span>{displayRating}</span>
                                </div>
                            )}

                            {/* Separator */}
                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                            <span>{releaseYear}</span>

                            {/* Platform */}
                            {entry.viewing_context && (
                                <>
                                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                    <span className="truncate max-w-[100px]">{entry.viewing_context}</span>
                                </>
                            )}

                            {/* Rewatch */}
                            {isRewatch && (
                                <>
                                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                    <span className="flex items-center gap-0.5 text-zinc-400 dark:text-zinc-500" title="Rewatch">
                                        <ArrowPathIcon className="w-3 h-3" />
                                    </span>
                                </>
                            )}
                        </div>

                        {/* FOOTER */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">

                            {/* Left Side: Notes & Review */}
                            <div className="flex items-center gap-4">
                                {entry.notes && (
                                    <button
                                        onClick={() => setShowNotesModal(true)}
                                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors group/noteBtn"
                                    >
                                        <DocumentTextIcon className="w-3.5 h-3.5 text-zinc-400 group-hover/noteBtn:text-zinc-600 dark:text-zinc-600 dark:group-hover/noteBtn:text-zinc-400" />
                                        <span className="font-medium">Notes</span>
                                    </button>
                                )}

                                {entry.posts?.slug && (
                                    <Link href={`/blog/${entry.posts.slug}`} className="flex items-center gap-1 text-xs text-blue-600/80 hover:text-blue-600 dark:text-blue-400/80 dark:hover:text-blue-400 transition-colors">
                                        <LinkIcon className="w-3.5 h-3.5" />
                                        <span className="font-medium">Review</span>
                                    </Link>
                                )}
                            </div>

                            {/* Right Side: Collabs & Photo */}
                            <div className="flex items-center gap-3">
                                {entry.timeline_collaborators.length > 0 && (
                                    <div className="flex -space-x-1.5">
                                        {entry.timeline_collaborators.slice(0, 3).map(collab => (
                                            collab.profiles && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    key={collab.profiles.id}
                                                    src={collab.profiles.profile_pic_url || '/default-avatar.png'}
                                                    alt={collab.profiles.username}
                                                    className="w-5 h-5 rounded-full ring-1 ring-white dark:ring-zinc-950 object-cover grayscale hover:grayscale-0 transition-all cursor-pointer"
                                                    onClick={(e) => {e.stopPropagation(); setSelectedCollaborator(collab.profiles)}}
                                                />
                                            )
                                        ))}
                                    </div>
                                )}
                                {entry.photo_url && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedPhotoUrl(entry.photo_url); }}
                                        className="text-zinc-300 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                    >
                                        <PhotoIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
                        onClick={() => setShowNotesModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setShowNotesModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"><XMarkIcon className="w-5 h-5" /></button>
                            <h3 className="text-lg font-bold mb-4 text-zinc-900 dark:text-white">{cinematicItem.title} <span className="text-zinc-400 font-normal">Notes</span></h3>
                            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                                <p className={`${geistSans.className} whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300 text-sm`}>
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