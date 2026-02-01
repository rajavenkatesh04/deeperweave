'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import MediaInfoCard from '@/app/ui/blog/MediaInfoCard'; // Ensure this path is correct based on your project

export type UnifiedProfileItem = {
    id: string | number;
    title: string;
    image_url: string | null;
    subtitle: string;
    type: 'movie' | 'tv' | 'person';
};

export default function ProfileItemCard({ item, rank }: { item: UnifiedProfileItem, rank: number }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isPerson = item.type === 'person';
    const isMovie = item.type === 'movie';

    // Format the type label for the bottom text
    // e.g. "Acting • Star" or "1998 • Film"
    const typeLabel = isMovie ? 'Film' : isPerson ? 'Star' : 'TV';
    const metaText = `${item.subtitle} • ${typeLabel}`;

    // Construct minimal data for the teaser card (Unified for all types)
    const initialData = {
        tmdb_id: Number(item.id),
        title: item.title,
        // For media, subtitle is usually the year. For people, it might be the department.
        // We pass it as release_date/fallback so the card has something to show immediately.
        release_date: item.subtitle,
        poster_url: item.image_url,
        backdrop_url: item.image_url, // Fallback to poster if backdrop isn't available in this view
    };

    // --- SHARED CARD CONTENT (Visuals) ---
    const CardContent = (
        <>
            {/* --- POSTER CONTAINER --- */}
            <div className="relative aspect-[2/3] w-full rounded-sm overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm transition-all duration-500 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] dark:group-hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)]">

                {/* --- PREMIUM RANK BADGE --- */}
                {/* Glassmorphism effect: blur, semi-transparent bg, and subtle border */}
                <div className="absolute top-2 right-2 z-20">
                    <div className="
                        flex items-center justify-center
                        w-6 h-6 md:w-7 md:h-7
                        rounded-full
                        bg-white/90 dark:bg-black/60
                        backdrop-blur-md
                        border border-white/20 dark:border-white/10
                        shadow-sm
                    ">
                        <span className="font-mono text-[10px] md:text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                            #{rank}
                        </span>
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

                {/* Hover Overlay (Subtle darken/lighten) */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-white/5 transition-colors duration-300" />

                {/* Inner Border (adds definition) */}
                <div className="absolute inset-0 border border-black/5 dark:border-white/10 rounded-sm pointer-events-none" />
            </div>

            {/* --- INFO SECTION (Clean & Minimal) --- */}
            <div className="mt-3 space-y-1">
                {/* Title */}
                <h3 className="text-sm md:text-[15px] font-bold leading-tight text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                    {item.title}
                </h3>

                {/* Metadata: "Year • Type" or "Dept • Star" */}
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
                {/* Unified Interaction: All types open the modal */}
                <div
                    onClick={() => setIsModalOpen(true)}
                    className="block w-full cursor-pointer"
                >
                    {CardContent}
                </div>
            </motion.div>

            {/* --- MEDIA MODAL (For Movie, TV, AND Person) --- */}
            {initialData && (
                <MediaInfoCard
                    tmdbId={Number(item.id)}
                    mediaType={item.type}
                    initialData={initialData}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
}