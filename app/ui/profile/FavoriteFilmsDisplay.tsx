'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Movie, Series } from '@/lib/definitions';
import { ArrowLongRightIcon, FilmIcon, TvIcon } from '@heroicons/react/24/outline';
import CinematicInfoCard from '@/app/ui/blog/CinematicInfoCard';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

// --- Sub-component: The Exhibit Card ---
function ItemCard({ item, rank, onCardClick }: { item: Movie | Series; rank: number; onCardClick: () => void; }) {
    const isMovie = 'director' in item;
    const year = new Date(item.release_date).getFullYear();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.15, duration: 0.5 }}
            className="group cursor-pointer flex flex-col h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors duration-300"
            onClick={onCardClick}
        >
            {/* 1. Header: Rank & Type (Clearly Visible) */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">No.</span>
                    <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50 leading-none">
                        {rank.toString().padStart(2, '0')}
                    </span>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500">
                    {isMovie ? <FilmIcon className="w-3 h-3" /> : <TvIcon className="w-3 h-3" />}
                </div>
            </div>

            {/* 2. The Poster (Matted / Smaller) */}
            <div className="p-6 md:p-8 flex-1 flex items-center justify-center bg-zinc-100/50 dark:bg-zinc-900/20">
                <div className="relative aspect-[2/3] w-full max-w-[200px] shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                    <Image
                        src={item.poster_url}
                        alt={item.title}
                        fill
                        className="object-cover"
                    />
                    {/* Inner Border for definition */}
                    <div className="absolute inset-0 border border-black/5 dark:border-white/10 pointer-events-none" />
                </div>
            </div>

            {/* 3. Info Footer (Big Readable Title) */}
            <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 relative overflow-hidden">

                <div className="relative z-10 space-y-2">
                    {/* Meta Label */}
                    <div className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-widest">
                        {year} • {isMovie ? 'Feature Film' : 'Series'}
                    </div>

                    {/* Title - Big & Clear */}
                    <h3 className={`${PlayWriteNewZealandFont.className} text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors`}>
                        {item.title}
                    </h3>
                </div>

                {/* Hover Interaction Arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowLongRightIcon className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
                </div>
            </div>
        </motion.div>
    );
}

// --- Main Component ---
export default function FavoriteFilmsDisplay({ favoriteItems }: {
    favoriteItems: { rank: number; movies: Movie | null; series: Series | null }[]
}) {
    const [selectedItem, setSelectedItem] = useState<(Movie | Series) & { media_type: 'movie' | 'tv' } | null>(null);

    const sortedItems = favoriteItems.sort((a, b) => a.rank - b.rank);

    return (
        <section className="w-full py-12">

            {/* Section Header */}
            <div className="flex items-center justify-between mb-12 px-2">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100">
                        The Podium
                    </h2>
                    <p className="mt-2 text-sm text-zinc-500 font-mono">
                        ALL-TIME FAVORITES SELECTION
                    </p>
                </div>
            </div>

            {/* Grid Content */}
            <div className="mt-6">
                {sortedItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {sortedItems.map(item => {
                            const cinematicItem = item.movies || item.series;
                            if (!cinematicItem) return null;

                            const mediaType = item.movies ? 'movie' : 'tv';

                            return (
                                <ItemCard
                                    key={item.rank}
                                    item={cinematicItem}
                                    rank={item.rank}
                                    onCardClick={() => setSelectedItem({ ...cinematicItem, media_type: mediaType })}
                                />
                            )
                        })}
                    </div>
                ) : (
                    // Empty State
                    <div className="w-full h-64 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-400">
                        <span className="text-sm font-mono uppercase">Slot Empty</span>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedItem && (
                <CinematicInfoCard
                    tmdbId={selectedItem.tmdb_id}
                    initialData={selectedItem}
                    mediaType={selectedItem.media_type}
                    isOpen={true}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </section>
    );
}