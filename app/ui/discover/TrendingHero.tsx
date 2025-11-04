'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {AnimatePresence, motion, useMotionValue} from 'framer-motion';
import { CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import { FilmIcon, TvIcon } from '@heroicons/react/24/solid';

// How far to drag before triggering a slide change
const DRAG_BUFFER = 50;

export default function TrendingHero({ items }: { items: CinematicSearchResult[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const dragX = useMotionValue(0);

    const onDragEnd = () => {
        const x = dragX.get();

        if (x <= -DRAG_BUFFER && currentIndex < items.length - 1) {
            setCurrentIndex(i => i + 1);
        } else if (x >= DRAG_BUFFER && currentIndex > 0) {
            setCurrentIndex(i => i - 1);
        }
    };

    return (
        <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-black">
            {/* Backgrounds */}
            <AnimatePresence>
                {items.map((item, i) => i === currentIndex && (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
                            alt={item.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Draggable Carousel */}
            <motion.div
                className="absolute inset-0 z-10"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                style={{ x: dragX }}
                onDragEnd={onDragEnd}
                animate={{ translateX: `-${currentIndex * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                {/* This div holds all the slides side-by-side */}
                <div className="flex h-full" style={{ width: `${items.length * 100}%` }}>
                    {items.map((item) => (
                        <div key={item.id} className="w-full h-full flex flex-col justify-end p-6 md:p-12 lg:p-16">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="max-w-xl"
                            >
                                <div className={`inline-flex items-center gap-1.5 flex-shrink-0 text-xs px-3 py-1 rounded-full mb-3 ${
                                    item.media_type === 'movie'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                }`}>
                                    {item.media_type === 'movie' ? <FilmIcon className="w-3 h-3" /> : <TvIcon className="w-3 h-3" />}
                                    <span className="font-bold">{item.media_type === 'movie' ? 'Movie' : 'TV Show'}</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-white line-clamp-2" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                                    {item.title}
                                </h1>
                                <p className="text-lg text-white/80 mt-4 line-clamp-3" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                                    {item.overview}
                                </p>
                                <Link
                                    href={`/discover/${item.media_type}/${item.id}`}
                                    className="inline-block mt-6 px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transition-colors"
                                >
                                    View Details
                                </Link>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Dots */}
            <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-2 w-2 rounded-full transition-all ${
                            i === currentIndex ? 'w-6 bg-white' : 'bg-white/50'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}