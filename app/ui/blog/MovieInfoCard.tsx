// @/app/ui/blog/MovieInfoCard.tsx

'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { getMovieDetails } from '@/lib/actions/blog-actions';
import { UserGroupIcon, XMarkIcon, FilmIcon, StarIcon, CalendarIcon, ClockIcon, PlayIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { Movie } from '@/lib/definitions';

type MovieDetailsFromApi = {
    overview: string;
    cast: { name: string; profile_path: string; character: string }[];
    genres: { id: number; name: string }[];
    director?: string;
    runtime?: number;
    vote_average?: number;
    vote_count?: number;
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
            {/* Subtle Reference Card */}
            <div className="my-8 mx-auto max-w-2xl">
                {/* Small reference label */}
                <div className="mb-3 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                        <FilmIcon className="w-3 h-3" />
                        Movie Reference
                    </span>
                </div>

                {/* Compact card */}
                <button
                    onClick={handleOpenModal}
                    className="group w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:border-gray-300/80 dark:hover:border-gray-600/80 transition-all duration-200"
                >
                    {/* Small poster */}
                    {initialMovieData.poster_url && (
                        <div className="relative flex-shrink-0">
                            <Image
                                src={initialMovieData.poster_url}
                                alt={`Poster for ${initialMovieData.title}`}
                                width={60}
                                height={90}
                                className="rounded-lg object-cover shadow-sm"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-blue-600 dark:bg-blue-500 rounded-full p-1">
                                <FilmIcon className="w-2.5 h-2.5 text-white" />
                            </div>
                        </div>
                    )}

                    {/* Movie info */}
                    <div className="flex-1 text-left min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {initialMovieData.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {initialMovieData.release_date ? new Date(initialMovieData.release_date).getFullYear() : 'Unknown Year'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                            <span>Click for details</span>
                            <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </button>

                {/* Subtle caption */}
                <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400 italic">
                    Referenced in this article
                </p>
            </div>

            {/* Keep the existing modal - it's fine when opened */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}>
                    <div className="relative w-full max-w-7xl max-h-[95vh] overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="relative h-80 lg:h-96">
                            {displayDetails.poster_url && (
                                <>
                                    <Image
                                        src={displayDetails.poster_url.replace('w500', 'original')}
                                        alt={`Backdrop for ${displayDetails.title}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                </>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors duration-200"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>

                            {/* Modal Title Overlay */}
                            <div className="absolute bottom-8 left-8 right-8">
                                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                                    {displayDetails.title}
                                </h1>
                                <div className="flex items-center gap-6 text-white/80">
                                    <span className="text-lg font-medium">{new Date(displayDetails.release_date || '').getFullYear()}</span>
                                    {displayDetails.runtime && <span>{displayDetails.runtime} minutes</span>}
                                    {displayDetails.vote_average && (
                                        <div className="flex items-center gap-1">
                                            <StarIcon className="w-5 h-5 text-yellow-400" />
                                            <span>{displayDetails.vote_average.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="max-h-[calc(95vh-20rem)] overflow-y-auto p-8">
                            {isPending ? (
                                <div className="flex justify-center items-center h-64">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Overview */}
                                    {displayDetails.overview && (
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Synopsis</h3>
                                            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                                {displayDetails.overview}
                                            </p>
                                        </div>
                                    )}

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Genres and Director */}
                                        <div className="space-y-6">
                                            {displayDetails.genres && displayDetails.genres.length > 0 && (
                                                <div>
                                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Genres</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {displayDetails.genres.map((genre) => (
                                                            <span
                                                                key={genre.id}
                                                                className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                                            >
                                                                {genre.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {displayDetails.director && (
                                                <div>
                                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Director</h4>
                                                    <p className="text-lg text-gray-700 dark:text-gray-300">{displayDetails.director}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Cast */}
                                        {displayDetails.cast && displayDetails.cast.length > 0 && (
                                            <div>
                                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Cast</h4>
                                                <div className="space-y-3">
                                                    {displayDetails.cast.slice(0, 6).map((actor) => (
                                                        <div key={actor.name} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                                                            {actor.profile_path ? (
                                                                <Image
                                                                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                                                    alt={actor.name}
                                                                    width={48}
                                                                    height={48}
                                                                    className="w-12 h-12 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                                    <UserGroupIcon className="w-6 h-6 text-gray-400" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-semibold text-gray-900 dark:text-white">{actor.name}</p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{actor.character}</p>
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
            )}
        </>
    );
}