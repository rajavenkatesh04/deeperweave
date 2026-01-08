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
    StarIcon,
    ArrowLongRightIcon,
    CommandLineIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

/* --- 1. User Card Component (Compact) --- */
function UserResultCard({ profile }: { profile: ProfileSearchResult }) {
    return (
        <Link
            href={`/profile/${profile.username}`}
            className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group"
        >
            <div className="relative h-12 w-12 shrink-0">
                <Image
                    src={profile.profile_pic_url || '/placeholder-user.jpg'}
                    alt={profile.display_name}
                    fill
                    className="object-cover grayscale-0 group-hover:grayscale transition-all duration-300"
                />
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

/* --- 2. Cinematic & Celebrity Media Card Component (Larger Posters) --- */
function CinematicResultCard({ media }: { media: CinematicSearchResult }) {
    const isPerson = media.media_type === 'person';
    const subtitle = isPerson
        ? media.department
        : (media.release_date ? media.release_date.split('-')[0] : 'N/A');

    const href = isPerson
        ? `/discover/actor/${media.id}`
        : `/discover/${media.media_type}/${media.id}`;

    return (
        <Link
            href={href}
            className="group block bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-all hover:shadow-lg overflow-hidden"
        >
            <div className="relative w-full aspect-[2/3] bg-zinc-100 dark:bg-zinc-900">
                {media.poster_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                        alt={media.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        {media.media_type === 'movie' && <FilmIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />}
                        {media.media_type === 'tv' && <TvIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />}
                        {media.media_type === 'person' && <StarIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />}
                    </div>
                )}
                <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 border text-[9px] font-bold uppercase tracking-wider ${
                        isPerson
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-500'
                            : 'bg-white/90 dark:bg-black/90 border-zinc-200 dark:border-zinc-800 text-zinc-500'
                    }`}>
                        {media.media_type === 'movie' ? 'FILM' : media.media_type === 'tv' ? 'TV' : 'STAR'}
                    </span>
                </div>
            </div>

            <div className="p-3">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight group-hover:underline decoration-1 underline-offset-2 line-clamp-2 mb-1">
                    {media.title}
                </p>
                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    {subtitle}
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

    const isUserMode = query.startsWith('@');

    useEffect(() => {
        const handler = setTimeout(() => {
            if (query.trim().length > 1) {
                startTransition(async () => {
                    if (query.startsWith('@')) {
                        const cleanQuery = query.substring(1);
                        if (cleanQuery.length > 0) {
                            const profiles = await searchProfiles(cleanQuery);
                            setProfileResults(profiles);
                            setMediaResults([]);
                        }
                    } else {
                        const media = await searchCinematic(query);
                        setMediaResults(media);
                        setProfileResults([]);
                    }
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
        <main className="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 px-4 py-6 md:px-8 md:py-10 pb-24">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed"
                 style={{
                     backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                     backgroundSize: '24px 24px'
                 }}
            />

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="mb-6 md:mb-8">
                    <h1 className={`${PlayWriteNewZealandFont.className} text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2`}>
                        Global Search
                    </h1>
                    <div className="flex gap-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                        <span className={!isUserMode ? "text-zinc-900 dark:text-zinc-100 font-bold" : "opacity-50"}>Cinema & Stars</span>
                        <span>//</span>
                        <span className={isUserMode ? "text-zinc-900 dark:text-zinc-100 font-bold" : "opacity-50"}>@Profiles</span>
                    </div>
                </div>

                <div className="relative mb-8 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <CommandLineIcon className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search movies, TV, people, or type '@' for users..."
                        className="w-full bg-white dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 py-4 pl-12 pr-12 text-base md:text-lg font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors shadow-sm"
                        autoFocus
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded transition-colors"
                            aria-label="Clear search"
                        >
                            <XMarkIcon className="w-5 h-5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100" />
                        </button>
                    )}
                </div>

                <div className="min-h-[400px]">
                    {isSearching ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <LoadingSpinner className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
                            <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">Scanning Database...</p>
                        </div>
                    ) : hasResults ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* USER RESULTS */}
                            {profileResults.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 pb-3 mb-4 border-b-2 border-zinc-200 dark:border-zinc-800">
                                        <UserIcon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                                        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                                            User Profiles
                                        </h2>
                                        <span className="ml-auto text-xs font-mono text-zinc-400">
                                            {profileResults.length} {profileResults.length === 1 ? 'result' : 'results'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {profileResults.map((profile) => (
                                            <UserResultCard key={profile.id} profile={profile} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* MEDIA RESULTS */}
                            {mediaResults.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 pb-3 mb-4 border-b-2 border-zinc-200 dark:border-zinc-800">
                                        <FilmIcon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                                        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                                            Cinematic Database
                                        </h2>
                                        <span className="ml-auto text-xs font-mono text-zinc-400">
                                            {mediaResults.length} {mediaResults.length === 1 ? 'result' : 'results'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                            <p className="text-xs font-mono text-zinc-500 mt-2">
                                {isUserMode ? `User "${query}" not found.` : `No media found for "${query}".`}
                            </p>
                        </div>
                    ) : (
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