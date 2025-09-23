'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/lib/definitions';
import { XMarkIcon, CalendarIcon, StarIcon, TrophyIcon, FilmIcon } from '@heroicons/react/24/solid';
import { getMovieDetails } from '@/lib/actions/blog-actions';
import LoadingSpinner from '@/app/ui/loading-spinner';

// --- Types and Data ---

type MovieDetailsFromApi = {
    overview: string;
    cast: { name: string; profile_path: string; character: string }[];
    genres: { id: number; name:string }[];
    director?: string;
    vote_average?: number;
};

const rankStyles = [
    { name: 'Top 1', color: 'border-amber-400', shadow: 'shadow-amber-400/30', textColor: 'text-amber-400', glow: 'from-amber-400' },
    { name: 'Top 2', color: 'border-slate-300', shadow: 'shadow-slate-300/30', textColor: 'text-slate-300', glow: 'from-slate-300' },
    { name: 'Top 3', color: 'border-orange-500', shadow: 'shadow-orange-500/30', textColor: 'text-orange-500', glow: 'from-orange-500' }
];


// --- Sub-components ---

function FilmCard({ movie, rank, onClick }: { movie: Movie; rank: number; onClick: () => void; }) {
    const { name, color, shadow, textColor, glow } = rankStyles[rank - 1];
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="group relative cursor-pointer"
            onClick={onClick}
        >
            <div className={`absolute -inset-1 rounded-xl bg-gradient-to-br ${glow} via-transparent to-transparent opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-50`}></div>
            <div className="relative overflow-hidden rounded-lg">
                <div className={`absolute inset-0 rounded-lg border-2 ${color} transition-all duration-300 group-hover:border-4`}></div>
                <Image
                    src={movie.poster_url}
                    alt={movie.title}
                    width={500}
                    height={750}
                    className={`aspect-[2/3] w-full object-cover transition-all duration-300 ${shadow} brightness-90 group-hover:brightness-100`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute top-0 left-0 p-3">
                    <div className={`flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-sm font-bold backdrop-blur-sm ${textColor}`}>
                        <TrophyIcon className="h-4 w-4" />
                        <span>{name}</span>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 p-3 w-full">
                    <h3 className="font-bold text-white text-shadow-lg">{movie.title}</h3>
                    <p className="text-xs text-white/70 text-shadow">{new Date(movie.release_date).getFullYear()}</p>
                </div>
            </div>
        </motion.div>
    );
}

function MovieDetailModal({ movie, details, isLoading, onClose }: {
    movie: Movie;
    details: MovieDetailsFromApi | null;
    isLoading: boolean;
    onClose: () => void;
}) {
    const displayDetails = { ...movie, ...details };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-20 p-2 bg-slate-800/50 hover:bg-slate-800/80 rounded-full text-white transition-colors"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                {isLoading && !details ? (
                    <div className="flex items-center justify-center w-full h-96"> <LoadingSpinner /> </div>
                ) : (
                    <>
                        <div className="w-full md:w-1/3 flex-shrink-0">
                            <Image
                                src={displayDetails.poster_url}
                                alt={displayDetails.title}
                                width={500}
                                height={750}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-6 md:p-8 flex-grow overflow-y-auto">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {displayDetails.title}
                            </h2>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" />{new Date(displayDetails.release_date).getFullYear()}</span>
                                {displayDetails.director && (<span className="flex items-center gap-1.5"><FilmIcon className="w-4 h-4" />Directed by {displayDetails.director}</span>)}
                                {displayDetails.vote_average && (<span className="flex items-center gap-1.5 font-semibold text-yellow-500"><StarIcon className="w-4 h-4" />{displayDetails.vote_average.toFixed(1)}</span>)}
                            </div>

                            {displayDetails.genres && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {displayDetails.genres.slice(0, 4).map(genre => (
                                        <span key={genre.id} className="px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">{genre.name}</span>
                                    ))}
                                </div>
                            )}

                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Synopsis</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{displayDetails.overview || 'No synopsis available.'}</p>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

// --- Main Component ---

export default function FavoriteFilmsDisplay({ favoriteFilms }: {
    favoriteFilms: { rank: number; movies: Movie }[]
}) {
    const sortedFilms = favoriteFilms.sort((a, b) => a.rank - b.rank);

    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [apiDetails, setApiDetails] = useState<MovieDetailsFromApi | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleCardClick = (movie: Movie) => {
        setSelectedMovie(movie);
        startTransition(async () => {
            try {
                const details = await getMovieDetails(movie.tmdb_id);
                setApiDetails(details);
            } catch (error) { console.error("Failed to fetch movie details:", error); }
        });
    };

    const handleCloseModal = () => {
        setSelectedMovie(null);
        setApiDetails(null);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <>
            <section>
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Favorite Films</h2>
                <div className="mt-4">
                    {sortedFilms.length > 0 ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5"
                        >
                            {sortedFilms.map(film => (
                                <FilmCard
                                    key={film.rank}
                                    movie={film.movies}
                                    rank={film.rank}
                                    onClick={() => handleCardClick(film.movies)}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300/80 bg-white/50 p-12 text-center dark:border-zinc-800/50 dark:bg-zinc-900/50">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">No Favorites Yet</h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">This user hasn&apos;t selected their favorite films.</p>
                        </div>
                    )}
                </div>
            </section>

            <AnimatePresence>
                {selectedMovie && (
                    <MovieDetailModal
                        movie={selectedMovie}
                        details={apiDetails}
                        isLoading={isPending}
                        onClose={handleCloseModal}
                    />
                )}
            </AnimatePresence>

            <style jsx global>{`
                .text-shadow { text-shadow: 1px 1px 3px rgb(0 0 0 / 0.5); }
                .text-shadow-lg { text-shadow: 2px 2px 5px rgb(0 0 0 / 0.6); }
            `}</style>
        </>
    );
}