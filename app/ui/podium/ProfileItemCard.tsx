'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import MediaInfoCard from '@/app/ui/blog/MediaInfoCard';

export type UnifiedProfileItem = {
    id: string | number;
    tmdbId?: number;
    title: string;
    image_url: string | null;
    subtitle: string;
    type: 'movie' | 'tv' | 'person';
};

export default function ProfileItemCard({ item, rank }: { item: UnifiedProfileItem, rank: number }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isPerson = item.type === 'person';
    const isMovie = item.type === 'movie';

    // 1. Determine ID: Try tmdbId first, fallback to item.id (even if it might be a UUID/String)
    // We cast to Number() because the API requires a number.
    // If it's a UUID string, this becomes NaN, which causes the API 404.
    const activeTmdbId = item.tmdbId ? Number(item.tmdbId) : Number(item.id);

    const typeLabel = isMovie ? 'Film' : isPerson ? 'Star' : 'TV';
    const metaText = `${item.subtitle} • ${typeLabel}`;

    const initialData = {
        tmdb_id: activeTmdbId || 0,
        title: item.title,
        release_date: item.subtitle,
        poster_url: item.image_url,
        backdrop_url: item.image_url,
    };

    const CardContent = (
        <>
            <div className="relative aspect-[2/3] w-full rounded-sm overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm transition-all duration-500 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] dark:group-hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)]">
                <div className="absolute top-2 right-2 z-20">
                    <div className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm">
                        <span className="font-mono text-[10px] md:text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                            #{rank}
                        </span>
                    </div>
                </div>

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
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-white/5 transition-colors duration-300" />
                <div className="absolute inset-0 border border-black/5 dark:border-white/10 rounded-sm pointer-events-none" />
            </div>

            <div className="mt-3 space-y-1">
                <h3 className="text-sm md:text-[15px] font-bold leading-tight text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                    {item.title}
                </h3>
                <p className="text-[11px] md:text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
                    {metaText}
                </p>
            </div>
        </>
    );

    return (
        <>
            <motion.div
                className="group relative w-full md:max-w-[280px] mx-auto flex-shrink-0 z-0 hover:z-20"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4 }}
            >
                <div
                    onClick={() => {
                        // REMOVED THE GUARD. It will try to open no matter what.
                        // Debug log to see what ID is actually being passed
                        console.log("Opening Card. TMDB ID:", activeTmdbId, "Original Item:", item);
                        setIsModalOpen(true);
                    }}
                    className="block w-full cursor-pointer"
                >
                    {CardContent}
                </div>
            </motion.div>

            {/* Always render if modal is open. We pass '0' if ID is NaN to prevent crash, allowing API to 404 cleanly. */}
            <MediaInfoCard
                tmdbId={isNaN(activeTmdbId) ? 0 : activeTmdbId}
                mediaType={item.type}
                initialData={initialData}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}