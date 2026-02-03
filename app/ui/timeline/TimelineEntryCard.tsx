'use client';

import { useState, useRef, useEffect } from 'react'; // Added useRef, useEffect
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import {
    EllipsisHorizontalIcon,
    ShareIcon,
    PencilIcon,
    TrashIcon,
    DocumentTextIcon,
    PhotoIcon as PhotoSolidIcon,
    StarIcon,
    ArrowPathIcon,
    LinkIcon,
    XMarkIcon,
    QrCodeIcon,
    PhotoIcon,
    TicketIcon,
    TvIcon
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { deleteTimelineEntry } from '@/lib/actions/timeline-actions';
import { TimelineEntry, UserProfile, TimelineEntryWithUser } from "@/lib/definitions";
import { geistSans } from "@/app/ui/fonts";
import MediaInfoCard from '@/app/ui/blog/MediaInfoCard';
import ImageModal from './ImageModal';
import UserProfilePopover from './UserProfilePopover';
import ContentGuard from '@/app/ui/shared/ContentGuard';
import { toPng } from 'html-to-image'; // 📸 IMPORT
import StoryImageWithNotes from './StoryImageWithNotes'; // 📸 IMPORT
import StoryImageNoNotes from './StoryImageNoNotes'; // 📸 IMPORT

// --- HELPER: Platform Badge ---
const PlatformBadge = ({ platform }: { platform: string }) => {
    const p = platform.toLowerCase().trim();
    let config = { bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-600 dark:text-zinc-400', icon: null as React.ReactNode, label: platform };

    if (p.includes('netflix')) config = { bg: 'bg-black', text: 'text-[#E50914]', icon: <Image src="/logos/netflix.svg" alt="Netflix" width={50} height={14} className="h-3.5 w-auto object-contain" />, label: 'Netflix' };
    else if (p.includes('prime') || p.includes('amazon')) config = { bg: 'bg-[#00A8E1]', text: 'text-white', icon: <Image src="/logos/prime-video.svg" alt="Prime Video" width={50} height={14} className="h-3.5 w-auto object-contain brightness-0 invert" />, label: 'Prime' };
    else if (p.includes('disney')) config = { bg: 'bg-[#113CCF]', text: 'text-white', icon: <Image src="/logos/disney-plus.svg" alt="Disney+" width={50} height={16} className="h-4 w-auto object-contain" />, label: 'Disney+' };
    else if (p.includes('hulu')) config = { bg: 'bg-[#1CE783]', text: 'text-black', icon: <Image src="/logos/hulu.svg" alt="Hulu" width={50} height={14} className="h-3 w-auto object-contain" />, label: 'Hulu' };
    else if (p.includes('max') || p.includes('hbo')) config = { bg: 'bg-[#002BE7]', text: 'text-white', icon: <Image src="/logos/max.svg" alt="Max" width={50} height={14} className="h-3.5 w-auto object-contain brightness-0 invert" />, label: 'Max' };
    else if (p.includes('apple') || p.includes('tv+')) config = { bg: 'bg-white', text: 'text-black', icon: <Image src="/logos/apple-tv.svg" alt="Apple TV" width={50} height={14} className="h-3.5 w-auto object-contain" />, label: 'Apple TV' };
    else if (p.includes('cinema') || p.includes('theater')) config = { bg: 'bg-rose-600', text: 'text-white', icon: <TicketIcon className="w-3.5 h-3.5" />, label: 'Cinema' };
    else if (p.includes('tv') || p.includes('television')) config = { bg: 'bg-zinc-800', text: 'text-zinc-300', icon: <TvIcon className="w-3.5 h-3.5" />, label: 'TV' };

    return (
        <div className={`inline-flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-sm ${config.bg} shadow-sm border border-black/5 dark:border-white/5`}>
            {config.icon ? config.icon : <span className={`text-[10px] font-bold uppercase tracking-wide ${config.text}`}>{config.label}</span>}
        </div>
    );
};

// --- PORTAL MODAL COMPONENT (Action Menu) ---
function ActionMenuPortal({
                              entry,
                              username,
                              isOpen,
                              onClose,
                              onDownload,
                              isDownloading
                          }: {
    entry: TimelineEntry;
    username: string;
    isOpen: boolean;
    onClose: () => void;
    onDownload: (mode: 'notes' | 'clean') => void;
    isDownloading: boolean;
}) {
    const [showShareDialog, setShowShareDialog] = useState(false);

    // Simple mount check for portal safety
    if (typeof window === 'undefined') return null;
    if (!isOpen) return null;

    const stopProp = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this log?')) return;
        onClose();
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
        onClose();
    };

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] isolate">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => { stopProp(e); onClose(); }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Main Menu Modal */}
                {!showShareDialog ? (
                    <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={stopProp}
                            className="w-full max-w-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Manage Entry</h3>
                                <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => setShowShareDialog(true)}
                                    className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-colors"
                                >
                                    <ShareIcon className="w-4 h-4" /> Share
                                </button>
                                <Link
                                    href={`/profile/${username}/timeline/edit/${entry.id}`}
                                    onClick={onClose}
                                    className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-colors"
                                >
                                    <PencilIcon className="w-4 h-4" /> Edit
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                                >
                                    <TrashIcon className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    /* Share Dialog */
                    <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={stopProp}
                            className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-2xl relative overflow-hidden pointer-events-auto"
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
            </div>
        </AnimatePresence>,
        document.body
    );
}

