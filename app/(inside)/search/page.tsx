'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProfileSearchResult } from '@/lib/definitions';
import { searchProfiles } from '@/lib/actions/profile-actions';
import { searchCinematic, type CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import {
    MagnifyingGlassIcon,
    UserIcon,
    FilmIcon,
    TvIcon,
    ArrowLongRightIcon,
    CommandLineIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";


/* --- 1. User Card Component (Technical) --- */
function UserResultCard({ profile }: { profile: ProfileSearchResult }) {
    return (
        <Link
            href={`/profile/${profile.username}`}
            className="flex items-center gap-4 p-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group last:border-0"
        >
            <div className="relative h-10 w-10 shrink-0">
                <Image
                    src={profile.profile_pic_url || '/placeholder-user.jpg'}
                    alt={profile.display_name}
                    fill
                    // CHANGE HERE: Swapped grayscale behavior
                    className="object-cover grayscale-0 group-hover:grayscale transition-all duration-300"
                />
                {/* Tech Frame */}
                <div className="absolute inset-0 border border-zinc-200 dark:border-zinc-800" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-black dark:group-hover:text-white">
                    {profile.display_name}
                </p>
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                    @{profile.username}
                </p>
            </div>

            <ArrowLongRightIcon className="w-4 h-4 text-zinc-300 dark:text-zinc-700 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
        </Link>
    );
}

/* --- 2. Cinematic Media Card Component (Technical) --- */
function CinematicResultCard({ media }: { media: CinematicSearchResult }) {
    const year = media.release_date ? media.release_date.split('-')[0] : 'N/A';

    return (
        <Link
            href={`/discover/${media.media_type}/${media.id}`}
            className="flex items-start gap-4 p-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group last:border-0"
        >
            <div className="relative h-16 w-12 shrink-0 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                {media.poster_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w200${media.poster_path}`}
                        alt={media.title}
                        fill
                        // CHANGE HERE: Swapped grayscale behavior
                        className="object-cover grayscale-0 group-hover:grayscale transition-all duration-500"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        {media.media_type === 'movie' ?
                            <FilmIcon className="w-5 h-5 text-zinc-300 dark:text-zinc-700" /> :
                            <TvIcon className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
                        }
                    </div>
                )}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                        {media.media_type === 'movie' ? 'FILM' : 'TV'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                        {year}
                    </span>
                </div>

                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight group-hover:underline decoration-1 underline-offset-4 line-clamp-1">
                    {media.title}
                </p>

                <p className="text-[9px] font-mono text-zinc-400 mt-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    ID: {media.id}
                </p>
            </div>
        </Link>
    );
}

/* --- 3. Main Search Page --- */
export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [profileResults, setProfileResults] = useState<ProfileSearchResult[]>([]);
    const [mediaResults, setMediaResults] = useState<CinematicSearchResult[]>([]);
    const [isSearching, startTransition] = useTransition();

    useEffect(() => {
        const handler = setTimeout(() => {
            if (query.trim().length > 1) {
                startTransition(async () => {
                    const [profiles, media] = await Promise.all([
                        searchProfiles(query),
                        searchCinematic(query)
                    ]);
                    setProfileResults(profiles);
                    setMediaResults(media);
                });
            } else {
                setProfileResults([]);
                setMediaResults([]);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [query]);

    const hasResults = profileResults.length > 0 || mediaResults.length > 0;

    return (
        <main className="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 px-6 py-8 md:px-12 md:py-12 pb-24">

            {/* --- TECHNICAL BACKGROUND --- */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed"
                 style={{
                     backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                     backgroundSize: '24px 24px'
                 }}
            />

            <div className="relative z-10 max-w-5xl mx-auto">

                {/* --- HEADER --- */}
                <div className="mb-8 md:mb-12">
                    <h1 className={`${PlayWriteNewZealandFont.className} text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-2`}>
                        Global Search
                    </h1>
                    <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">
                        Index // Profiles // Cinema // TV
                    </p>
                </div>

                {/* --- COMMAND INPUT --- */}
                <div className="relative mb-12 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <CommandLineIcon className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter query parameters..."
                        className="w-full bg-white dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 py-4 pl-12 pr-4 text-base md:text-lg font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors shadow-sm"
                        autoFocus
                    />
                    {/* Blinking Cursor Decoration (Optional) */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-4 bg-zinc-900 dark:bg-zinc-100 animate-pulse hidden md:block opacity-50" />
                </div>

                {/* --- RESULTS --- */}
                <div className="min-h-[400px]">
                    {isSearching ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <LoadingSpinner className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
                            <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">Scanning Database...</p>
                        </div>
                    ) : hasResults ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* COLUMN 1: PROFILES */}
                            {profileResults.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                                        <UserIcon className="w-4 h-4 text-zinc-500" />
                                        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                            User Profiles
                                        </h2>
                                    </div>
                                    <div className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                        {profileResults.map((profile) => (
                                            <UserResultCard key={profile.id} profile={profile} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* COLUMN 2: MEDIA */}
                            {mediaResults.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                                        <FilmIcon className="w-4 h-4 text-zinc-500" />
                                        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                            Cinematic Entries
                                        </h2>
                                    </div>
                                    <div className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                        {mediaResults.map((media) => (
                                            <CinematicResultCard key={`${media.media_type}-${media.id}`} media={media} />
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : query.length > 1 ? (
                        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50">
                            <h3 className="text-lg font-bold uppercase tracking-widest text-zinc-400">No Data Found</h3>
                            <p className="text-xs font-mono text-zinc-500 mt-2">Query: "{query}" returned 0 results.</p>
                        </div>
                    ) : (
                        // IDLE STATE
                        <div className="flex flex-col items-center justify-center py-20 opacity-30">
                            <MagnifyingGlassIcon className="w-16 h-16 text-zinc-400 mb-4" />
                            <p className="text-sm font-mono uppercase tracking-widest">System Ready</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}