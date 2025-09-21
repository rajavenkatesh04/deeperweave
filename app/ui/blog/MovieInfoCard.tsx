// @/app/ui/blog/MovieInfoCard.tsx

'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { getMovieDetails } from '@/lib/actions/blog-actions';
import { UserGroupIcon, XMarkIcon, FilmIcon, CalendarIcon, UserIcon, PlayCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { Movie } from '@/lib/definitions';
import { motion, AnimatePresence, Variants } from 'framer-motion';

type MovieDetailsFromApi = {
    overview: string;
    cast: { name: string; profile_path: string; character: string }[];
    genres: { id: number; name: string }[];
    director?: string;
    runtime?: number;
    vote_average?: number;
};

// Animation variants
const cardVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.95
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    },
    hover: {
        y: -8,
        scale: 1.02,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

const modalVariants: Variants = {
    initial: {
        opacity: 0,
        scale: 0.8
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "backOut"
        }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        transition: {
            duration: 0.3,
            ease: "easeIn"
        }
    }
};

const backdropVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.3 }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.3 }
    }
};

const genreVariants: Variants = {
    initial: { opacity: 0, scale: 0 },
    animate: (i: number) => ({
        opacity: 1,
        scale: 1,
        transition: {
            delay: i * 0.1,
            duration: 0.4,
            ease: "backOut"
        }
    })
};

const castVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut"
        }
    })
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
            {/* Enhanced Compact Movie Card */}
            <motion.div
                className="my-8 relative overflow-hidden"
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
            >
                {/* Gradient background with glass effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl" />
                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-zinc-800/50" />

                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    <motion.div
                        className="absolute top-4 right-4 w-2 h-2 bg-blue-400/30 rounded-full"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute bottom-8 left-8 w-3 h-3 bg-purple-400/20 rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                    />
                </div>

                <motion.button
                    onClick={handleOpenModal}
                    className="relative w-full text-left p-6 flex items-start gap-6 group"
                    aria-label="View movie details"
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                >
                    {/* Enhanced Poster with floating effect */}
                    {initialMovieData.poster_url && (
                        <motion.div
                            className="flex-shrink-0 relative"
                            whileHover={{ scale: 1.05, rotateY: 5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="w-24 h-36 md:w-28 md:h-42 overflow-hidden rounded-xl shadow-xl relative">
                                <Image
                                    src={initialMovieData.poster_url}
                                    alt={`Poster for ${initialMovieData.title}`}
                                    width={112}
                                    height={168}
                                    className="w-full h-full object-cover"
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            {/* Floating play icon */}
                            <motion.div
                                className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2 shadow-lg"
                                whileHover={{ scale: 1.1 }}
                                animate={{
                                    boxShadow: [
                                        "0 4px 20px rgba(59, 130, 246, 0.3)",
                                        "0 4px 30px rgba(147, 51, 234, 0.4)",
                                        "0 4px 20px rgba(59, 130, 246, 0.3)"
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <PlayCircleIcon className="h-5 w-5 text-white" />
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Enhanced Details Section */}
                    <div className="flex-grow min-w-0 space-y-4">
                        {/* Badge with animation */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-full shadow-lg">
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    <FilmIcon className="h-4 w-4" />
                                </motion.div>
                                Featured Movie
                            </span>
                        </motion.div>

                        {/* Title with gradient */}
                        <motion.h3
                            className="font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent text-xl md:text-2xl mb-2 leading-tight"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {initialMovieData.title || 'N/A'}
                        </motion.h3>

                        {/* Release date with enhanced styling */}
                        <motion.div
                            className="flex items-center gap-3 text-gray-600 dark:text-gray-400"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                                <CalendarIcon className="h-4 w-4" />
                            </div>
                            <span className="font-medium">Released: {initialMovieData.release_date || 'N/A'}</span>
                        </motion.div>

                        {/* Call to action with hover effect */}
                        <motion.div
                            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <span>Explore Details</span>
                            <motion.svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </motion.svg>
                        </motion.div>
                    </div>
                </motion.button>
            </motion.div>

            {/* Enhanced Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        variants={backdropVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {/* Backdrop with blur */}
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setIsModalOpen(false)}
                        />

                        {/* Animated background effects */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <motion.div
                                className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 180, 360]
                                }}
                                transition={{
                                    duration: 10,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                            <motion.div
                                className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full"
                                animate={{
                                    scale: [1.2, 1, 1.2],
                                    rotate: [360, 180, 0]
                                }}
                                transition={{
                                    duration: 12,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                        </div>

                        <motion.div
                            className="relative flex flex-col w-full max-w-5xl max-h-[90vh] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-zinc-800/50"
                            variants={modalVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Enhanced close button */}
                            <motion.button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute right-6 top-6 z-20 rounded-full bg-white/90 dark:bg-zinc-800/90 p-3 text-gray-500 dark:text-gray-400 shadow-lg backdrop-blur-sm border border-gray-200/50 dark:border-zinc-700/50"
                                aria-label="Close"
                                whileHover={{
                                    scale: 1.1,
                                    backgroundColor: "rgb(239 68 68 / 0.1)",
                                    borderColor: "rgb(239 68 68 / 0.3)"
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </motion.button>

                            <div className="flex-grow overflow-y-auto">
                                {/* Enhanced Header */}
                                <div className="p-8 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30 border-b border-gray-200/50 dark:border-zinc-800/50">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Enhanced Large poster */}
                                        {displayDetails.poster_url && (
                                            <motion.div
                                                className="flex-shrink-0 mx-auto md:mx-0"
                                                initial={{ opacity: 0, x: -50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <div className="w-48 h-72 md:w-56 md:h-84 overflow-hidden rounded-2xl shadow-2xl relative group">
                                                    <Image
                                                        src={displayDetails.poster_url.replace('w500', 'w780')}
                                                        alt={`Poster for ${displayDetails.title}`}
                                                        width={224}
                                                        height={336}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Enhanced Title and basic info */}
                                        <div className="flex-grow text-center md:text-left space-y-6">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-full shadow-lg mb-4">
                                                    <FilmIcon className="h-4 w-4" />
                                                    Featured Movie
                                                </span>
                                            </motion.div>

                                            <motion.h2
                                                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                {displayDetails.title || 'N/A'}
                                            </motion.h2>

                                            <motion.div
                                                className="flex items-center justify-center md:justify-start gap-3 text-gray-600 dark:text-gray-400 text-lg"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                    <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <span className="font-medium">Released: {displayDetails.release_date || 'N/A'}</span>
                                            </motion.div>

                                            {/* Rating display */}
                                            {displayDetails.vote_average && (
                                                <motion.div
                                                    className="flex items-center justify-center md:justify-start gap-2"
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.6 }}
                                                >
                                                    <StarIcon className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {displayDetails.vote_average.toFixed(1)}/10
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-400">TMDB</span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Main content */}
                                <div className="p-8">
                                    {isPending ? (
                                        <div className="flex justify-center items-center h-40">
                                            <LoadingSpinner />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            {/* Enhanced Left column */}
                                            <div className="lg:col-span-1 space-y-6">
                                                {displayDetails.director && (
                                                    <motion.div
                                                        className="bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-zinc-800 dark:to-blue-950/30 p-6 rounded-2xl border border-gray-200/50 dark:border-zinc-700/50"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.7 }}
                                                    >
                                                        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 mb-3">
                                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                                <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <span className="font-semibold">Director</span>
                                                        </div>
                                                        <p className="text-gray-900 dark:text-white text-lg font-medium">{displayDetails.director}</p>
                                                    </motion.div>
                                                )}

                                                {displayDetails.genres && displayDetails.genres.length > 0 && (
                                                    <motion.div
                                                        className="bg-gradient-to-br from-gray-50 to-purple-50/50 dark:from-zinc-800 dark:to-purple-950/30 p-6 rounded-2xl border border-gray-200/50 dark:border-zinc-700/50"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.8 }}
                                                    >
                                                        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Genres</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {displayDetails.genres.map((genre, i) => (
                                                                <motion.span
                                                                    key={genre.id}
                                                                    className="text-sm px-4 py-2 bg-white/80 text-gray-800 dark:bg-zinc-700/80 dark:text-gray-200 rounded-full shadow-sm border border-gray-200/50 dark:border-zinc-600/50 font-medium"
                                                                    variants={genreVariants}
                                                                    initial="initial"
                                                                    animate="animate"
                                                                    custom={i}
                                                                    whileHover={{ scale: 1.05, y: -2 }}
                                                                >
                                                                    {genre.name}
                                                                </motion.span>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Enhanced Right column */}
                                            <div className="lg:col-span-2 space-y-8">
                                                {displayDetails.overview && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.9 }}
                                                    >
                                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                            Synopsis
                                                        </h3>
                                                        <div className="bg-gradient-to-br from-gray-50/50 to-blue-50/30 dark:from-zinc-800/50 dark:to-blue-950/20 p-6 rounded-2xl border border-gray-200/50 dark:border-zinc-700/50">
                                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                                                                {displayDetails.overview}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {displayDetails.cast && displayDetails.cast.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 1 }}
                                                    >
                                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Cast</h3>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                                            {displayDetails.cast.slice(0, 8).map((actor, i) => (
                                                                <motion.div
                                                                    key={actor.name}
                                                                    className="text-center group"
                                                                    variants={castVariants}
                                                                    initial="initial"
                                                                    animate="animate"
                                                                    custom={i}
                                                                    whileHover={{ y: -5 }}
                                                                >
                                                                    {actor.profile_path ? (
                                                                        <div className="mb-4 mx-auto w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-lg border-4 border-white dark:border-zinc-800 group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors duration-300">
                                                                            <Image
                                                                                src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                                                                alt={actor.name}
                                                                                width={96}
                                                                                height={96}
                                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="mb-4 mx-auto w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500 dark:from-zinc-700 dark:to-zinc-600 dark:text-gray-400 shadow-lg border-4 border-white dark:border-zinc-800 group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors duration-300">
                                                                            <UserGroupIcon className="h-8 w-8 md:h-10 md:w-10" />
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                            {actor.name}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                                                                            {actor.character}
                                                                        </p>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}