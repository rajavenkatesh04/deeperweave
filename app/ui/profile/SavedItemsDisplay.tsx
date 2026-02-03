'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    FilmIcon,
    TvIcon,
    UserIcon,
    ArchiveBoxIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';
import { geistSans } from "@/app/ui/fonts";
import { useSavedItems } from '@/hooks/api/use-saved-items';
import LoadingSpinner from '@/app/ui/loading-spinner';
import ContentGuard from '@/app/ui/shared/ContentGuard'; // 🛡️ IMPORT
import { createClient } from '@/utils/supabase/client'; // 🛡️ IMPORT (Client version)

export default function SavedItemsDisplay({ userId }: { userId: string }) {
    const { data: savedItems, isLoading, isError } = useSavedItems(userId);
    const [isSFW, setIsSFW] = useState(true); // Default to safe while loading

    // ✨ FETCH PREFERENCE ON MOUNT
    useEffect(() => {
        const fetchPreference = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            const pref = user?.user_metadata?.content_preference || 'sfw';
            setIsSFW(pref === 'sfw');
        };
        fetchPreference();
    }, []);

    if (isLoading) {
        return (
            <div className="h-[50vh] w-full flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (isError) {
        return (
            <div className={`p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm text-center ${geistSans.className}`}>
                Failed to load library.
            </div>
        );
    }

    if (!savedItems || savedItems.length === 0) {
        return <EmptyState />;
    }

    // Calculate Stats
    const movieCount = savedItems.filter(i => i.item_type === 'movie').length;
    const seriesCount = savedItems.filter(i => i.item_type === 'series' || i.item_type === 'tv').length;
    const personCount = savedItems.filter(i => i.item_type === 'person').length;


    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative z-10 max-w-4xl mx-auto pt-8 px-4 md:px-6">
            {/* --- Header Section --- */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Saved Library</h2>
                    <p className="text-sm text-zinc-500 mt-1">Private Collection &bull; {savedItems.length} Items</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <StatPill icon={FilmIcon} label="Movies" count={movieCount} />
                    <StatPill icon={TvIcon} label="TV Shows" count={seriesCount} />
                    <StatPill icon={UserIcon} label="People" count={personCount} />
                </div>
            </div>

            {/* --- Grid Section --- */}
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

                    // ✨ CHECK ADULT FLAG
                    // (Ensure your 'details' object in DB actually has this field, or cast as any if using mixed types)
                    const isExplicit = (details as any).adult === true;

                    return (
                        <div key={item.id} className="group relative w-full h-full">
                            <Link href={href} className="block w-full h-full">
                                {/* --- POSTER CONTAINER --- */}
                                <div className="relative aspect-[2/3] w-full rounded-sm overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:border-zinc-400 dark:group-hover:border-zinc-100">

                                    {/* 🛡️ CONTENT GUARD WRAPPER */}
                                    <ContentGuard isAdult={isExplicit} isSFW={isSFW}>
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
                                    </ContentGuard>

                                    {/* Badge */}
                                    <div className="absolute top-0 left-0 p-2 z-10">
                                        <div className={`px-1.5 py-0.5 backdrop-blur-sm text-[9px] font-black uppercase tracking-wider shadow-sm border border-white/10 dark:border-black/10 ${badgeColorClass}`}>
                                            {badgeLabel}
                                        </div>
                                    </div>

                                    {/* Explicit Indicator (Visible even if guarded) */}
                                    {isExplicit && (
                                        <div className="absolute top-0 right-0 p-2 z-10 pointer-events-none">
                                            <div className="w-2 h-2 rounded-full bg-red-600 shadow-sm ring-1 ring-white/20"></div>
                                        </div>
                                    )}
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
    );
}

// --- Sub-Components ---

function StatPill({ icon: Icon, label, count }: { icon: any, label: string, count: number }) {
    if (count === 0) return null;
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <Icon className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <strong className="text-zinc-900 dark:text-zinc-200 mr-1">{count}</strong>
                <span className="hidden sm:inline">{label}</span>
            </span>
        </div>
    );
}

function EmptyState() {
    return (
        <div className={`w-full max-w-2xl mx-auto pt-10 px-4 ${geistSans.className}`}>
            <div className="p-8 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 text-zinc-400">
                    <ArchiveBoxIcon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Library Empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs mb-6">
                    Items you save will appear here. Start building your collection.
                </p>
                <Link
                    href="/discover"
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                    Explore Content
                </Link>
            </div>
        </div>
    );
}