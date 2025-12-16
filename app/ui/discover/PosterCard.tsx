'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import { FilmIcon, TvIcon, StarIcon } from '@heroicons/react/24/solid';

export default function PosterCard({ item }: { item: CinematicSearchResult }) {
    const year = item.release_date ? item.release_date.split('-')[0] : 'N/A';
    const isMovie = item.media_type === 'movie';

    return (
        <motion.div
            className="group relative w-40 md:w-48 lg:w-52 flex-shrink-0 snap-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Link href={`/discover/${item.media_type}/${item.id}`} className="block w-full">

                {/* --- 1. THE AMBIENT GLOW (Graceful Backdrop) --- */}
                {/* This creates a soft, colored light behind the card on hover */}
                <div className="absolute -inset-2 bg-rose-600/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out will-change-[opacity]" />

                {/* --- 2. THE ARTWORK CONTAINER --- */}
                <div className="relative aspect-[2/3] w-full rounded-[18px] overflow-hidden bg-zinc-900 shadow-sm ring-1 ring-white/5 transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-black/50">

                    {/* Poster */}
                    {item.poster_path ? (
                        <Image
                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105"
                            sizes="(max-width: 768px) 160px, 208px"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800/50 text-zinc-600">
                            <FilmIcon className="w-10 h-10 mb-2 opacity-30" />
                        </div>
                    )}

                    {/* Glass Badge (Minimalist) */}
                    <div className="absolute top-2 right-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/90 shadow-sm">
                            {isMovie ? <FilmIcon className="w-3.5 h-3.5" /> : <TvIcon className="w-3.5 h-3.5" />}
                        </div>
                    </div>

                    {/* Subtle Overlay to make poster pop */}
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[18px]" />
                </div>

                {/* --- 3. THE INFO (Clean Typography) --- */}
                <div className="mt-4 px-1 space-y-1">
                    {/* Title */}
                    <h3 className="text-zinc-100 font-medium text-[15px] leading-tight line-clamp-1 group-hover:text-rose-500 transition-colors duration-300">
                        {item.title}
                    </h3>

                    {/* Meta Data Row */}
                    <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                        <span>{year}</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}