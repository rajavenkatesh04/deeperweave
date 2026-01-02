'use client';

import Link from 'next/link';
import { CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import PosterCard from './PosterCard';
import { ArrowLongRightIcon } from '@heroicons/react/24/solid';

export default function CinematicRow({ title, items, href }: {
    title: string;
    items: CinematicSearchResult[];
    href: string;
}) {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <section className="w-full py-6 md:py-8 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
            {/* --- HEADER --- */}
            <div className="flex justify-between items-end mb-5 px-4 md:px-8">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {title}
                    </h2>
                </div>

                <Link
                    href={href}
                    className="group flex items-center gap-1.5 text-sm font-semibold text-rose-600 dark:text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 transition-colors pb-0.5"
                >
                    <span>View All</span>
                    <ArrowLongRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            {/* --- SCROLL CONTAINER --- */}
            {/* pb-10 is crucial: It allows space for the PosterCard hover shadow so it doesn't get cut off */}
            <div className="flex overflow-x-auto pl-1 gap-4 md:gap-5 px-4 md:px-8 pb-10 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {items.map((item) => (
                    <PosterCard key={item.id} item={item} />
                ))}

                {/* Spacer to ensure the last item isn't flush against the screen edge when scrolled */}
                <div className="w-2 flex-shrink-0" />
            </div>
        </section>
    );
}