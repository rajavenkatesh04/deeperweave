'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import { FilmIcon, TvIcon } from '@heroicons/react/24/solid';

export default function PosterCard({ item }: { item: CinematicSearchResult }) {
    const year = item.release_date ? item.release_date.split('-')[0] : 'N/A';
    const isMovie = item.media_type === 'movie';

    return (
        <motion.div
            className="group relative w-40 md:w-44 lg:w-48 flex-shrink-0 snap-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <Link href={`/discover/${item.media_type}/${item.id}`} className="block w-full h-full">

                {/* --- POSTER CONTAINER --- */}
                <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:shadow-rose-900/10 group-hover:border-rose-500/50">

                    {/* Image */}
                    {item.poster_path ? (
                        <Image
                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                            sizes="(max-width: 768px) 160px, 192px"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600">
                            <FilmIcon className="w-10 h-10 mb-2 opacity-50" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">No Poster</span>
                        </div>
                    )}

                    {/* --- TYPE BADGE (Matching Log Entry Form) --- */}
                    <div className="absolute top-2 right-2">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border ${
                            isMovie
                                ? 'bg-blue-50/90 text-blue-700 border-blue-200 dark:bg-blue-900/80 dark:text-blue-100 dark:border-blue-800'
                                : 'bg-green-50/90 text-green-700 border-green-200 dark:bg-green-900/80 dark:text-green-100 dark:border-green-800'
                        }`}>
                            {isMovie ? <FilmIcon className="w-3 h-3" /> : <TvIcon className="w-3 h-3" />}
                            <span>{isMovie ? 'Movie' : 'TV'}</span>
                        </div>
                    </div>

                    {/* Dark gradient overlay for bottom text contrast (optional, mostly for style) */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* --- INFO SECTION --- */}
                <div className="mt-3 px-0.5">
                    <h3 className="text-base font-bold leading-tight text-gray-900 dark:text-white line-clamp-1 group-hover:text-rose-600 dark:group-hover:text-rose-500 transition-colors">
                        {item.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                            {year}
                        </p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}