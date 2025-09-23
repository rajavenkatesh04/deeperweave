// @/app/ui/blog/MovieInfoCard.tsx

'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { getMovieDetails } from '@/lib/actions/blog-actions';
import { UserGroupIcon, XMarkIcon, FilmIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { Movie } from '@/lib/definitions';

type MovieDetailsFromApi = {
    overview: string;
    cast: { name: string; profile_path: string; character: string }[];
    genres: { id: number; name: string }[];
    director?: string;
};

export default function MovieInfoCard({ movieApiId, initialMovieData }: {
    movieApiId: number;
    initialMovieData: Movie;
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [apiDetails, setApiDetails] = useState<MovieDetailsFromApi | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleOpenModal = () => {
        setIsModalOpen(true);
        if (!apiDetails) {
            startTransition(async () => {
                try {
                    const movieDetails = await getMovieDetails(movieApiId);
                    setApiDetails(movieDetails);
                } catch (error) {
                    console.error("Failed to fetch movie details from API:", error);
                }
            });
        }
    };

    const displayDetails = {
        ...initialMovieData,
        ...apiDetails
    };

    return (
        <>
            {/* Compact Featured Movie Reference Card */}
            <div className="my-6 relative ">
                <button
                    onClick={handleOpenModal}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 p-4 md:p-6 text-left shadow-lg ring-2 ring-blue-100/40 backdrop-blur-sm transition-all duration-500 hover:scale-[1.01] hover:shadow-xl hover:ring-blue-300/60 dark:from-slate-900/95 dark:via-blue-950/30 dark:to-indigo-950/40 dark:ring-blue-800/40 dark:hover:ring-blue-500/60"
                >
                    {/* Animated background elements */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/8 to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="absolute -top-2 -right-2 h-16 w-16 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-500/10 blur-xl transition-all duration-500 group-hover:scale-125" />

                    <div className="relative flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                        {/* Movie Poster - Compact on mobile */}
                        {initialMovieData.poster_url && (
                            <div className="relative flex-shrink-0">
                                <div className="overflow-hidden rounded-xl shadow-lg ring-2 ring-white/40 transition-all duration-500 group-hover:scale-105 group-hover:ring-blue-200/60 dark:ring-slate-700/40 dark:group-hover:ring-blue-400/40">
                                    <Image
                                        src={initialMovieData.poster_url}
                                        alt={`Poster for ${initialMovieData.title}`}
                                        width={80}
                                        height={120}
                                        className="md:w-24 md:h-36 object-cover"
                                    />
                                </div>
                                {/* Glow effect */}
                                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 opacity-0 blur transition-opacity duration-500 group-hover:opacity-40" />

                                {/* Film icon overlay - smaller on mobile */}
                                <div className="absolute -bottom-1 -right-1 rounded-full bg-blue-600 p-1.5 shadow-md ring-2 ring-white dark:bg-blue-500 dark:ring-slate-800">
                                    <FilmIcon className="h-3 w-3 text-white" />
                                </div>
                            </div>
                        )}

                        {/* Movie Info - Centered on mobile */}
                        <div className="flex-grow text-center md:text-left">
                            <div className="mb-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-100/80 via-orange-100/60 to-amber-100/80 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 ring-1 ring-amber-200/50 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-amber-900/40 dark:text-amber-300 dark:ring-amber-700/30">
                                    <FilmIcon className="h-2.5 w-2.5" />
                                    In this post
                                </span>
                            </div>

                            <h3 className="mb-2 text-2xl md:text-3xl font-bold leading-tight tracking-tight text-slate-900 transition-colors duration-500 group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-400">
                                {initialMovieData.title || 'N/A'}
                            </h3>

                            <p className="mb-3 md:mb-4 text-sm md:text-base text-slate-600 dark:text-slate-400">
                                Released: <span className="font-semibold">{initialMovieData.release_date || 'N/A'}</span>
                            </p>

                            {/* Compact call-to-action */}
                            <div className="flex items-center justify-center md:justify-start gap-2 text-blue-600 opacity-70 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100 dark:text-blue-400">
                                <span className="text-xs md:text-sm font-semibold">Click for details</span>
                                <svg className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Bottom accent - thinner */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </button>

                {/* Compact subtitle */}
                <div className="mt-2 text-center">
                    <p className="text-xs text-slate-500 italic dark:text-slate-400">
                        Referenced in the article above
                    </p>
                </div>
            </div>

            {/* Enhanced Modal with proper responsive design */}
            {isModalOpen && (
                <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/70 p-2 md:p-4 backdrop-blur-xl animate-fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="relative flex flex-col w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] transform rounded-2xl md:rounded-3xl bg-white/96 shadow-2xl ring-2 ring-black/10 backdrop-blur-2xl transition-all dark:bg-slate-900/96 dark:ring-white/10" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-3 top-3 md:right-6 md:top-6 z-20 rounded-full bg-slate-100/90 p-2 md:p-3 text-slate-500 transition-all duration-200 hover:bg-slate-200 hover:text-slate-900 hover:scale-110 dark:bg-slate-800/90 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                        >
                            <XMarkIcon className="h-5 w-5 md:h-6 md:w-6" />
                        </button>

                        <div className="flex-grow overflow-y-auto p-4 md:p-8">
                            {/* Modal header */}
                            <div className="mb-6 md:mb-8 text-center">
                                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-3 md:px-4 py-1.5 md:py-2 dark:from-blue-900/30 dark:to-indigo-900/30">
                                    <FilmIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs md:text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                                        Featured Movie Details
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
                                <div className="lg:col-span-1">
                                    {displayDetails.poster_url && (
                                        <div className="group relative mb-4 md:mb-6 overflow-hidden rounded-xl md:rounded-2xl shadow-xl ring-2 md:ring-4 ring-black/10 dark:ring-white/10 max-w-xs mx-auto lg:max-w-none">
                                            <Image
                                                src={displayDetails.poster_url.replace('w500', 'w780')}
                                                alt={`Poster for ${displayDetails.title}`}
                                                width={300}
                                                height={450}
                                                className="w-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-3 md:space-y-4">
                                        <div className="rounded-lg md:rounded-xl bg-slate-50 p-3 md:p-4 dark:bg-slate-800/50">
                                            <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-1 text-sm md:text-base">Director</h4>
                                            <p className="text-slate-800 dark:text-slate-200 text-sm md:text-base">{displayDetails.director || 'N/A'}</p>
                                        </div>
                                        {displayDetails.genres && (
                                            <div className="space-y-2">
                                                <h4 className="font-bold text-blue-700 dark:text-blue-400 text-sm md:text-base">Genres</h4>
                                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                                    {displayDetails.genres.map((genre) => (
                                                        <span
                                                            key={genre.id}
                                                            className="text-xs px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-300 rounded-full font-semibold"
                                                        >
                                                            {genre.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="lg:col-span-2">
                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                        {displayDetails.title || 'N/A'}
                                    </h3>
                                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-6 md:mb-8">
                                        Released: {displayDetails.release_date || 'N/A'}
                                    </p>

                                    {isPending ? (
                                        <div className="flex justify-center items-center h-32 md:h-64">
                                            <LoadingSpinner />
                                        </div>
                                    ) : (
                                        <div className="space-y-6 md:space-y-8">
                                            {displayDetails.overview && (
                                                <div>
                                                    <h4 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-3 md:mb-4">Synopsis</h4>
                                                    <p className="text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                                                        {displayDetails.overview}
                                                    </p>
                                                </div>
                                            )}
                                            {displayDetails.cast && displayDetails.cast.length > 0 && (
                                                <div>
                                                    <h4 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-4 md:mb-6">Main Cast</h4>
                                                    <div className="grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-2">
                                                        {displayDetails.cast.slice(0, 8).map((actor) => (
                                                            <div key={actor.name} className="flex items-center gap-3 md:gap-4 p-2.5 md:p-3 rounded-lg md:rounded-xl bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                                {actor.profile_path ? (
                                                                    <div className="flex-shrink-0">
                                                                        <Image
                                                                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                                                            alt={actor.name}
                                                                            width={48}
                                                                            height={48}
                                                                            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover ring-2 ring-white dark:ring-slate-700"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 flex-shrink-0">
                                                                        <UserGroupIcon className="h-6 w-6 md:h-7 md:w-7" />
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm md:text-base">
                                                                        {actor.name}
                                                                    </p>
                                                                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">
                                                                        {actor.character}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
            `}</style>
        </>
    );
}