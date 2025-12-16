'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import {
    FilmIcon,
    TvIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/solid';

const AUTO_SCROLL_INTERVAL = 6000;

const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

export default function TrendingHero({ items }: { items: CinematicSearchResult[] }) {
    const [[page, direction], setPage] = useState([0, 0]);
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const index = ((page % items.length) + items.length) % items.length;
    const currentItem = items[index];

    const paginate = useCallback((newDirection: number) => {
        setPage([page + newDirection, newDirection]);
    }, [page]);

    const startAutoScroll = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            paginate(1);
        }, AUTO_SCROLL_INTERVAL);
    }, [paginate]);

    const stopAutoScroll = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    useEffect(() => {
        if (!isHovered) {
            startAutoScroll();
        }
        return () => stopAutoScroll();
    }, [isHovered, startAutoScroll]);

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const swipe = Math.abs(info.offset.x) * info.velocity.x;

        if (swipe < -10000) {
            paginate(1);
        } else if (swipe > 10000) {
            paginate(-1);
        }
    };

    return (
        <div
            className="relative w-full h-[65vh] md:h-[85vh] overflow-hidden bg-black group"
            onMouseEnter={() => { setIsHovered(true); stopAutoScroll(); }}
            onMouseLeave={() => { setIsHovered(false); startAutoScroll(); }}
        >
            <AnimatePresence initial={false}>
                <motion.div
                    key={page}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src={`https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`}
                        alt={currentItem.title}
                        fill
                        className="object-cover opacity-60"
                        priority
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 z-10 flex flex-col justify-end pb-12 md:pb-24 px-6 md:px-16">
                <AnimatePresence mode='wait' custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={contentVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="max-w-3xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                                currentItem.media_type === 'movie'
                                    ? 'bg-blue-500/20 text-blue-100 border border-blue-500/30'
                                    : 'bg-green-500/20 text-green-100 border border-green-500/30'
                            }`}>
                                {currentItem.media_type === 'movie' ? <FilmIcon className="w-3 h-3" /> : <TvIcon className="w-3 h-3" />}
                                {currentItem.media_type === 'movie' ? 'Movie' : 'Series'}
                            </span>
                            <span className="text-white/60 text-xs font-medium uppercase tracking-widest border border-white/20 px-2 py-1 rounded-full">
                                Trending
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-7xl font-black text-white leading-tight drop-shadow-lg mb-4">
                            {currentItem.title}
                        </h1>

                        <p className="text-white/90 text-sm md:text-lg line-clamp-3 md:line-clamp-2 max-w-xl leading-relaxed mb-8 drop-shadow-md">
                            {currentItem.overview}
                        </p>

                        <div className="flex items-center gap-4">
                            <Link
                                href={`/discover/${currentItem.media_type}/${currentItem.id}`}
                                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-xl shadow-red-900/20 flex items-center gap-2"
                            >
                                <span>Watch Now</span>
                            </Link>
                            <button className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg transition-all border border-white/10">
                                + My List
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="absolute inset-0 z-20 pointer-events-none flex justify-between items-center px-4">
                <button
                    onClick={() => paginate(-1)}
                    className="pointer-events-auto p-3 rounded-full bg-black/20 hover:bg-black/60 text-white/70 hover:text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                    aria-label="Previous Slide"
                >
                    <ChevronLeftIcon className="w-8 h-8" />
                </button>

                <button
                    onClick={() => paginate(1)}
                    className="pointer-events-auto p-3 rounded-full bg-black/20 hover:bg-black/60 text-white/70 hover:text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                    aria-label="Next Slide"
                >
                    <ChevronRightIcon className="w-8 h-8" />
                </button>
            </div>

            <motion.div
                className="absolute inset-0 z-30 md:hidden"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={handleDragEnd}
            />

            <div className="absolute bottom-8 right-8 z-30 flex gap-2">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setPage([i, i > index ? 1 : -1]);
                        }}
                        className="group relative py-2"
                    >
                        <div className={`h-1 rounded-full transition-all duration-300 ${
                            i === index ? 'w-8 bg-white' : 'w-2 bg-white/40 group-hover:bg-white/70'
                        }`} />
                    </button>
                ))}
            </div>
        </div>
    );
}