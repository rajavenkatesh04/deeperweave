'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import PosterCard from './PosterCard';
import { ArrowLongRightIcon, Square2StackIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

export default function CinematicRow({ title, items, href }: {
    title: string;
    items: CinematicSearchResult[];
    href: string;
}) {
    // 1. Ref to control scrolling
    const rowRef = useRef<HTMLDivElement>(null);

    // 2. Scroll Handler
    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const { clientWidth } = rowRef.current;
            // Scroll by 75% of the visible width for a natural "page turn" feel
            const scrollAmount = direction === 'left' ? -(clientWidth * 0.75) : (clientWidth * 0.75);
            rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <section className="w-full py-6 border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-black overflow-hidden">

            {/* FORCE HIDE SCROLLBAR STYLE */}
            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* --- HEADER --- */}
            <div className="flex items-end justify-between px-6 md:px-12 mb-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                        <Square2StackIcon className="w-3 h-3" />
                        <span>Collection // {title.split(' ')[0]}</span>
                    </div>
                    <h2 className={`${PlayWriteNewZealandFont.className} text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 leading-none mt-2`}>
                        {title}
                    </h2>
                </div>

                <Link
                    href={href}
                    className="group flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 bg-transparent transition-colors"
                >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                        View All
                    </span>
                    <ArrowLongRightIcon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors group-hover:translate-x-1 duration-300" />
                </Link>
            </div>

            {/* --- SCROLL CONTAINER WRAPPER --- */}
            {/* Added 'group/row' to handle hover state for buttons */}
            <div className="relative w-full group/row">

                {/* --- LEFT SCROLL BUTTON --- */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-8 z-20 w-12 md:w-16 flex items-center justify-center bg-gradient-to-r from-white via-white/80 to-transparent dark:from-black dark:via-black/80 dark:to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 focus:outline-none"
                    aria-label="Scroll Left"
                >
                    <div className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-black transition-colors">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </div>
                </button>

                {/* --- SCROLL AREA --- */}
                <div
                    ref={rowRef}
                    className="flex overflow-x-auto pl-6 md:pl-12 pr-6 md:pr-12 gap-6 md:gap-8 snap-x snap-mandatory hide-scrollbar pb-8 pt-2"
                >
                    {items.map((item) => (
                        <div key={item.id} className="snap-center shrink-0">
                            <PosterCard item={item} />
                        </div>
                    ))}
                </div>

                {/* --- RIGHT SCROLL BUTTON --- */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-8 z-20 w-12 md:w-16 flex items-center justify-center bg-gradient-to-l from-white via-white/80 to-transparent dark:from-black dark:via-black/80 dark:to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 focus:outline-none"
                    aria-label="Scroll Right"
                >
                    <div className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-black transition-colors">
                        <ChevronRightIcon className="w-5 h-5" />
                    </div>
                </button>

            </div>
        </section>
    );
}