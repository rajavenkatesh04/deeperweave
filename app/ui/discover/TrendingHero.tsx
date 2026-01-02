'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import {
    FilmIcon,
    TvIcon,
    PlayIcon,
    InformationCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/solid';

const AUTO_SCROLL_INTERVAL = 8000;

export default function TrendingHero({ items }: { items: CinematicSearchResult[] }) {
    const [index, setIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Safe items check
    if (!items || items.length === 0) return null;

    const currentItem = items[index];

    const paginate = useCallback((newDirection: number) => {
        setIndex((prev) => (prev + newDirection + items.length) % items.length);
    }, [items.length]);

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
        <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-zinc-950 group border-b border-zinc-800">

            {/* --- BACKGROUND LAYER --- */}
            <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                    key={currentItem.id}
                    className="absolute inset-0 z-0"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                >
                    <Image
                        src={`https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`}
                        alt={currentItem.title}
                        fill
                        className="object-cover"
                        priority
                    />

                    {/* OPTIMIZED VIGNETTE: Only covers bottom 60% to let top shine */}
                    <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-zinc-950 via-zinc-900/80 to-transparent" />

                    {/* Subtle left gradient for desktop text legibility */}
                    <div className="absolute inset-y-0 left-0 w-[40%] bg-gradient-to-r from-zinc-950/60 to-transparent hidden md:block" />
                </motion.div>
            </AnimatePresence>

            {/* --- CONTENT LAYER --- */}
            <div className="absolute inset-0 z-10 flex flex-col justify-end pb-12 md:pb-20 px-4 md:px-12">
                <div className="max-w-3xl w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentItem.id}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={{
                                visible: { transition: { staggerChildren: 0.05 } }
                            }}
                            className="space-y-3 md:space-y-5"
                        >
                            {/* 1. Meta Badges (Compact) */}
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 10 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="flex items-center gap-2"
                            >
                                {/* Media Type */}
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${
                                    currentItem.media_type === 'movie'
                                        ? 'bg-blue-500/20 text-blue-100 border-blue-500/30'
                                        : 'bg-green-500/20 text-green-100 border-green-500/30'
                                }`}>
                                    {currentItem.media_type === 'movie' ? <FilmIcon className="w-3 h-3" /> : <TvIcon className="w-3 h-3" />}
                                    <span>{currentItem.media_type === 'movie' ? 'Movie' : 'TV'}</span>
                                </div>

                                <div className="h-3 w-px bg-white/30" />

                                {/* Year */}
                                {currentItem.release_date && (
                                    <span className="text-zinc-300 text-[10px] md:text-xs font-semibold">
                                        {currentItem.release_date.split('-')[0]}
                                    </span>
                                )}
                            </motion.div>

                            {/* 2. Title (Scaled Down) */}
                            <motion.h1
                                variants={{
                                    hidden: { opacity: 0, y: 10 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[0.95] tracking-tight drop-shadow-lg"
                            >
                                {currentItem.title}
                            </motion.h1>

                            {/* 3. Description (Constrained width & lines) */}
                            <motion.p
                                variants={{
                                    hidden: { opacity: 0, y: 10 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="text-zinc-300 text-xs sm:text-sm md:text-base font-medium leading-relaxed line-clamp-2 md:line-clamp-3 max-w-lg drop-shadow-md"
                            >
                                {currentItem.overview}
                            </motion.p>

                            {/* 4. Actions (Compact Buttons) */}
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 10 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="flex items-center gap-3 pt-2"
                            >
                                <Link
                                    href={`/discover/${currentItem.media_type}/${currentItem.id}`}
                                    className="flex items-center gap-2 px-5 py-2.5 md:px-7 md:py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs md:text-sm font-bold rounded-lg transition-all shadow-lg shadow-rose-900/20 active:scale-95"
                                >
                                    <PlayIcon className="w-4 h-4 md:w-5 md:h-5" />
                                    <span>View Details</span>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* --- CONTROLS --- */}

            {/* Arrows (Hidden on Mobile to save space, visible on hover desktop) */}
            <div className="hidden md:flex absolute inset-0 z-20 pointer-events-none justify-between items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => handleManualNavigate(-1)} className="pointer-events-auto p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors">
                    <ChevronLeftIcon className="w-8 h-8" />
                </button>
                <button onClick={() => handleManualNavigate(1)} className="pointer-events-auto p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors">
                    <ChevronRightIcon className="w-8 h-8" />
                </button>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-6 right-6 z-30 flex gap-1.5">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            if (intervalRef.current) clearInterval(intervalRef.current);
                            setIndex(i);
                            startAutoScroll();
                        }}
                        className={`h-1 rounded-full transition-all duration-500 ${
                            i === index
                                ? 'w-6 bg-rose-500'
                                : 'w-1.5 bg-white/30 hover:bg-white/60'
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}