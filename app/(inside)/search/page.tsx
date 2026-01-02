'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProfileSearchResult } from '@/lib/definitions';
import { searchProfiles } from '@/lib/actions/profile-actions';
import { searchCinematic, type CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';
import { FilmIcon, TvIcon } from '@heroicons/react/24/solid'; // Solid icons for media types
import LoadingSpinner from '@/app/ui/loading-spinner';

/* --- 1. User Card Component --- */
function UserResultCard({ profile }: { profile: ProfileSearchResult }) {
    return (
        <Link
            href={`/profile/${profile.username}`}
            className="flex items-center gap-4 p-4 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50 group"
        >
            <div className="relative h-12 w-12 flex-shrink-0">
                <Image
                    src={profile.profile_pic_url || '/placeholder-user.jpg'}
                    alt={profile.display_name}
                    fill
                    className="rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                />
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {profile.display_name}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                    <span className="text-zinc-400">@</span>{profile.username}
                </p>
            </div>
            <div className="text-zinc-300 dark:text-zinc-700">
                <UserIcon className="w-5 h-5" />
            </div>
        </Link>
    );
}

/* --- 2. Cinematic Media Card Component --- */
function CinematicResultCard({ media }: { media: CinematicSearchResult }) {
    return (
        <Link
            href={`/discover/${media.media_type}/${media.id}`}
            className="flex items-center gap-4 p-4 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50 group"
        >
            <div className="relative h-16 w-12 flex-shrink-0 bg-zinc-200 dark:bg-zinc-800 rounded-md overflow-hidden shadow-sm">
                {media.poster_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w200${media.poster_path}`}
                        alt={media.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        {media.media_type === 'movie' ?
                            <FilmIcon className="w-6 h-6 text-zinc-400" /> :
                            <TvIcon className="w-6 h-6 text-zinc-400" />
                        }
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {media.title}
                </p>
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="uppercase text-xs font-bold tracking-wider">
                        {media.media_type === 'movie' ? 'Movie' : 'TV'}
                    </span>
                    <span>•</span>
                    <span>{media.release_date ? media.release_date.split('-')[0] : 'N/A'}</span>
                </div>
            </div>
            <div className="text-zinc-300 dark:text-zinc-700">
                {media.media_type === 'movie' ?
                    <FilmIcon className="w-5 h-5" /> :
                    <TvIcon className="w-5 h-5" />
                }
            </div>
        </Link>
    );
}

/* --- 3. Main Search Page --- */
export default function SearchPage() {
    const [query, setQuery] = useState('');

    // Separate states for different result types
    const [profileResults, setProfileResults] = useState<ProfileSearchResult[]>([]);
    const [mediaResults, setMediaResults] = useState<CinematicSearchResult[]>([]);

    const [isSearching, startTransition] = useTransition();

    useEffect(() => {
        const handler = setTimeout(() => {
            if (query.trim().length > 1) {
                startTransition(async () => {
                    // Fetch both concurrently
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
        }, 300); // 300ms debounce

        return () => clearTimeout(handler);
    }, [query]);

    const hasResults = profileResults.length > 0 || mediaResults.length > 0;

    return (
        <main className="p-6 max-w-3xl mx-auto min-h-screen pb-24">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">Search</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Find people, movies, and TV shows.</p>
            </div>

            {/* Search Input */}
            <div className="relative mb-10 group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search DeeperWeave..."
                    className="w-full rounded-2xl border-0 bg-zinc-100 dark:bg-zinc-900 py-4 pl-12 pr-4 text-base ring-1 ring-zinc-200 dark:ring-zinc-800 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all placeholder:text-zinc-500"
                    autoFocus
                />
            </div>

            {/* Results Area */}
            <div className="space-y-12">
                {isSearching ? (
                    <div className="flex items-center justify-center py-20">
                        <LoadingSpinner />
                    </div>
                ) : hasResults ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Column 1: Profiles */}
                        {profileResults.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 px-1">
                                    People
                                </h2>
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                                    {profileResults.map((profile) => (
                                        <UserResultCard key={profile.id} profile={profile} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Column 2: Media */}
                        {mediaResults.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 px-1">
                                    Movies & TV
                                </h2>
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                                    {mediaResults.map((media) => (
                                        <CinematicResultCard key={`${media.media_type}-${media.id}`} media={media} />
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                ) : query.length > 1 ? (
                    <div className="text-center py-20 opacity-50">
                        <p className="text-lg text-zinc-500">No results found for &ldquo;{query}&rdquo;</p>
                    </div>
                ) : (
                    <div className="text-center py-20 opacity-30">
                        <div className="inline-flex gap-4 justify-center mb-4">
                            <UserIcon className="w-8 h-8" />
                            <FilmIcon className="w-8 h-8" />
                        </div>
                        <p className="text-sm">Start typing to search globally</p>
                    </div>
                )}
            </div>
        </main>
    );
}