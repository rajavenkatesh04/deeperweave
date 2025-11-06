'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import { FilmIcon, TvIcon } from '@heroicons/react/24/solid';

export default function PosterCard({ item }: { item: CinematicSearchResult }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="w-40 md:w-48 flex-shrink-0"
        >
            <div className="relative">
                <Link href={`/discover/${item.media_type}/${item.id}`} className="block">
                    <div className="aspect-[2/3] w-full relative overflow-hidden rounded-lg shadow-lg">
                        <Image
                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 160px, 192px"
                        />
                    </div>
                </Link>
                {/* Media Type Badge */}
                <div className={`absolute top-2 left-2 flex items-center gap-1.5 flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${
                    item.media_type === 'movie'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                    {item.media_type === 'movie' ? <FilmIcon className="w-3 h-3" /> : <TvIcon className="w-3 h-3" />}
                </div>
            </div>
            <div className="mt-2">
                <Link href={`/discover/${item.media_type}/${item.id}`} className="block">
                    <h3 className="font-bold text-md line-clamp-1 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                        {item.title}
                    </h3>
                </Link>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                    {item.release_date?.split('-')[0]}
                </p>
            </div>
        </motion.div>
    );
}