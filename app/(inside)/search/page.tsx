'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {CinematicSearchResult, ProfileSearchResult} from '@/lib/definitions';
import { searchProfiles } from '@/lib/actions/profile-actions';

// ✨ UI Components
import LoadingSpinner from '@/app/ui/loading-spinner';
import UserCard from '@/app/ui/user/UserCard'; // Ensure this component fits the clean aesthetic or update it separately
import CinematicResultCard from '@/app/ui/search/CinematicResultCard';
import { geistSans } from "@/app/ui/fonts";
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    AtSymbolIcon,
    FilmIcon,
    UserIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import {searchCinematic} from "@/lib/actions/discovery-actions";

// --- SEARCH LOGIC COMPONENT ---
function SearchContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('query') || '';

    // State
    const [query, setQuery] = useState(initialQuery);
    const [profileResults, setProfileResults] = useState<ProfileSearchResult[]>([]);
    const [mediaResults, setMediaResults] = useState<CinematicSearchResult[]>([]);
    const [isSearching, startTransition] = useTransition();
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

    // Determine Mode
    const isUserMode = query.startsWith('@');

    // 1. Fetch Current User
    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);
        };
        fetchUser();
    }, []);

    // 2. Search Effect
    useEffect(() => {
        const isInitialLoad = query === initialQuery && initialQuery !== '';
        const delay = isInitialLoad ? 0 : 300;

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
        }, delay);

        return () => clearTimeout(handler);
    }, [query]);

    const hasResults = profileResults.length > 0 || mediaResults.length > 0;

    return (
        <div className={`w-full pb-24 relative z-10 max-w-2xl mx-auto pt-8 px-4 md:px-6 ${geistSans.className}`}>

            {/* Header */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Global Search</h2>
                <p className="text-sm text-zinc-500 mt-1">Find films or find people.</p>
            </div>

            {/* Search Input Area */}
            <div className="mb-10 sticky top-4 z-20">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {isUserMode ? (
                            <AtSymbolIcon className="h-5 w-5 text-blue-500 animate-in zoom-in duration-200" />
                        ) : (
                            <MagnifyingGlassIcon className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
                        )}
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search movies or type '@' for users..."
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-11 pr-12 text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800/50 transition-all shadow-sm"
                        autoFocus
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Helper Tip */}
                {!query && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-400">
                        <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded text-[10px] font-mono">@</span>
                        <span>to switch to profile search</span>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="min-h-[200px]">
                {isSearching ? (
                    // LOADING STATE
                    <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-60">
                        <ArrowPathIcon className="w-5 h-5 animate-spin text-zinc-400" />
                        <p className="text-xs font-medium text-zinc-500">Searching...</p>
                    </div>
                ) : hasResults ? (
                    // RESULTS
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">

                        {/* A. PROFILES */}
                        {profileResults.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">People</h3>
                                    <span className="text-[10px] font-medium px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-500">
                                        {profileResults.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {profileResults.map((profile) => (
                                        <UserCard
                                            key={profile.id}
                                            profile={profile}
                                            currentUserId={currentUserId}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* B. MEDIA */}
                        {mediaResults.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Cinema</h3>
                                    <span className="text-[10px] font-medium px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-500">
                                        {mediaResults.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {mediaResults.map((media) => (
                                        <CinematicResultCard
                                            key={`${media.media_type}-${media.id}`}
                                            media={media}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                ) : query.length > 1 ? (
                    // EMPTY STATE
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                            <span className="text-lg">∅</span>
                        </div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No results found</p>
                        <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                            We couldn&apos;t find anything matching &quot;{query}&quot;. Try a different term or check your spelling.
                        </p>
                    </div>
                ) : (
                    // IDLE STATE (Placeholder)
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <div className="flex gap-4 mb-4">
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                <FilmIcon className="w-6 h-6 text-zinc-400" />
                            </div>
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                <UserIcon className="w-6 h-6 text-zinc-400" />
                            </div>
                        </div>
                        <p className="text-xs font-medium text-zinc-400">Search the archive</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- PAGE EXPORT ---
export default function SearchPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-black">
            <SearchContent />
        </main>
    );
}