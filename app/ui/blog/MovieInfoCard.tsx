// @/app/ui/blog/MovieInfoCard.tsx

'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { getMovieDetails } from '@/lib/actions/blog-actions';
import { UserGroupIcon, XMarkIcon, FilmIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
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
            {/* Compact Movie Card - Always shows poster on left, details on right */}
            <div className="my-8 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                    onClick={handleOpenModal}
                    className="w-full text-left p-4 md:p-5 flex items-start gap-4 group"
                    aria-label="View movie details"
                >
                    {/* Poster - Always visible */}
                    {initialMovieData.poster_url && (
                        <div className="flex-shrink-0 relative">
                            <div className="w-16 h-24 md:w-20 md:h-28 overflow-hidden rounded-md shadow-sm">
                                <Image
                                    src={initialMovieData.poster_url}
                                    alt={`Poster for ${initialMovieData.title}`}
                                    width={80}
                                    height={120}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-blue-600 dark:bg-blue-500 rounded-full p-1">
                                <FilmIcon className="h-3 w-3 text-white" />
                            </div>
                        </div>
                    )}

                    {/* Details - Always visible */}
                    <div className="flex-grow min-w-0">
                        <div className="mb-1">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                                <FilmIcon className="h-3 w-3" />
                                Featured Movie
                            </span>
                        </div>

                        <h3 className="font-bold text-gray-900 dark:text-white text-lg md:text-xl mb-1 truncate">
                            {initialMovieData.title || 'N/A'}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Released: {initialMovieData.release_date || 'N/A'}</span>
                        </div>

                        <div className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1 group-hover:underline">
                            View details
                            <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </button>
            </div>

            {/* Enhanced Modal with improved layout */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-4 z-20 rounded-full bg-white/90 p-2 text-gray-500 shadow-md transition-all hover:bg-gray-100 hover:text-gray-900 dark:bg-zinc-800/90 dark:text-gray-400 dark:hover:bg-zinc-700 dark:hover:text-white"
                            aria-label="Close"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>

                        <div className="flex-grow overflow-y-auto">
                            {/* Header with poster and basic info */}
                            <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Large poster - top on mobile, left on desktop */}
                                    {displayDetails.poster_url && (
                                        <div className="flex-shrink-0 mx-auto md:mx-0">
                                            <div className="w-40 h-60 md:w-48 md:h-72 overflow-hidden rounded-lg shadow-lg">
                                                <Image
                                                    src={displayDetails.poster_url.replace('w500', 'w780')}
                                                    alt={`Poster for ${displayDetails.title}`}
                                                    width={192}
                                                    height={288}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Title and basic info */}
                                    <div className="flex-grow text-center md:text-left">
                                        <div className="mb-2">
                                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                                                <FilmIcon className="h-4 w-4" />
                                                Featured Movie
                                            </span>
                                        </div>

                                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                            {displayDetails.title || 'N/A'}
                                        </h2>

                                        <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 dark:text-gray-400 mb-4">
                                            <CalendarIcon className="h-5 w-5" />
                                            <span className="text-lg">Released: {displayDetails.release_date || 'N/A'}</span>
                                        </div>

                                        {/* Director and genres - below poster on desktop */}
                                        <div className="md:hidden mt-4 space-y-3">
                                            {displayDetails.director && (
                                                <div>
                                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                                                        <UserIcon className="h-4 w-4" />
                                                        <span className="font-medium">Director:</span>
                                                    </div>
                                                    <p className="text-gray-900 dark:text-white">{displayDetails.director}</p>
                                                </div>
                                            )}

                                            {displayDetails.genres && displayDetails.genres.length > 0 && (
                                                <div>
                                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Genres:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {displayDetails.genres.map((genre) => (
                                                            <span
                                                                key={genre.id}
                                                                className="text-xs px-3 py-1 bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-300 rounded-full"
                                                            >
                                                                {genre.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main content area */}
                            <div className="p-6">
                                {isPending ? (
                                    <div className="flex justify-center items-center h-40">
                                        <LoadingSpinner />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Left column - Director and genres (desktop only) */}
                                        <div className="lg:col-span-1 hidden lg:block space-y-6">
                                            {displayDetails.director && (
                                                <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
                                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                                                        <UserIcon className="h-5 w-5" />
                                                        <span className="font-medium">Director</span>
                                                    </div>
                                                    <p className="text-gray-900 dark:text-white text-lg">{displayDetails.director}</p>
                                                </div>
                                            )}

                                            {displayDetails.genres && displayDetails.genres.length > 0 && (
                                                <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
                                                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-3">Genres</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {displayDetails.genres.map((genre) => (
                                                            <span
                                                                key={genre.id}
                                                                className="text-sm px-3 py-1.5 bg-white text-gray-800 dark:bg-zinc-700 dark:text-gray-200 rounded-full shadow-sm"
                                                            >
                                                                {genre.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right column - Synopsis and cast */}
                                        <div className="lg:col-span-2 space-y-8">
                                            {displayDetails.overview && (
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Synopsis</h3>
                                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                        {displayDetails.overview}
                                                    </p>
                                                </div>
                                            )}

                                            {displayDetails.cast && displayDetails.cast.length > 0 && (
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Cast</h3>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                        {displayDetails.cast.slice(0, 8).map((actor) => (
                                                            <div key={actor.name} className="text-center">
                                                                {actor.profile_path ? (
                                                                    <div className="mb-3 mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-md">
                                                                        <Image
                                                                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                                                            alt={actor.name}
                                                                            width={80}
                                                                            height={80}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="mb-3 mx-auto w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-zinc-700 dark:text-gray-400 shadow-md">
                                                                        <UserGroupIcon className="h-8 w-8" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                                                                        {actor.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                                        {actor.character}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}