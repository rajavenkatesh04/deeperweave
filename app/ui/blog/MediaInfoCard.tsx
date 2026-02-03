'use client';

import { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetails, getSeriesDetails, getPersonDetails } from '@/lib/actions/cinematic-actions';
import {
    XMarkIcon,
    FilmIcon,
    TvIcon,
    ArrowRightIcon,
    StarIcon,
    UserIcon,
    MapPinIcon
} from '@heroicons/react/24/solid';
import LoadingSpinner from '@/app/ui/loading-spinner';

// --- Types ---

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
};

interface CinematicInfoCardProps {
    tmdbId: number;
    initialData: BaseMediaData;
    mediaType: 'movie' | 'tv' | 'person';
    isOpen?: boolean;
    onClose?: () => void;
}

export default function MediaInfoCard({
                                          tmdbId,
                                          initialData,
                                          mediaType,
                                          isOpen,
                                          onClose
                                      }: CinematicInfoCardProps) {
    const isControlled = typeof isOpen !== 'undefined' && typeof onClose !== 'undefined';
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [apiDetails, setApiDetails] = useState<ApiDetails | null>(null);
    const [isPending, startTransition] = useTransition();

    const isModalOpen = isControlled ? isOpen : internalIsOpen;

    // --- Data Fetching ---
    useEffect(() => {
        if (isModalOpen && !apiDetails) {
            startTransition(async () => {
                try {
                    if (mediaType === 'movie') {
                        const data = await getMovieDetails(tmdbId);
                        setApiDetails(data);
                    } else if (mediaType === 'tv') {
                        const data = await getSeriesDetails(tmdbId);
                        setApiDetails(data);
                    } else if (mediaType === 'person') {
                        const data = await getPersonDetails(tmdbId);
                        setApiDetails(data);
                    }
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

    const displayDetails = { ...initialData, ...apiDetails };

    const rawBackdrop = (apiDetails as any)?.backdrop_path || displayDetails.backdrop_url;
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
            case 'movie': return { icon: FilmIcon, label: 'Movie' };
            case 'tv': return { icon: TvIcon, label: 'Series' };
            case 'person': return { icon: UserIcon, label: 'Star' };
        }
    };
    const badge = getBadgeConfig();

    return (
        <>
            {/* Modal Overlay */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={handleClose}
                >
                    {/* The "Teaser Ticket" Card */}
                    {/* 🎨 Updated: bg-white for light, bg-zinc-900 for dark */}
                    <div
                        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl ring-1 ring-zinc-200 dark:ring-white/10 animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 1. Cinematic Header (Backdrop) */}
                        <div className="relative h-48 sm:h-56 w-full bg-zinc-200 dark:bg-zinc-800">
                            <Image
                                src={backdropUrl || '/placeholder-backdrop.jpg'}
                                alt="Backdrop"
                                fill
                                className="object-cover opacity-60"
                                unoptimized
                            />
                            {/* 🎨 Updated: Gradient goes to White in light mode, Zinc-900 in dark mode */}
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-zinc-900 dark:via-zinc-900/40" />

                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors z-10"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>

                            {/* Floating Badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <span className={`
                                    inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-md border shadow-sm
                                    ${mediaType === 'movie' ? 'bg-blue-500/90 text-white border-blue-400/50 dark:bg-blue-500/20 dark:text-blue-100 dark:border-blue-500/30' : ''}
                                    ${mediaType === 'tv' ? 'bg-green-500/90 text-white border-green-400/50 dark:bg-green-500/20 dark:text-green-100 dark:border-green-500/30' : ''}
                                    ${mediaType === 'person' ? 'bg-purple-500/90 text-white border-purple-400/50 dark:bg-purple-500/20 dark:text-purple-100 dark:border-purple-500/30' : ''}
                                `}>
                                    <badge.icon className="w-3 h-3" />
                                    {badge.label}
                                </span>
                            </div>
                        </div>

                        {/* 2. Content Body */}
                        <div className="relative px-6 pb-6 -mt-12 flex flex-col gap-4">

                            {/* Row: Poster + Title */}
                            <div className="flex gap-4">
                                {/* Poster (Elevated) */}
                                {/* 🎨 Updated: Ring color for light mode */}
                                <div className="shrink-0 relative w-24 h-36 rounded-lg overflow-hidden shadow-2xl ring-4 ring-white dark:ring-zinc-800 bg-zinc-200 dark:bg-zinc-800">
                                    <Image
                                        src={displayDetails.poster_url || '/placeholder.jpg'}
                                        alt="Poster"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>

                                {/* Header Info */}
                                <div className="flex-1 pt-14">
                                    {/* 🎨 Updated: Title Color */}
                                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight mb-1 line-clamp-2">
                                        {displayDetails.title}
                                    </h2>

                                    {/* 🎨 Updated: Subtitle Color */}
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        {/* Date / Year */}
                                        <span>
                                            {displayDetails.release_date || displayDetails.birthday || (mediaType === 'person' ? 'Unknown' : '')}
                                        </span>

                                        {/* Rating (Media) */}
                                        {displayDetails.vote_average && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                                                <div className="flex items-center gap-1 text-amber-500 dark:text-yellow-500 font-bold">
                                                    <StarIcon className="w-3.5 h-3.5" />
                                                    {displayDetails.vote_average.toFixed(1)}
                                                </div>
                                            </>
                                        )}

                                        {/* Seasons (TV) */}
                                        {displayDetails.number_of_seasons && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                                                <span>{displayDetails.number_of_seasons} Seasons</span>
                                            </>
                                        )}

                                        {/* Department (Person) */}
                                        {mediaType === 'person' && displayDetails.known_for_department && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                                                <span className="text-zinc-600 dark:text-zinc-300">{displayDetails.known_for_department}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Place of Birth (Person Extra) */}
                                    {mediaType === 'person' && displayDetails.place_of_birth && (
                                        <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                                            <MapPinIcon className="w-3 h-3" />
                                            <span className="truncate">{displayDetails.place_of_birth}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. Short Synopsis / Bio */}
                            <div className="min-h-[80px]">
                                {isPending ? (
                                    <div className="flex justify-center py-4"><LoadingSpinner /></div>
                                ) : (
                                    /* 🎨 Updated: Text color */
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed line-clamp-3 whitespace-pre-line">
                                        {synopsis}
                                    </p>
                                )}
                            </div>

                            {/* 4. Genres Chips (Media Only) */}
                            {!isPending && mediaType !== 'person' && displayDetails.genres && (
                                <div className="flex flex-wrap gap-2">
                                    {displayDetails.genres.slice(0, 3).map(g => (
                                        /* 🎨 Updated: Chip background and border */
                                        <span key={g.id} className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-600 dark:bg-white/5 dark:border-white/5 dark:text-zinc-300">
                                            {g.name}
                                        </span>
                                    ))}
                                    {displayDetails.genres.length > 3 && (
                                        <span className="text-xs px-2.5 py-1 text-zinc-500">+{displayDetails.genres.length - 3}</span>
                                    )}
                                </div>
                            )}

                            {/* 5. Big Call-To-Action Button */}
                            {/* 🎨 Updated: Border color */}
                            <div className="mt-2 pt-4 border-t border-zinc-100 dark:border-white/5">
                                <Link
                                    href={deepLinkUrl}
                                    /* 🎨 Updated: Inverted button colors for high contrast in both modes */
                                    className="group w-full flex items-center justify-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-black font-bold py-3.5 rounded-xl hover:bg-zinc-700 dark:hover:bg-indigo-500 dark:hover:text-white transition-all duration-300"
                                >
                                    <span>
                                        {mediaType === 'person' ? 'Full Profile & Filmography' : 'Full Details & Cast'}
                                    </span>
                                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}