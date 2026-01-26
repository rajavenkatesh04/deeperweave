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
            /* 1. mx-auto: Centers the card in the grid cell
               2. max-w-full: Default for mobile
               3. md:max-w-[280px]: Constraints width on desktop so posters aren't huge
            */
            className="group relative w-full md:max-w-[280px] mx-auto flex-shrink-0 z-0 hover:z-20"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
        >
            <Link href={href} className="block w-full">

                {/* --- POSTER CONTAINER --- */}
                <div className="relative aspect-[2/3] w-full rounded-sm overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all duration-500 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] dark:group-hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)]">

                    {/* --- RANK TAG (Integrated numbering) --- */}
                    <div className="absolute top-0 right-0 z-20">
                        <div className="bg-white dark:bg-zinc-800 text-black dark:text-white font-mono text-[10px] md:text-[11px] font-bold px-2.5 py-1 shadow-sm border-b border-l border-zinc-100 dark:border-zinc-700">
                            #{rank}
                        </div>
                    </div>

                    {/* Image */}
                    {item.image_url ? (
                        <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900">
                            <span className="text-[9px] uppercase font-bold tracking-widest opacity-50">No Image</span>
                        </div>
                    )}

                    {/* --- TYPE BADGE --- */}
                    <div className="absolute top-2 left-2 z-10">
                        <div className={`px-1.5 py-[2px] backdrop-blur-md text-[8px] md:text-[9px] font-black uppercase tracking-wider shadow-sm border border-white/10 ${badgeColorClass}`}>
                            {badgeLabel}
                        </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-white/5 transition-colors duration-300" />
                </div>

                {/* --- INFO SECTION --- */}
                <div className="mt-3 md:mt-4 space-y-1">
                    {/* Title: Smaller on mobile (text-sm), larger on desktop (md:text-lg) */}
                    <h3 className="text-sm md:text-lg font-bold leading-tight text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                        {item.title}
                    </h3>

                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                        {/* Subtitle: Smaller on mobile */}
                        <span className="text-[11px] md:text-xs font-mono truncate max-w-[70%]">
                            {item.subtitle}
                        </span>

                        <span className="h-px w-2 bg-zinc-300 dark:bg-zinc-700" />

                        <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest opacity-70">
                            {item.type}
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}