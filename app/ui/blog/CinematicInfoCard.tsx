'use client';

import { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // ✨ Import Link for navigation
import { getMovieDetails, getSeriesDetails } from '@/lib/actions/cinematic-actions';
import {
    XMarkIcon,
    FilmIcon,
    TvIcon,
    ArrowRightIcon,
    StarIcon
} from '@heroicons/react/24/solid';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { Movie, Series } from '@/lib/definitions';

// Simplified API Details (Just enough for a teaser)
type ApiDetails = {
    overview: string;
    vote_average?: number;
    runtime?: number; // minutes
    number_of_seasons?: number;
    genres: { id: number; name: string }[];
};

interface CinematicInfoCardProps {
    tmdbId: number;
    initialData: Movie | Series;
    mediaType: 'movie' | 'tv';
    isOpen?: boolean;
    onClose?: () => void;
}

export default function CinematicInfoCard({
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

    // --- Data Fetching (Keep it simple) ---
    useEffect(() => {
        if (isModalOpen && !apiDetails) {
            startTransition(async () => {
                try {
                    if (mediaType === 'movie') {
                        const data = await getMovieDetails(tmdbId);
                        setApiDetails(data);
                    } else {
                        const data = await getSeriesDetails(tmdbId);
                        setApiDetails(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch teaser details:", error);
                }
            });
        }
    }, [isModalOpen, tmdbId, mediaType, apiDetails]);

    const handleClose = () => {
        if (isControlled && onClose) onClose();
        else setInternalIsOpen(false);
    };

    // Merge Data
    const displayDetails = { ...initialData, ...apiDetails };
    const backdropUrl = displayDetails.backdrop_url || displayDetails.poster_url;

    // Construct the Deep Link
    const deepLinkUrl = `/discover/${mediaType}/${tmdbId}`;

    return (
        <>
            {/* Modal Overlay */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={handleClose}
                >
                    {/* The "Teaser Ticket" Card */}
                    <div
                        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 1. Cinematic Header (Backdrop) */}
                        <div className="relative h-48 sm:h-56 w-full">
                            <Image
                                src={backdropUrl || '/placeholder-backdrop.jpg'}
                                alt="Backdrop"
                                fill
                                className="object-cover opacity-60"
                                unoptimized
                            />
                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white/70 hover:bg-black/60 hover:text-white backdrop-blur-md transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>

                            {/* Floating Badge */}
                            <div className="absolute top-4 left-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-md border ${
                                    mediaType === 'movie'
                                        ? 'bg-blue-500/20 border-blue-500/30 text-blue-100'
                                        : 'bg-green-500/20 border-green-500/30 text-green-100'
                                }`}>
                                    {mediaType === 'movie' ? <FilmIcon className="w-3 h-3" /> : <TvIcon className="w-3 h-3" />}
                                    {mediaType === 'movie' ? 'Movie' : 'Series'}
                                </span>
                            </div>
                        </div>

                        {/* 2. Content Body */}
                        <div className="relative px-6 pb-6 -mt-12 flex flex-col gap-4">

                            {/* Row: Poster + Title */}
                            <div className="flex gap-4">
                                {/* Poster (Elevated) */}
                                <div className="shrink-0 relative w-24 h-36 rounded-lg overflow-hidden shadow-2xl ring-2 ring-zinc-800 bg-zinc-800">
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
                                    <h2 className="text-2xl font-black text-white leading-tight mb-1 line-clamp-2">
                                        {displayDetails.title}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                                        <span>{displayDetails.release_date?.split('-')[0]}</span>
                                        {displayDetails.vote_average && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                                <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                                    <StarIcon className="w-3.5 h-3.5" />
                                                    {displayDetails.vote_average.toFixed(1)}
                                                </div>
                                            </>
                                        )}
                                        {displayDetails.number_of_seasons && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                                <span>{displayDetails.number_of_seasons} Seasons</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 3. Short Synopsis */}
                            <div className="min-h-[80px]">
                                {isPending ? (
                                    <div className="flex justify-center py-4"><LoadingSpinner /></div>
                                ) : (
                                    <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3">
                                        {displayDetails.overview || "No synopsis available."}
                                    </p>
                                )}
                            </div>

                            {/* 4. Genres Chips */}
                            {!isPending && displayDetails.genres && (
                                <div className="flex flex-wrap gap-2">
                                    {displayDetails.genres.slice(0, 3).map(g => (
                                        <span key={g.id} className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-zinc-300">
                                            {g.name}
                                        </span>
                                    ))}
                                    {displayDetails.genres.length > 3 && (
                                        <span className="text-xs px-2.5 py-1 text-zinc-500">+{displayDetails.genres.length - 3}</span>
                                    )}
                                </div>
                            )}

                            {/* 5. Big Call-To-Action Button */}
                            <div className="mt-2 pt-4 border-t border-white/5">
                                <Link
                                    href={deepLinkUrl}
                                    className="group w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3.5 rounded-xl hover:bg-indigo-500 hover:text-white transition-all duration-300"
                                >
                                    <span>Full Details & Cast</span>
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