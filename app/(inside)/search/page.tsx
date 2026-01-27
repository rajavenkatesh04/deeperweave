'use client';

import { useState, useEffect, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'; // ✨ Import Supabase Client

// ✨ IMPORTS
import { ProfileSearchResult, UserProfile } from '@/lib/definitions';
import { CinematicSearchResult, searchCinematic } from '@/lib/actions/cinematic-actions';
import { searchProfiles } from '@/lib/actions/profile-actions';

// ✨ UI Components
import LoadingSpinner from '@/app/ui/loading-spinner';
import UserCard from '@/app/ui/user/UserCard';
import CinematicResultCard from '@/app/ui/search/CinematicResultCard';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import {
    MagnifyingGlassIcon,
    UserIcon,
    FilmIcon,
    CommandLineIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

// --- MAIN SEARCH LOGIC COMPONENT ---
function SearchContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('query') || '';

    // State
    const [query, setQuery] = useState(initialQuery);
    const [profileResults, setProfileResults] = useState<ProfileSearchResult[]>([]);
    const [mediaResults, setMediaResults] = useState<CinematicSearchResult[]>([]);
    const [isSearching, startTransition] = useTransition();
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined); // ✨ Store User ID

    // Determine Mode
    const isUserMode = query.startsWith('@');

    // ✨ 1. Fetch Current User (Client-Side)
    // We need this to hide the "Follow" button for your own profile
    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }
        };
        fetchUser();
    }, []);

    // ✨ 2. Search Effect (Debounced)
    useEffect(() => {
        const isInitialLoad = query === initialQuery && initialQuery !== '';
        const delay = isInitialLoad ? 0 : 300;

        const handler = setTimeout(() => {
            if (query.trim().length > 1) {
                startTransition(async () => {
                    if (query.startsWith('@')) {
                        // User Search
                        const cleanQuery = query.substring(1);
                        if (cleanQuery.length > 0) {
                            const profiles = await searchProfiles(cleanQuery);
                            setProfileResults(profiles);
                            setMediaResults([]);
                        }
                    } else {
                        // Cinematic Search
                        const media = await searchCinematic(query);
                        setMediaResults(media);
                        setProfileResults([]);
                    }
                });
            } else {
                // Clear Results
                setProfileResults([]);
                setMediaResults([]);
            }
        }, delay);

        return () => clearTimeout(handler);
    }, [query]); // Removed 'initialQuery' dep to avoid loops

    const hasResults = profileResults.length > 0 || mediaResults.length > 0;

    return (
        <div className="relative z-10 max-w-7xl mx-auto">

            {/* Header Section */}
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

            {/* Input Section */}
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

            {/* Results Section */}
            <div className="min-h-[400px]">
                {isSearching ? (
                    // LOADING
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <LoadingSpinner className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
                        <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">Scanning Database...</p>
                    </div>
                ) : hasResults ? (
                    // RESULTS
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* A. USER PROFILES */}
                        {profileResults.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 pb-3 mb-4 border-b-2 border-zinc-200 dark:border-zinc-800">
                                    <UserIcon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                                        User Profiles
                                    </h2>
                                    <span className="ml-auto text-xs font-mono text-zinc-400">
                                        {profileResults.length} matches
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {profileResults.map((profile) => (
                                        <UserCard
                                            key={profile.id}
                                            profile={profile} // UserCard now handles ProfileSearchResult type
                                            currentUserId={currentUserId} // ✨ Pass ID here
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* B. CINEMATIC RESULTS */}
                        {mediaResults.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 pb-3 mb-4 border-b-2 border-zinc-200 dark:border-zinc-800">
                                    <FilmIcon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                                        Cinematic Database
                                    </h2>
                                    <span className="ml-auto text-xs font-mono text-zinc-400">
                                        {mediaResults.length} matches
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {mediaResults.map((media) => (
                                        <CinematicResultCard
                                            key={`${media.media_type}-${media.id}`}
                                            media={media}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : query.length > 1 ? (
                    // NO RESULTS
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50">
                        <h3 className="text-lg font-bold uppercase tracking-widest text-zinc-400">No Data Found</h3>
                        <p className="text-xs font-mono text-zinc-500 mt-2">
                            {isUserMode ? `User "${query}" not found.` : `No media found for "${query}".`}
                        </p>
                    </div>
                ) : (
                    // IDLE
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                        <MagnifyingGlassIcon className="w-16 h-16 text-zinc-400 mb-4" />
                        <p className="text-sm font-mono uppercase tracking-widest">System Ready</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- PAGE WRAPPER ---
export default function SearchPage() {
    return (
        <main className="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 px-4 py-6 md:px-8 md:py-10 pb-24">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed"
                 style={{
                     backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                     backgroundSize: '24px 24px'
                 }}
            />

            <Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                    <LoadingSpinner />
                </div>
            }>
                <SearchContent />
            </Suspense>
        </main>
    );
}