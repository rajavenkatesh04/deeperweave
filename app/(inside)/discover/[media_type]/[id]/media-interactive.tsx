'use client';

import { useState, useEffect, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { ShareIcon, PlayIcon, XMarkIcon, CheckIcon, UserIcon, WrenchIcon, FilmIcon, TvIcon, StarIcon, ArrowRightIcon, MapPinIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getMovieDetails, getSeriesDetails, getPersonDetails } from '@/lib/actions/cinematic-actions';
import LoadingSpinner from '@/app/ui/loading-spinner';

/* --- 1. Share Button --- */
export function ShareButton() {
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            title="Copy Link"
        >
            {copied ? (
                <>
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Copied!</span>
                </>
            ) : (
                <>
                    <ShareIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Share</span>
                </>
            )}
        </button>
    );
}

/* --- 2. Trailer Button --- */
export function TrailerButton({ videos }: { videos: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    const trailer = videos?.find(
        (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    );

    if (!trailer) {
        return (
            <button disabled className="px-8 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed font-medium flex items-center gap-2">
                <PlayIcon className="w-4 h-4" />
                No Trailer
            </button>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="group px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all font-medium relative overflow-hidden"
            >
                <span className="flex items-center gap-2 relative z-10">
                    <PlayIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    Watch Trailer
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-zinc-800">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-zinc-800 rounded-full text-white transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                            allow="autoplay; encrypted-media; fullscreen"
                            className="w-full h-full"
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

/* --- 3. Backdrop Gallery --- */
export function BackdropGallery({ images, fallbackPath }: { images: any[], fallbackPath: string | null }) {
    const [index, setIndex] = useState(0);
    const backdrops = images?.filter((img: any) => !img.iso_639_1 || img.iso_639_1 === 'en').slice(0, 6) || [];

    const hasMultiple = backdrops.length > 1;
    const currentPath = hasMultiple ? backdrops[index].file_path : fallbackPath;

    useEffect(() => {
        if (!hasMultiple) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % backdrops.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [hasMultiple, backdrops.length]);

    if (!currentPath) return null;

    return (
        <div className="relative w-full h-[35rem] bg-zinc-200 dark:bg-zinc-900 overflow-hidden group">
            <div key={currentPath} className="relative w-full h-full animate-fadeIn">
                <Image
                    src={`https://image.tmdb.org/t/p/original${currentPath}`}
                    alt="Backdrop"
                    fill
                    className="object-cover opacity-100 dark:opacity-60 transition-all duration-1000 ease-in-out transform scale-100 group-hover:scale-105"
                    priority
                />
            </div>
            <div className="absolute inset-0 dark:bg-gradient-to-b dark:from-transparent dark:via-transparent dark:to-zinc-950" />
        </div>
    );
}

/* --- 4. ✨ MEDIA INFO CARD (MODAL) --- */
export interface BaseMediaData {
    tmdb_id: number;
    title: string;
    poster_url: string | null;
    backdrop_url?: string | null;
    release_date?: string;
}

type ApiDetails = {
    overview?: string;
    biography?: string;
    vote_average?: number;
    runtime?: number;
    number_of_seasons?: number;
    genres?: { id: number; name: string }[];
    known_for_department?: string;
    place_of_birth?: string | null;
    birthday?: string | null;
    deathday?: string | null;
    backdrop_path?: string | null;
};

interface CinematicInfoCardProps {
    tmdbId: number;
    initialData: BaseMediaData;
    mediaType: 'movie' | 'tv' | 'person';
    isOpen?: boolean;
    onClose?: () => void;
}

export function MediaInfoCard({
                                  tmdbId,
                                  initialData,
                                  mediaType,
                                  isOpen,
                                  onClose
                              }: CinematicInfoCardProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [apiDetails, setApiDetails] = useState<ApiDetails | null>(null);
    const [isPending, startTransition] = useTransition();

    const isControlled = typeof isOpen !== 'undefined' && typeof onClose !== 'undefined';
    const isModalOpen = isControlled ? isOpen : internalIsOpen;

    useEffect(() => {
        if (isModalOpen && !apiDetails && tmdbId) {
            startTransition(async () => {
                try {
                    let data = null;
                    if (mediaType === 'movie') data = await getMovieDetails(tmdbId);
                    else if (mediaType === 'tv') data = await getSeriesDetails(tmdbId);
                    else if (mediaType === 'person') data = await getPersonDetails(tmdbId);

                    if (data) setApiDetails(data as any);
                } catch (error) {
                    console.error("Failed to fetch details:", error);
                }
            });
        }
    }, [isModalOpen, tmdbId, mediaType, apiDetails]);

    const handleClose = () => {
        if (isControlled && onClose) onClose();
        else setInternalIsOpen(false);
    };

    if (!isModalOpen) return null;

    const displayDetails = { ...initialData, ...apiDetails };
    const rawBackdrop = apiDetails?.backdrop_path || displayDetails.backdrop_url;
    const backdropUrl = rawBackdrop?.startsWith('http')
        ? rawBackdrop
        : rawBackdrop ? `https://image.tmdb.org/t/p/original${rawBackdrop}` : displayDetails.poster_url;

    const deepLinkUrl = mediaType === 'person'
        ? `/discover/actor/${tmdbId}`
        : `/discover/${mediaType}/${tmdbId}`;

    const synopsis = mediaType === 'person'
        ? (displayDetails.biography || "No biography available.")
        : (displayDetails.overview || "No synopsis available.");

    const getBadgeConfig = () => {
        switch (mediaType) {
            case 'movie': return { color: 'blue', icon: FilmIcon, label: 'Movie' };
            case 'tv': return { color: 'green', icon: TvIcon, label: 'Series' };
            case 'person': return { color: 'purple', icon: UserIcon, label: 'Star' };
            default: return { color: 'gray', icon: StarIcon, label: 'Media' };
        }
    };
    const badge = getBadgeConfig();

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={handleClose}
        >
            <div
                className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative h-48 sm:h-56 w-full bg-zinc-800">
                    {backdropUrl && (
                        <Image
                            src={backdropUrl}
                            alt="Backdrop"
                            fill
                            className="object-cover opacity-60"
                            unoptimized
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white/70 hover:bg-black/60 hover:text-white backdrop-blur-md transition-colors z-10"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                    <div className="absolute top-4 left-4 z-10">
                        <span className={`
                            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-md border
                            ${mediaType === 'movie' ? 'bg-blue-500/20 border-blue-500/30 text-blue-100' : ''}
                            ${mediaType === 'tv' ? 'bg-green-500/20 border-green-500/30 text-green-100' : ''}
                            ${mediaType === 'person' ? 'bg-purple-500/20 border-purple-500/30 text-purple-100' : ''}
                        `}>
                            <badge.icon className="w-3 h-3" />
                            {badge.label}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="relative px-6 pb-6 -mt-12 flex flex-col gap-4">
                    <div className="flex gap-4">
                        <div className="shrink-0 relative w-24 h-36 rounded-lg overflow-hidden shadow-2xl ring-2 ring-zinc-800 bg-zinc-800">
                            {displayDetails.poster_url ? (
                                <Image
                                    src={displayDetails.poster_url}
                                    alt="Poster"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500"><UserIcon className="w-8 h-8"/></div>
                            )}
                        </div>
                        <div className="flex-1 pt-14">
                            <h2 className="text-2xl font-black text-white leading-tight mb-1 line-clamp-2">
                                {displayDetails.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                                <span>
                                    {displayDetails.release_date || displayDetails.birthday || (mediaType === 'person' ? '' : '')}
                                </span>
                                {displayDetails.known_for_department && (
                                    <>
                                        <span className="hidden sm:inline w-1 h-1 rounded-full bg-zinc-600" />
                                        <span className="text-zinc-300">{displayDetails.known_for_department}</span>
                                    </>
                                )}
                            </div>
                            {mediaType === 'person' && displayDetails.place_of_birth && (
                                <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                                    <MapPinIcon className="w-3 h-3" />
                                    <span className="truncate max-w-[200px]">{displayDetails.place_of_birth}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="min-h-[80px]">
                        {isPending ? (
                            <div className="flex justify-center py-4"><LoadingSpinner /></div>
                        ) : (
                            <p className="text-sm text-zinc-300 leading-relaxed line-clamp-4 whitespace-pre-line">
                                {synopsis}
                            </p>
                        )}
                    </div>

                    <div className="mt-2 pt-4 border-t border-white/5">
                        <Link
                            href={deepLinkUrl}
                            className="group w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3.5 rounded-xl hover:bg-indigo-500 hover:text-white transition-all duration-300"
                        >
                            <span>
                                {mediaType === 'person' ? 'Full Profile & Filmography' : 'Full Details & Cast'}
                            </span>
                            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

/* --- 5. ✨ UPDATED CAST & CREW SWITCHER (With Modal Integration) --- */
export function CastCrewSwitcher({ cast, crew }: { cast: any[], crew: any }) {
    const [view, setView] = useState<'cast' | 'crew'>('cast');
    const [selectedPerson, setSelectedPerson] = useState<BaseMediaData | null>(null);

    // Helper component for uniform card look
    const PersonCard = ({ id, name, role, image, department }: { id: number, name: string, role: string, image: string | null, department?: string }) => (
        <div
            onClick={() => setSelectedPerson({
                tmdb_id: id,
                title: name,
                poster_url: image ? `https://image.tmdb.org/t/p/w500${image}` : null,
                release_date: role // Using release_date field to store role for initial display if needed, or just relying on API
            })}
            className="space-y-2 group cursor-pointer block"
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-900 rounded-lg shadow-sm">
                {image ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w200${image}`}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                        <UserIcon className="w-8 h-8 opacity-20" />
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-semibold group-hover:text-amber-600 transition-colors line-clamp-1">{name}</p>
                <p className="text-xs text-zinc-500 line-clamp-1">{role}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => setView('cast')}
                    className={cn(
                        "pb-3 text-lg font-medium transition-colors flex items-center gap-2",
                        view === 'cast'
                            ? "text-zinc-900 dark:text-zinc-100 border-b-2 border-black dark:border-white"
                            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    )}
                >
                    <UserIcon className="w-4 h-4" />
                    Cast ({cast.length})
                </button>
                <button
                    onClick={() => setView('crew')}
                    className={cn(
                        "pb-3 text-lg font-medium transition-colors flex items-center gap-2",
                        view === 'crew'
                            ? "text-zinc-900 dark:text-zinc-100 border-b-2 border-black dark:border-white"
                            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    )}
                >
                    <WrenchIcon className="w-4 h-4" />
                    Crew
                </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[400px]">
                {view === 'cast' ? (
                    /* Cast Grid */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {cast.slice(0, 18).map((actor: any, index: number) => (
                            <PersonCard
                                // ✨ FIXED: Use safe key combination with fallback index to avoid NaN errors
                                key={`${actor.id}-${index}`}
                                id={actor.id}
                                name={actor.name}
                                role={actor.character}
                                image={actor.profile_path}
                            />
                        ))}
                    </div>
                ) : (
                    /* Crew Grid - Responsive Fixed */
                    <div className="space-y-12">
                        {/* 1. Directing / Writing */}
                        {crew.writers?.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 border-l-2 border-zinc-500 pl-3">Writing & Directing</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                    {crew.writers.map((p: any, i: number) => (
                                        <PersonCard key={`${p.id}-writer-${i}`} id={p.id} name={p.name} role={p.job} image={p.profile_path} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. Cinematography */}
                        {crew.cinematographers?.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 border-l-2 border-zinc-500 pl-3">Cinematography</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                    {crew.cinematographers.map((p: any, i: number) => (
                                        <PersonCard key={`${p.id}-dop-${i}`} id={p.id} name={p.name} role={p.job} image={p.profile_path} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Music */}
                        {crew.composers?.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 border-l-2 border-zinc-500 pl-3">Music</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                    {crew.composers.map((p: any, i: number) => (
                                        <PersonCard key={`${p.id}-music-${i}`} id={p.id} name={p.name} role={p.job} image={p.profile_path} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. Production */}
                        {crew.producers?.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 border-l-2 border-zinc-500 pl-3">Production</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                    {crew.producers.slice(0, 6).map((p: any, i: number) => (
                                        <PersonCard key={`${p.id}-prod-${i}`} id={p.id} name={p.name} role={p.job} image={p.profile_path} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ✨ RENDER MODAL */}
            {selectedPerson && (
                <MediaInfoCard
                    tmdbId={selectedPerson.tmdb_id}
                    initialData={selectedPerson}
                    mediaType="person"
                    isOpen={!!selectedPerson}
                    onClose={() => setSelectedPerson(null)}
                />
            )}
        </div>
    );
}