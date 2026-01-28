'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ListSummary } from '@/lib/data/lists-data';
import { FolderIcon } from '@heroicons/react/24/outline';

export default function ListCard({ list }: { list: ListSummary }) {
    return (
        <Link
            href={`/lists/${list.id}`} // Leads to public view
            className="group relative flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
            {/* --- Poster Preview Area --- */}
            <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-950/50 p-4 flex items-center justify-center overflow-hidden border-b border-zinc-100 dark:border-zinc-800">

                {list.preview_items && list.preview_items.length > 0 ? (
                    <div className="relative w-28 h-40 mt-4">
                        {/* Stack Effect */}
                        {list.preview_items.slice(0, 3).map((item, i) => (
                            <div
                                key={i}
                                className="absolute top-0 shadow-lg rounded-md overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-800 origin-bottom transition-transform duration-500 group-hover:scale-105"
                                style={{
                                    left: i * 8, // Offset right
                                    top: i * -4, // Offset up
                                    zIndex: i,
                                    width: '100%',
                                    height: '100%',
                                    transform: `rotate(${(i - 1) * 4}deg) translateX(${i * -4}px)`
                                }}
                            >
                                {item.poster_url ? (
                                    <Image
                                        src={item.poster_url.startsWith('http') ? item.poster_url : `https://image.tmdb.org/t/p/w200${item.poster_url}`}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        sizes="120px"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    // Empty State Icon
                    <div className="flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
                        <FolderIcon className="w-12 h-12 mb-2 opacity-50" />
                    </div>
                )}
            </div>

            {/* --- Info --- */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-tight mb-2 line-clamp-1 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                    {list.title}
                </h3>

                {list.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">
                        {list.description}
                    </p>
                )}

                <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-400">
                        {list.item_count} items
                    </span>
                    <span className="text-xs font-bold text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                        View Collection &rarr;
                    </span>
                </div>
            </div>
        </Link>
    );
}