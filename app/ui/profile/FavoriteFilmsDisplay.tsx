'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
// ✨ 1. IMPORT Series and TvIcon/FilmIcon
import { Movie, Series } from '@/lib/definitions';
import { TrophyIcon, TvIcon, FilmIcon } from '@heroicons/react/24/solid';
// ✨ 2. IMPORT the correct component
import CinematicInfoCard from '@/app/ui/blog/CinematicInfoCard';

const rankStyles = [
    { name: 'Top 1', color: 'border-amber-400', shadow: 'shadow-amber-400/30', textColor: 'text-amber-400', glow: 'from-amber-400' },
    { name: 'Top 2', color: 'border-slate-300', shadow: 'shadow-slate-300/30', textColor: 'text-slate-300', glow: 'from-slate-300' },
    { name: 'Top 3', color: 'border-orange-500', shadow: 'shadow-orange-500/30', textColor: 'text-orange-500', glow: 'from-orange-500' }
];

// ✨ 3. Renamed component to ItemCard and updated props
function ItemCard({ item, rank, onCardClick }: { item: Movie | Series; rank: number; onCardClick: () => void; }) {
    const { name, color, shadow, textColor, glow } = rankStyles[rank - 1];
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };
    // Check if it's a movie (vs. a series) by checking for a unique movie prop
    const isMovie = 'director' in item;

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
                    src={item.poster_url}
                    alt={item.title}
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
                {/* ✨ 4. Added media type icon to card */}
                <div className="absolute top-0 right-0 p-3">
                    <div className={`flex items-center gap-2 rounded-full bg-black/50 p-1.5 text-sm font-bold backdrop-blur-sm ${textColor}`}>
                        {isMovie ? <FilmIcon className="h-4 w-4" /> : <TvIcon className="h-4 w-4" />}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 p-3 w-full">
                    <h3 className="font-bold text-white text-shadow-lg">{item.title}</h3>
                    <p className="text-xs text-white/70 text-shadow">{new Date(item.release_date).getFullYear()}</p>
                </div>
            </div>
        </motion.div>
    );
}

// ✨ 5. UPDATED props to 'favoriteItems'
export default function FavoriteFilmsDisplay({ favoriteItems }: {
    favoriteItems: { rank: number; movies: Movie | null; series: Series | null }[]
}) {
    // ✨ 6. UPDATED state to handle both types
    const [selectedItem, setSelectedItem] = useState<(Movie | Series) & { media_type: 'movie' | 'tv' } | null>(null);

    const sortedItems = favoriteItems.sort((a, b) => a.rank - b.rank);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <section>
            {/* ✨ 7. UPDATED title */}
            <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-zinc-100">Favorite Films & Series</h2>
            <div className="mt-4">
                {sortedItems.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
                    >
                        {sortedItems.map(item => {
                            // Find the correct item (movie or series)
                            const cinematicItem = item.movies || item.series;
                            if (!cinematicItem) return null; // Safety check

                            const mediaType = item.movies ? 'movie' : 'tv';

                            return (
                                <ItemCard // ✨ Renamed component
                                    key={item.rank}
                                    item={cinematicItem}
                                    rank={item.rank}
                                    onCardClick={() => setSelectedItem({ ...cinematicItem, media_type: mediaType })}
                                />
                            )
                        })}
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300/80 bg-white/50 p-12 text-center dark:border-zinc-800/50 dark:bg-zinc-900/50">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">No Favorites Yet</h3>
                        {/* ✨ UPDATED text */}
                        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">This user hasn&apos;t selected their favorite items.</p>
                    </div>
                )}
            </div>

            {/* ✨ 9. UPDATED component call to fix the build error */}
            {selectedItem && (
                <CinematicInfoCard
                    tmdbId={selectedItem.tmdb_id}
                    initialData={selectedItem}
                    mediaType={selectedItem.media_type}
                    isOpen={true}
                    onClose={() => setSelectedItem(null)}
                />
            )}

            <style jsx global>{`
                .text-shadow { text-shadow: 1px 1px 3px rgb(0 0 0 / 0.5); }
                .text-shadow-lg { text-shadow: 2px 2px 5px rgb(0 0 0 / 0.6); }
            `}</style>
        </section>
    );
}