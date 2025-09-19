// app/ui/blog/MovieInfoCard.tsx
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { getMovieDetails } from '@/lib/actions/blog-actions';
import { UserGroupIcon, XMarkIcon, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import LoadingSpinner from '@/app/ui/loading-spinner';

// Updated type to match what getMovieDetails actually returns
type MovieDetails = {
    overview: string;
    cast: { id?: number; name: string; character: string; profile_path?: string }[];
    director: string;
    genres: { id: number; name: string }[];
};

export default function MovieInfoCard({ movieApiId, movieTitle, moviePosterUrl, movieReleaseDate }: {
    movieApiId: number;
    movieTitle?: string;
    moviePosterUrl?: string;
    movieReleaseDate?: string;
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [details, setDetails] = useState<MovieDetails | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleOpenModal = () => {
        setIsModalOpen(true);
        if (!details) {
            startTransition(async () => {
                try {
                    const movieDetails = await getMovieDetails(movieApiId);
                    setDetails(movieDetails);
                } catch (error) {
                    console.error(error);
                    setIsModalOpen(false);
                }
            });
        }
    };

    return (
        <>
            {/* Redesigned Premium Card */}
            <button
                onClick={handleOpenModal}
                className="group relative my-8 flex w-full overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/50 p-6 text-left shadow-lg ring-1 ring-gray-200/50 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:ring-red-300/50 dark:from-zinc-900 dark:to-zinc-800/50 dark:ring-zinc-700/50 dark:hover:ring-red-600/50"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {moviePosterUrl && (
                    <div className="relative flex-shrink-0">
                        <div className="overflow-hidden rounded-xl shadow-lg ring-2 ring-white/20 transition-transform duration-500 group-hover:scale-105">
                            <Image
                                src={moviePosterUrl}
                                alt={`Poster for ${movieTitle}`}
                                width={120}
                                height={180}
                                className="object-cover"
                            />
                        </div>
                        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 blur transition-opacity duration-500 group-hover:opacity-30" />
                    </div>
                )}
                <div className="relative ml-6 flex flex-grow flex-col justify-center">
                    <div className="mb-3 flex items-center gap-2">
                        <StarSolid className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
                            Featured Movie
                        </span>
                    </div>
                    <h3 className="mb-2 text-3xl font-bold leading-tight tracking-tight text-gray-900 transition-colors duration-300 group-hover:text-red-700 dark:text-zinc-100 dark:group-hover:text-red-400">
                        {movieTitle}
                    </h3>
                    <p className="mb-4 text-sm font-medium text-gray-500 dark:text-zinc-400">
                        Released: {movieReleaseDate}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-semibold text-red-600 opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100 dark:text-red-400">
                        <span>Explore Details</span>
                        <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                </div>
            </button>

            {/* MODAL: Refined size, responsive layout, and fixed styles */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-lg animate-fade-in"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] transform rounded-2xl bg-white/95 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl transition-all dark:bg-zinc-900/95 dark:ring-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-4 z-20 rounded-full bg-gray-100/80 p-2 text-gray-500 transition-all duration-200 hover:bg-gray-200 hover:text-gray-900 dark:bg-zinc-800/80 dark:text-gray-400 dark:hover:bg-zinc-700 dark:hover:text-white"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>

                        {isPending || !details ? (
                            <div className="flex h-96 items-center justify-center">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <div className="flex-grow overflow-y-auto p-8">
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                    {/* Left Column: Poster & Quick Info */}
                                    <div className="md:col-span-1">
                                        {moviePosterUrl && (
                                            <div className="group relative mb-4 overflow-hidden rounded-xl shadow-xl">
                                                <Image
                                                    src={moviePosterUrl.replace('w500', 'w780')}
                                                    alt={`Poster for ${movieTitle}`}
                                                    width={384}
                                                    height={576}
                                                    className="w-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="font-semibold text-red-700 dark:text-red-400">Director</h4>
                                                <p className="text-sm text-gray-800 dark:text-zinc-200">{details.director}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {details.genres.map((genre) => (
                                                    <span key={genre.id} className="text-xs px-2.5 py-1 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 rounded-full font-medium">{genre.name}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Details & Cast */}
                                    <div className="md:col-span-2">
                                        <h3 className="text-4xl font-bold text-gray-900 dark:text-zinc-100">{movieTitle}</h3>
                                        <p className="mt-1 text-md text-gray-500 dark:text-zinc-400">{movieReleaseDate}</p>

                                        <div className="mt-6">
                                            <h4 className="text-lg font-semibold text-red-700 dark:text-red-400">Synopsis</h4>
                                            <p className="mt-2 text-base text-gray-700 dark:text-zinc-300">{details.overview}</p>
                                        </div>

                                        <div className="mt-6">
                                            <h4 className="text-lg font-semibold text-red-700 dark:text-red-400">Main Cast</h4>
                                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                {details.cast.slice(0, 8).map((actor, index) => (
                                                    <div key={actor.id || `${actor.name}-${index}`} className="flex items-center gap-3">
                                                        {actor.profile_path ? (
                                                            <Image
                                                                src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                                                alt={actor.name}
                                                                width={48}
                                                                height={48}
                                                                className="rounded-full object-cover flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-zinc-700 dark:text-zinc-400 flex-shrink-0">
                                                                <UserGroupIcon className="h-6 w-6" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-gray-900 dark:text-zinc-100">{actor.name}</p>
                                                            <p className="truncate text-sm text-gray-500 dark:text-zinc-400">{actor.character}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </>
    );
}