'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CinematicSearchResult } from '@/lib/actions/cinematic-actions';

export default function PosterCard({ item }: { item: CinematicSearchResult }) {
    const year = item.release_date ? item.release_date.split('-')[0] : 'N/A';
    const isMovie = item.media_type === 'movie';

    return (
        <motion.div
            className="group relative w-[160px] md:w-[200px] flex-shrink-0 z-0 hover:z-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <Link href={`/discover/${item.media_type}/${item.id}`} className="block w-full h-full">

                {/* --- POSTER CONTAINER --- */}
                <div className="relative aspect-[2/3] w-full rounded-sm overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-zinc-400 dark:group-hover:border-zinc-100">

                    {/* Image */}
                    {item.poster_path ? (
                        <Image
                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:saturate-100 grayscale-[0.1] group-hover:grayscale-0"
                            sizes="(max-width: 768px) 160px, 200px"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-100 dark:bg-zinc-900">
                            <span className="text-[10px] uppercase font-bold tracking-widest">No Image</span>
                        </div>
                    )}

                    {/* --- TYPE BADGE (Technical / High Contrast) --- */}
                    <div className="absolute top-0 left-0 p-2 z-10">
                        <div className="px-1.5 py-0.5 bg-zinc-900/90 dark:bg-white/90 backdrop-blur-sm text-white dark:text-black text-[9px] font-black uppercase tracking-wider shadow-sm border border-white/10 dark:border-black/10">
                            {isMovie ? 'FILM' : 'TV'}
                        </div>
                    </div>

                    {/* Inner Border (Subtle depth, fades out on hover to look cleaner) */}
                    <div className="absolute inset-0 border border-black/5 dark:border-white/5 pointer-events-none rounded-sm group-hover:opacity-0 transition-opacity" />

                    {/* Hover Shine Effect (Subtle) */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-tr from-transparent via-white to-transparent pointer-events-none transition-opacity duration-500" />
                </div>

                {/* --- INFO SECTION --- */}
                <div className="mt-4 px-1 space-y-1 transition-opacity duration-300 opacity-80 group-hover:opacity-100">
                    <h3 className="text-base font-bold leading-tight text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:underline decoration-1 underline-offset-4">
                        {item.title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                            {year}
                        </span>
                        <span className="h-px w-3 bg-zinc-300 dark:bg-zinc-700" />
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">
                            TMDB-{item.id}
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}