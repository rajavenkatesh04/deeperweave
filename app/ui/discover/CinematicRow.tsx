'use client';

import Link from 'next/link';
import { CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import PosterCard from './PosterCard';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

export default function CinematicRow({ title, items, href }: {
    title: string;
    items: CinematicSearchResult[];
    href: string;
}) {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4 px-4 md:px-8">
                <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
                <Link
                    href={href}
                    className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                    <span>View All</span>
                    <ChevronRightIcon className="w-4 h-4" />
                </Link>
            </div>

            {/* Horizontal Scrolling Container */}
            <div className="flex overflow-x-auto gap-4 md:gap-6 px-4 md:px-8 pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {items.map((item) => (
                    <PosterCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
}