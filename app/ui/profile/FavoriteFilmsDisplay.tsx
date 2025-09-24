'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Movie } from '@/lib/definitions';
import { TrophyIcon } from '@heroicons/react/24/solid';
import MovieInfoCard from '@/app/ui/blog/MovieInfoCard';

const rankStyles = [
    { name: 'Top 1', color: 'border-amber-400', shadow: 'shadow-amber-400/30', textColor: 'text-amber-400', glow: 'from-amber-400' },
    { name: 'Top 2', color: 'border-slate-300', shadow: 'shadow-slate-300/30', textColor: 'text-slate-300', glow: 'from-slate-300' },
    { name: 'Top 3', color: 'border-orange-500', shadow: 'shadow-orange-500/30', textColor: 'text-orange-500', glow: 'from-orange-500' }
];

function FilmCard({ movie, rank, onCardClick }: { movie: Movie; rank: number; onCardClick: () => void; }) {
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
            onClick={onCardClick}
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


export default function FavoriteFilmsDisplay({ favoriteFilms }: {
    favoriteFilms: { rank: number; movies: Movie & { tmdb_id: number } }[]
}) {
    const [selectedMovie, setSelectedMovie] = useState<(Movie & { tmdb_id: number }) | null>(null);

    const sortedFilms = favoriteFilms.sort((a, b) => a.rank - b.rank);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <section>
            <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-zinc-100">Favorite Films</h2>
            <div className="mt-4">
                {sortedFilms.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
                    >
                        {sortedFilms.map(film => (
                            <FilmCard
                                key={film.rank}
                                movie={film.movies}
                                rank={film.rank}
                                onCardClick={() => setSelectedMovie(film.movies)}
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

            {selectedMovie && (
                <MovieInfoCard
                    movieApiId={selectedMovie.tmdb_id}
                    initialMovieData={selectedMovie}
                    isOpen={true}
                    onClose={() => setSelectedMovie(null)}
                />
            )}

            <style jsx global>{`
                .text-shadow { text-shadow: 1px 1px 3px rgb(0 0 0 / 0.5); }
                .text-shadow-lg { text-shadow: 2px 2px 5px rgb(0 0 0 / 0.6); }
            `}</style>
        </section>
    );
}