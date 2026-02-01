'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    StarIcon
} from '@heroicons/react/24/solid';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

const AUTO_SCROLL_INTERVAL = 8000;

export default function TrendingHero({ items }: { items: CinematicSearchResult[] }) {
    const [index, setIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    if (!items || items.length === 0) return null;

    const currentItem = items[index];
    const totalItems = items.length;

    const paginate = useCallback((newDirection: number) => {
        setIndex((prev) => (prev + newDirection + totalItems) % totalItems);
    }, [totalItems]);

    const startAutoScroll = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            paginate(1);
        }, AUTO_SCROLL_INTERVAL);
    }, [paginate]);

    useEffect(() => {
        startAutoScroll();
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [startAutoScroll]);

    const handleManualNavigate = (dir: number) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        paginate(dir);
        startAutoScroll();
    };

    return (
        <section className="relative w-full h-[65vh] md:h-[85vh] overflow-hidden bg-zinc-950 border-b border-zinc-800 group">

            {/* --- 0. CLICK TARGET (GLOBAL LINK) --- */}
            <Link
                href={`/discover/${currentItem.media_type}/${currentItem.id}`}
                className="absolute inset-0 z-20 cursor-pointer"
                aria-label={`View details for ${currentItem.title}`}
            />

            {/* --- 1. BACKDROP & TEXTURE --- */}
            <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                    key={currentItem.id}
                    className="absolute inset-0 z-0"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Image
                        src={`https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`}
                        alt={currentItem.title}
                        fill
                        className="object-cover opacity-60"
                        priority
                    />

                    {/* Cinematic Letterbox Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/40" />

                    {/* Mobile Specific Bottom Fade */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950 to-transparent opacity-90 md:opacity-60" />

                    {/* Vignette */}
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-zinc-950/80" />
                </motion.div>
            </AnimatePresence>

            {/* Technical Grid Overlay */}
            <div className="absolute inset-0 z-10 opacity-[0.05] pointer-events-none"
                 style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />


            {/* --- 2. MAIN CONTENT (Bottom Left) --- */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end px-6 md:px-12 pb-8 md:pb-12 pointer-events-none">
                <div className="w-full max-w-[85%] md:max-w-4xl">

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentItem.id}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                            className="space-y-2 md:space-y-6"
                        >
                            {/* Meta Badge Row */}
                            <motion.div
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                className="flex items-center gap-3"
                            >
                                <div className="px-2 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest">
                                    {currentItem.media_type === 'movie' ? 'FILM' : 'TV'}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                                    <span>{currentItem.release_date?.split('-')[0]}</span>
                                    <span className="text-zinc-600">|</span>
                                    <div className="flex items-center gap-1 text-amber-400">
                                        <StarIcon className="w-3 h-3" />
                                        {/*<span>{currentItem.vote_average?.toFixed(1)}</span>*/}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Title */}
                            <motion.h1
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                className={`${PlayWriteNewZealandFont.className} text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-[0.9] drop-shadow-2xl`}
                            >
                                {currentItem.title}
                            </motion.h1>

                            {/* Overview - UPDATED CAPS */}
                            <motion.p
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                className="text-xs md:text-lg text-zinc-300 font-light leading-relaxed max-w-xl border-l-2 border-zinc-700 pl-4 line-clamp-1 md:line-clamp-3"
                            >
                                {currentItem.overview}
                            </motion.p>

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>


            {/* --- 3. CONTROLS & PAGINATION (Bottom Right) --- */}
            <div className="absolute bottom-0 right-0 z-30 p-6 md:p-12 flex items-end gap-4 md:gap-8">

                {/* Number Counter */}
                <div className="flex flex-col items-end pointer-events-none">
                    <div className="text-2xl md:text-6xl font-black text-white/10 leading-none select-none">
                        {(index + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="h-px w-8 md:w-full bg-white/20 my-2" />
                    <div className="hidden md:block text-xs font-mono text-white/40">
                        TOTAL // {totalItems.toString().padStart(2, '0')}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleManualNavigate(-1);
                        }}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-white/20 hover:bg-white text-white hover:text-black transition-all cursor-pointer backdrop-blur-sm bg-black/20"
                        aria-label="Previous Slide"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleManualNavigate(1);
                        }}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-white/20 hover:bg-white text-white hover:text-black transition-all cursor-pointer backdrop-blur-sm bg-black/20"
                        aria-label="Next Slide"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 z-40 pointer-events-none">
                <motion.div
                    key={index}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: AUTO_SCROLL_INTERVAL / 1000, ease: "linear" }}
                    className="h-full bg-white/50"
                />
            </div>

        </section>
    );
}