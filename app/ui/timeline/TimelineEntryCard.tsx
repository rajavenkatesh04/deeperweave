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
    CalendarIcon,
    TvIcon,
    DevicePhoneMobileIcon,
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
import { googleSansCode } from "@/app/ui/fonts";

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

// 1. Refined Action Menu (Fusion of functionality)
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
        toast.success('Link copied to clipboard');
        setShowShareDialog(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
                <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        className="absolute right-0 top-8 z-40 w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden py-1"
                    >
                        <button onClick={() => { setShowShareDialog(true); setIsOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-left">
                            <ShareIcon className="w-3.5 h-3.5" /> Share Entry
                        </button>
                        <Link
                            href={`/profile/${username}/timeline/edit/${entry.id}`}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-left"
                            onClick={() => setIsOpen(false)}
                        >
                            <PencilIcon className="w-3.5 h-3.5" /> Edit Log
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

                            {isDownloading && <p className="text-center text-[10px] text-zinc-400 animate-pulse mb-3">GENERATING IMAGE...</p>}

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
            toast.success('Image downloaded');
        } catch (error) {
            console.error(error);
            toast.error('Could not generate image.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Viewing Context Renderer
    const renderPlatform = (context: string | null) => {
        if (!context) return null;
        const platform = ottPlatformDetails[context];
        let icon = <TvIcon className="w-3 h-3 text-zinc-400" />;

        if (context === 'Theatre') icon = <BuildingLibraryIcon className="w-3 h-3 text-zinc-400"/>;
        else if (platform?.logo) icon = <Image src={platform.logo} alt={context} width={12} height={12} className="w-3 h-3 object-contain opacity-80" />;

        return (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                {icon}
                <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide truncate max-w-[80px]">{context}</span>
            </div>
        );
    };

    return (
        <>
            <motion.div
                className="group relative mb-6 w-full"
                id={`entry-${entry.id}`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
            >
                {/* --- FUSED CONTAINER --- */}
                {/* Uses the horizontal layout of Design 2, but rounded/clean aesthetics of Design 1 */}
                <div className="flex w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">

                    {/* --- 1. DATE MONOLITH (Refined) --- */}
                    {/* Vertical strip like Design 2, but cleaner typography */}
                    <div className="flex flex-col items-center justify-center w-16 md:w-20 shrink-0 bg-zinc-50 dark:bg-zinc-900/30 border-r border-zinc-100 dark:border-zinc-800">
                        <span className={`${googleSansCode.className} text-[10px] uppercase tracking-widest text-zinc-400`}>{month}</span>
                        <span className="text-2xl md:text-3xl font-light tracking-tighter text-zinc-900 dark:text-zinc-100 my-1">{day}</span>
                        <span className="text-[10px] font-medium text-zinc-400">{year}</span>
                    </div>

                    {/* --- 2. POSTER (Compact but detailed) --- */}
                    <div
                        className="relative w-24 md:w-32 aspect-[2/3] shrink-0 cursor-pointer overflow-hidden border-r border-zinc-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900"
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
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Inner shadow from Design 1 for depth */}
                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_15px_rgba(0,0,0,0.4)]" />
                    </div>

                    {/* --- 3. CONTENT (Flexible) --- */}
                    <div className="flex-1 min-w-0 flex flex-col p-4">

                        {/* Top: Title & Actions */}
                        <div className="flex justify-between items-start gap-4 mb-3">
                            <h3
                                className="text-lg md:text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight cursor-pointer hover:underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4 line-clamp-2"
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
                                    <ActionMenu
                                        entry={entry}
                                        username={username}
                                        onDownload={handleDownloadShareImage}
                                        isDownloading={isDownloading}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Middle: Meta Strip (Fused Design) */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            {/* Rating */}
                            <div className="flex items-center gap-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                <StarIcon className="w-3.5 h-3.5 text-amber-500/90" />
                                {rating > 0 ? displayRating : <span className="text-zinc-400 font-normal text-xs">Unrated</span>}
                            </div>

                            <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-700" />

                            {/* Platform */}
                            {entry.viewing_context && renderPlatform(entry.viewing_context)}

                            {/* Review Link */}
                            {entry.posts?.slug && (
                                <Link href={`/blog/${entry.posts.slug}`} className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                    <PencilSquareIcon className="w-3 h-3 text-zinc-400"/>
                                    <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Review</span>
                                </Link>
                            )}
                        </div>

                        {/* Notes Snippet (Code style) */}
                        {entry.notes && (
                            <div
                                className="mb-auto cursor-pointer group/notes"
                                onClick={() => setShowNotesModal(true)}
                            >
                                <p className={`${googleSansCode.className} text-[11px] leading-5 text-zinc-500 dark:text-zinc-400 line-clamp-2 group-hover/notes:text-zinc-800 dark:group-hover/notes:text-zinc-200 transition-colors`}>
                                    <span className="text-zinc-300 dark:text-zinc-600 mr-1.5">{'//'}</span>
                                    {entry.notes}
                                </p>
                            </div>
                        )}

                        {/* Bottom: Footer Info */}
                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/50 flex items-end justify-between">

                            {/* Collaborators */}
                            <div className="flex items-center gap-2">
                                {entry.timeline_collaborators.length > 0 && (
                                    <>
                                        <span className={`${googleSansCode.className} text-[9px] uppercase tracking-widest text-zinc-400`}>With</span>
                                        <div className="flex -space-x-1.5">
                                            {entry.timeline_collaborators.map(collab => (
                                                collab.profiles && (
                                                    <button
                                                        key={collab.profiles.id}
                                                        onClick={() => setSelectedCollaborator(collab.profiles)}
                                                        className="relative w-5 h-5 rounded-full ring-2 ring-white dark:ring-zinc-950 hover:z-10 hover:scale-110 transition-transform bg-zinc-100 dark:bg-zinc-800"
                                                        title={collab.profiles.username}
                                                    >
                                                        <Image
                                                            src={collab.profiles.profile_pic_url || '/default-avatar.png'}
                                                            alt={collab.profiles.username}
                                                            fill
                                                            className="object-cover rounded-full"
                                                        />
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Evidence Pill */}
                            {entry.photo_url && (
                                <button
                                    onClick={() => setSelectedPhotoUrl(entry.photo_url)}
                                    className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    <PhotoIcon className="w-3 h-3" /> Pic
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- MODALS --- */}

            {/* Notes Modal (Clean Design) */}
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
                                <span className={`${googleSansCode.className} text-xs text-zinc-400 uppercase tracking-widest`}>Journal Log</span>
                                <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mt-1">{cinematicItem.title}</h3>
                            </div>

                            <div className="prose dark:prose-invert max-h-[60vh] overflow-y-auto">
                                <p className="whitespace-pre-wrap leading-loose text-zinc-700 dark:text-zinc-300 text-base font-serif">
                                    {entry.notes}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Movie Info Modal */}
            {selectedItem && (
                <CinematicInfoCard
                    tmdbId={selectedItem.tmdb_id}
                    mediaType={selectedItem.media_type}
                    initialData={selectedItem.media_type === 'movie' ? entry.movies! : entry.series!}
                    isOpen={true}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            {/* Image Viewer */}
            {selectedPhotoUrl && <ImageModal imageUrl={selectedPhotoUrl} onClose={() => setSelectedPhotoUrl(null)} />}

            {/* User Popover */}
            {selectedCollaborator && <UserProfilePopover user={selectedCollaborator} onClose={() => setSelectedCollaborator(null)} />}
        </>
    );
}