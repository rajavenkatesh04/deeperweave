'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import PosterCard from './PosterCard';
import { ArrowLongRightIcon, Square2StackIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { geistSans } from "@/app/ui/fonts";

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
        <section className={`w-full py-6 md:py-10 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden ${geistSans.className}`}>

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

            {/* --- HEADER (Updated Design with mobile spacing) --- */}
            <div className="flex items-end justify-between px-4 md:px-8 mb-6 md:mb-8 max-w-[1920px] mx-auto">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                        <Square2StackIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Collection // {title.split(' ')[0]}</span>
                        <span className="sm:hidden">{title.split(' ')[0]}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                        {title}
                    </h2>
                </div>

                <Link
                    href={href}
                    className="group flex items-center gap-2 pl-3 pr-2.5 py-1.5 md:pl-4 md:pr-3 md:py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all active:scale-95"
                >
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                        View All
                    </span>
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 transition-colors">
                        <ArrowLongRightIcon className="w-2.5 h-2.5 md:w-3 md:h-3 text-zinc-500 group-hover:text-white dark:group-hover:text-black transition-colors" />
                    </div>
                </Link>
            </div>

            {/* --- SCROLL CONTAINER WRAPPER --- */}
            <div className="relative w-full group/row">

                {/* --- LEFT SCROLL BUTTON (Hidden on mobile, visible on tablet+) --- */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-6 md:bottom-8 z-20 w-12 md:w-16 lg:w-24 flex items-center justify-start pl-3 md:pl-4 lg:pl-8 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/90 dark:to-transparent opacity-0 md:group-hover/row:opacity-100 transition-opacity duration-300 focus:outline-none pointer-events-none md:group-hover/row:pointer-events-auto"
                    aria-label="Scroll Left"
                >
                    <div className="p-2 md:p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all">
                        <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5 text-zinc-900 dark:text-zinc-100" />
                    </div>
                </button>

                {/* --- SCROLL AREA (Increased mobile padding and gap) --- */}
                <div
                    ref={rowRef}
                    className="flex overflow-x-auto pl-4 pr-4 md:pl-8 md:pr-8 gap-4 md:gap-6 snap-x snap-mandatory hide-scrollbar pb-6 md:pb-8 pt-1 md:pt-2"
                >
                    {items.map((item) => (
                        <div key={item.id} className="snap-center shrink-0 first:ml-0 last:mr-0">
                            <PosterCard item={item} />
                        </div>
                    ))}
                </div>

                {/* --- RIGHT SCROLL BUTTON (Hidden on mobile, visible on tablet+) --- */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-6 md:bottom-8 z-20 w-12 md:w-16 lg:w-24 flex items-center justify-end pr-3 md:pr-4 lg:pr-8 bg-gradient-to-l from-white via-white/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/90 dark:to-transparent opacity-0 md:group-hover/row:opacity-100 transition-opacity duration-300 focus:outline-none pointer-events-none md:group-hover/row:pointer-events-auto"
                    aria-label="Scroll Right"
                >
                    <div className="p-2 md:p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all">
                        <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 text-zinc-900 dark:text-zinc-100" />
                    </div>
                </button>

            </div>
        </section>
    );
}