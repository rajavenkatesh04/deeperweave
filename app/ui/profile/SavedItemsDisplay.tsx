'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FilmIcon, TvIcon, UserIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { useSavedItems } from '@/hooks/api/use-saved-items';
import LoadingSpinner from '@/app/ui/loading-spinner'; // Or your custom loader

export default function SavedItemsDisplay({ userId }: { userId: string }) {
    const { data: savedItems, isLoading, isError } = useSavedItems(userId);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (isError) {
        return <div className="p-8 text-center text-red-500">Failed to load saved items.</div>;
    }

    if (!savedItems || savedItems.length === 0) {
        return <EmptyState />;
    }

    // Calculate Stats on the fly
    const movieCount = savedItems.filter(i => i.item_type === 'movie').length;
    const seriesCount = savedItems.filter(i => i.item_type === 'series' || i.item_type === 'tv').length;
    const personCount = savedItems.filter(i => i.item_type === 'person').length;

    return (
        <main className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-6 md:px-8 md:py-10 pb-24">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed"
                 style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className={`${PlayWriteNewZealandFont.className} text-3xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-2`}>
                                Saved Library
                            </h1>
                            <p className="text-xs md:text-sm text-zinc-500 font-mono uppercase tracking-wider">
                                Private Collection // {savedItems.length} Total Items
                            </p>
                        </div>
                        <div className="hidden md:block p-4 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <ArchiveBoxIcon className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                        {movieCount > 0 && <StatBadge icon={<FilmIcon className="w-4 h-4"/>} label="Movies" count={movieCount} />}
                        {seriesCount > 0 && <StatBadge icon={<TvIcon className="w-4 h-4"/>} label="TV Shows" count={seriesCount} />}
                        {personCount > 0 && <StatBadge icon={<UserIcon className="w-4 h-4"/>} label="People" count={personCount} />}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {savedItems.map((item) => {
                        const { details } = item;

                        // Badge Logic
                        let badgeLabel = 'TV';
                        let badgeColorClass = 'bg-zinc-900/90 dark:bg-white/90 text-white dark:text-black';
                        let href = '#';

                        if (item.item_type === 'movie') {
                            badgeLabel = 'FILM';
                            href = `/discover/movie/${details.tmdb_id}`;
                        } else if (item.item_type === 'person') {
                            badgeLabel = 'STAR';
                            badgeColorClass = 'bg-amber-500/90 text-black border-amber-400/20';
                            href = `/discover/actor/${details.tmdb_id}`;
                        } else {
                            href = `/discover/tv/${details.tmdb_id}`;
                        }

                        // Fix Image URL
                        const image = details.image_url
                            ? (details.image_url.startsWith('http') ? details.image_url : `https://image.tmdb.org/t/p/w500${details.image_url}`)
                            : null;

                        return (
                            <div key={item.id} className="group relative w-full h-full">
                                <Link href={href} className="block w-full h-full">
                                    {/* --- POSTER CONTAINER --- */}
                                    <div className="relative aspect-[2/3] w-full rounded-sm overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:border-zinc-400 dark:group-hover:border-zinc-100">
                                        {image ? (
                                            <Image
                                                src={image}
                                                alt={details.title}
                                                fill
                                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:saturate-100 grayscale-[0.1] group-hover:grayscale-0"
                                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-100 dark:bg-zinc-900">
                                                <span className="text-[10px] uppercase font-bold tracking-widest">No Image</span>
                                            </div>
                                        )}

                                        {/* Badge */}
                                        <div className="absolute top-0 left-0 p-2 z-10">
                                            <div className={`px-1.5 py-0.5 backdrop-blur-sm text-[9px] font-black uppercase tracking-wider shadow-sm border border-white/10 dark:border-black/10 ${badgeColorClass}`}>
                                                {badgeLabel}
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- INFO SECTION --- */}
                                    <div className="mt-4 px-1 space-y-1 transition-opacity duration-300 opacity-80 group-hover:opacity-100">
                                        <h3 className="text-base font-bold leading-tight text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:underline decoration-1 underline-offset-4">
                                            {details.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                                                {details.subtitle}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}

function StatBadge({ icon, label, count }: { icon: any, label: string, count: number }) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-500">{icon}</span>
            <span className="text-xs font-mono text-zinc-500 uppercase">{label}</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{count}</span>
        </div>
    );
}

function EmptyState() {
    return (
        <main className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col items-center justify-center">
            <div className="relative z-10 flex flex-col items-center">
                <div className="p-8 bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700 mb-6">
                    <ArchiveBoxIcon className="w-16 h-16 text-zinc-300 dark:text-zinc-700" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Library Empty</h2>
                <Link href="/discover" className="group relative px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm uppercase tracking-wider overflow-hidden transition-all hover:shadow-lg">
                    <span className="relative z-10">Start Exploring</span>
                </Link>
            </div>
        </main>
    );
}