// --- PORTAL MODAL COMPONENT (Notes) ---
function NotesModalPortal({
                              isOpen,
                              onClose,
                              notes,
                              title,
                              posterUrl,
                              date,
                              rating
                          }: {
    isOpen: boolean;
    onClose: () => void;
    notes: string;
    title: string;
    posterUrl: string;
    date: string;
    rating: string;
}) {
    if (typeof window === 'undefined') return null;
    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] isolate">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
                />
                <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="shrink-0 flex items-start gap-4 p-5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
                            <div className="relative w-12 h-16 shrink-0 rounded-sm overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <Image src={posterUrl} alt="Poster" fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight truncate pr-8">
                                    {title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                    <span className="font-medium">{date}</span>
                                    {rating && (
                                        <>
                                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                            <div className="flex items-center gap-1 text-zinc-900 dark:text-zinc-100 font-semibold">
                                                <StarIcon className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
                                                {rating}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button onClick={onClose} className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-5 custom-scrollbar">
                            <div className={`${geistSans.className} text-base leading-relaxed text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap`}>
                                {notes}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>,
        document.body
    );
}

// --- MAIN CARD COMPONENT ---

export default function TimelineEntryCard({
                                              entry,
                                              index,
                                              isOwnProfile,
                                              username,
                                              isSFW
                                          }: {
    entry: TimelineEntry;
    index: number;
    isOwnProfile: boolean;
    username: string;
    isSFW: boolean;
}) {
    // 🛠️ FIX: Access 'movies' (plural) as defined in your interface, not 'movie'
    const cinematicItem = entry.movies || entry.series;

    const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
    const [selectedCollaborator, setSelectedCollaborator] = useState<Pick<UserProfile, 'id' | 'username' | 'profile_pic_url'> | null>(null);
    const [selectedItem, setSelectedItem] = useState<{ tmdb_id: number; title: string; media_type: 'movie' | 'tv' } | null>(null);

    // 📸 NEW STATE FOR GENERATION
    const [isDownloading, setIsDownloading] = useState(false);
    const [shareMode, setShareMode] = useState<'notes' | 'clean' | null>(null);
    const hiddenShareRef = useRef<HTMLDivElement>(null);

    // Portal States
    const [showMenu, setShowMenu] = useState(false);
    const [showNotes, setShowNotes] = useState(false);

    // ✨ SAFETY CHECKS
    const isExplicit = entry.movies?.adult === true || entry.series?.adult === true;

    // 📸 EFFECT: Trigger download when shareMode is set and component renders
    useEffect(() => {
        if (!shareMode || !hiddenShareRef.current) return;

        const generateImage = async () => {
            setIsDownloading(true);
            try {
                // Small delay to ensure images inside the hidden div are ready
                await new Promise(resolve => setTimeout(resolve, 500));

                const dataUrl = await toPng(hiddenShareRef.current!, {
                    cacheBust: true,
                    pixelRatio: 1, // 1080x1920 is already large, 1x is sufficient
                    width: 1080,
                    height: 1920,
                    backgroundColor: '#09090b',
                });

                const safeTitle = cinematicItem?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'story';
                const link = document.createElement('a');
                link.download = `${safeTitle}_${shareMode}.png`;
                link.href = dataUrl;
                link.click();
                toast.success('Image saved');
            } catch (err) {
                console.error(err);
                toast.error('Failed to generate image');
            } finally {
                setIsDownloading(false);
                setShareMode(null); // Reset
            }
        };

        generateImage();
    }, [shareMode, cinematicItem?.title]);


    if (!cinematicItem) return null;

    // Readable Date
    const dateObj = new Date(entry.watched_on);
    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const rating = Number(entry.rating);
    const displayRating = rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
    const rewatchCount = (entry as any).rewatch_count || 0;
    const isRewatch = (entry as any).is_rewatch || rewatchCount > 0;
    const releaseYear = (cinematicItem.release_date)?.split('-')[0];

    // 📸 BUTTON HANDLER
    const handleDownloadShareImage = (mode: 'notes' | 'clean') => {
        setShareMode(mode);
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

                    {/* POSTER - GUARDED & CLICKABLE */}
                    <div
                        className="relative w-24 min-h-[140px] md:w-32 shrink-0 cursor-pointer bg-zinc-100 dark:bg-zinc-900 group/poster"
                        onClick={openDetails}
                    >
                        {/* 🛡️ CONTENT GUARD */}
                        <ContentGuard isAdult={isExplicit} isSFW={isSFW}>
                            <Image
                                src={cinematicItem.poster_url || '/placeholder-poster.png'}
                                alt={cinematicItem.title}
                                fill
                                className="object-cover object-center group-hover/poster:scale-105 transition-transform duration-500"
                            />
                        </ContentGuard>

                        {/* Explicit Badge */}
                        {isExplicit && (
                            <div className="absolute top-1 left-1 pointer-events-none z-10">
                                <div className="w-2 h-2 rounded-full bg-red-600 shadow-sm border border-white/20"></div>
                            </div>
                        )}
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 flex flex-col p-4 min-w-0 relative">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs uppercase tracking-wide font-semibold text-zinc-500 dark:text-zinc-500 italic">
                                {formattedDate}
                            </span>
                            {isOwnProfile && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(true); }}
                                    className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-100 dark:bg-zinc-900"
                                >
                                    <EllipsisHorizontalIcon className="w-5 h-5" />
                                </button>
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
                            {rating > 0 && (
                                <div className="flex items-center gap-1 font-bold text-zinc-900 dark:text-zinc-100">
                                    <StarIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
                                    <span>{displayRating}</span>
                                </div>
                            )}
                            {(rating > 0 && entry.viewing_context) && <span className="text-zinc-300 dark:text-zinc-700">•</span>}
                            {entry.viewing_context && <PlatformBadge platform={entry.viewing_context} />}
                            {((rating > 0 || entry.viewing_context) && isRewatch) && <span className="text-zinc-300 dark:text-zinc-700">•</span>}
                            {isRewatch && (
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 font-bold uppercase tracking-wider text-[10px]" title={`You have rewatched this ${rewatchCount} times`}>
                                    <ArrowPathIcon className="w-3 h-3 stroke-[3]" />
                                    <span>{rewatchCount > 0 ? `Rewatch ${rewatchCount}` : 'Rewatch'}</span>
                                </div>
                            )}
                            {((rating > 0 || entry.viewing_context || isRewatch) && entry.timeline_collaborators.length > 0) && <span className="text-zinc-300 dark:text-zinc-700">•</span>}
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
                            {((rating > 0 || entry.viewing_context || isRewatch || entry.timeline_collaborators.length > 0) && entry.photo_url) && <span className="text-zinc-300 dark:text-zinc-700">•</span>}
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
                                onClick={() => setShowNotes(true)}
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

            {/* --- PORTALS --- */}
            <ActionMenuPortal
                entry={entry}
                username={username}
                isOpen={showMenu}
                onClose={() => setShowMenu(false)}
                onDownload={handleDownloadShareImage}
                isDownloading={isDownloading}
            />

            <NotesModalPortal
                isOpen={showNotes}
                onClose={() => setShowNotes(false)}
                notes={entry.notes || ''}
                title={cinematicItem.title}
                posterUrl={cinematicItem.poster_url || '/placeholder-poster.png'}
                date={formattedDate}
                rating={displayRating}
            />

            {/* --- MEDIA MODALS --- */}
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

            {/* 📸 HIDDEN RENDER LAYER (GHOST ELEMENT) */}
            {/* This renders OFF-SCREEN only when generation is active */}
            {shareMode && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: '-9999px', // Hide off-screen
                        width: '1080px', // Exact Story dimensions
                        height: '1920px',
                        zIndex: -1,
                        background: '#09090b',
                    }}
                >
                    <div ref={hiddenShareRef} style={{ width: '100%', height: '100%' }}>
                        {shareMode === 'clean' ? (
                            <StoryImageNoNotes entry={entry as TimelineEntryWithUser} />
                        ) : (
                            <StoryImageWithNotes entry={entry as TimelineEntryWithUser} />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}