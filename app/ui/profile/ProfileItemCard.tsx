'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FilmIcon, TvIcon, UserIcon } from '@heroicons/react/24/outline';
import { UnifiedProfileItem } from './ProfileSectionDisplay';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts"; // Import your custom font for the number

interface ProfileItemCardProps {
    item: UnifiedProfileItem;
    rank: number;
}

export default function ProfileItemCard({ item, rank }: ProfileItemCardProps) {
    const isPerson = item.type === 'person';
    const isMovie = item.type === 'movie';

    const href = isPerson
        ? `/discover/actor/${item.id}`
        : `/discover/${item.type}/${item.id}`;

    // Minimal badge logic just for the bottom tag
    let badgeLabel = 'TV';
    if (isMovie) badgeLabel = 'FILM';
    else if (isPerson) badgeLabel = 'STAR';

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="group relative w-full h-full flex-shrink-0"
        >
            <Link href={href} className="block w-full h-full">

                {/* --- CARD IMAGE CONTAINER --- */}
                <div className="relative w-full aspect-[2/3] overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-500 group-hover:shadow-2xl group-hover:border-zinc-600">

                    {/* 1. Image */}
                    {item.image_url ? (
                        <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:saturate-100 grayscale-[0.2] group-hover:grayscale-0"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                            {item.type === 'person' ? <UserIcon className="w-12 h-12" /> : <FilmIcon className="w-12 h-12" />}
                        </div>
                    )}

                    {/* 2. Vignette Gradient (Always visible, stronger on bottom) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                    {/* 3. RANK NUMBER (The new minimal design) */}
                    {/* Large, stylized number in top-left */}
                    <div className="absolute top-0 left-0 p-3 z-10">
                        <span className={`${PlayWriteNewZealandFont.className} text-4xl leading-none text-white/90 drop-shadow-md`}>
                            {rank}
                            <span className="text-sm align-top text-amber-500 opacity-80">.</span>
                        </span>
                    </div>

                    {/* 4. Type Badge (Bottom Right - appears on hover) */}
                    <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <span className="text-[9px] font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md text-white px-2 py-1 rounded border border-white/10">
                            {badgeLabel}
                        </span>
                    </div>

                    {/* 5. Inner Border for definition */}
                    <div className="absolute inset-0 border border-white/5 pointer-events-none" />
                </div>

                {/* --- INFO SECTION --- */}
                <div className="mt-3 space-y-0.5 px-1">
                    <h3 className="text-sm md:text-base font-bold leading-tight text-white group-hover:text-amber-500 transition-colors line-clamp-1">
                        {item.title}
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                        {item.subtitle}
                    </p>
                </div>
            </Link>
        </motion.div>
    );
}