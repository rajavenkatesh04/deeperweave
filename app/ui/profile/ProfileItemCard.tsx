'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export type UnifiedProfileItem = {
    id: string | number;
    title: string;
    image_url: string | null;
    subtitle: string;
    type: 'movie' | 'tv' | 'person';
};

export default function ProfileItemCard({ item, rank }: { item: UnifiedProfileItem, rank: number }) {
    const isPerson = item.type === 'person';
    const isMovie = item.type === 'movie';

    const href = isPerson
        ? `/discover/actor/${item.id}`
        : `/discover/${item.type}/${item.id}`;

    // --- Badge Logic from PosterCard ---
    let badgeLabel = 'TV';
    let badgeColorClass = 'bg-zinc-900/90 dark:bg-white/90 text-white dark:text-black';

    if (isMovie) {
        badgeLabel = 'FILM';
    } else if (isPerson) {
        badgeLabel = 'STAR';
        badgeColorClass = 'bg-amber-500/90 text-black border-amber-400/20';
    }

    return (
        <motion.div
            className="group relative w-full flex-shrink-0 z-0 hover:z-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <Link href={href} className="block w-full h-full">

                {/* --- POSTER CONTAINER --- */}
                <div className="relative aspect-[2/3] w-full rounded-sm overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-zinc-400 dark:group-hover:border-zinc-100">

                    {/* --- RANK TAG (Integrated numbering) --- */}
                    <div className="absolute top-0 right-0 p-2 z-20">
                        <div className="bg-white text-black font-mono text-[10px] font-bold px-2 py-0.5 shadow-md transform transition-transform group-hover:scale-110">
                            #{rank}
                        </div>
                    </div>

                    {/* Image */}
                    {item.image_url ? (
                        <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:saturate-100 grayscale-[0.1] group-hover:grayscale-0"
                            sizes="(max-width: 768px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-100 dark:bg-zinc-900">
                            <span className="text-[10px] uppercase font-bold tracking-widest">No Image</span>
                        </div>
                    )}

                    {/* --- TYPE BADGE --- */}
                    <div className="absolute top-0 left-0 p-2 z-10">
                        <div className={`px-1.5 py-0.5 backdrop-blur-sm text-[9px] font-black uppercase tracking-wider shadow-sm border border-white/10 dark:border-black/10 ${badgeColorClass}`}>
                            {badgeLabel}
                        </div>
                    </div>

                    {/* Inner Border */}
                    <div className="absolute inset-0 border border-black/5 dark:border-white/5 pointer-events-none rounded-sm group-hover:opacity-0 transition-opacity" />

                    {/* Hover Shine Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-tr from-transparent via-white to-transparent pointer-events-none transition-opacity duration-500" />
                </div>

                {/* --- INFO SECTION --- */}
                <div className="mt-4 px-1 space-y-1 transition-opacity duration-300 opacity-80 group-hover:opacity-100">
                    <h3 className="text-base font-bold leading-tight text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:underline decoration-1 underline-offset-4 tracking-tighter">
                        {item.title}
                    </h3>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                            {item.subtitle}
                        </span>

                        <span className="h-px w-3 bg-zinc-300 dark:bg-zinc-700" />

                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                            {item.type}
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}