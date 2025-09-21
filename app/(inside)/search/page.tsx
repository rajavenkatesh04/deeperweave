// app/(inside)/search/page.tsx

'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// ✨ 1. Import the new, correct type
import { ProfileSearchResult } from '@/lib/definitions';
import { searchProfiles } from '@/lib/actions/profile-actions';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';

// ✨ 2. Update the prop type for the card component
function UserResultCard({ profile }: { profile: ProfileSearchResult }) {
    return (
        <Link
            href={`/profile/${profile.username}`}
            className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800"
        >
            <Image
                src={profile.profile_pic_url || '/placeholder-user.jpg'}
                alt={profile.display_name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 dark:text-zinc-100 truncate">{profile.display_name}</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400 truncate">@{profile.username}</p>
            </div>
        </Link>
    );
}

// --- Main Search Page Component ---
export default function SearchPage() {
    const [query, setQuery] = useState('');
    // ✨ 3. Update the state to use the new type
    const [results, setResults] = useState<ProfileSearchResult[]>([]);
    const [isSearching, startTransition] = useTransition();

    // Debounce the search query
    useEffect(() => {
        const handler = setTimeout(() => {
            if (query.trim().length > 1) {
                startTransition(async () => {
                    const foundProfiles = await searchProfiles(query);
                    setResults(foundProfiles);
                });
            } else {
                setResults([]);
            }
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    return (
        <main className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Search</h1>
                <p className="mt-1 text-gray-600 dark:text-zinc-400">Find and discover users on the platform.</p>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by display name or username..."
                    className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-base shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
            </div>

            {/* Results Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 min-h-[300px] flex flex-col">
                {isSearching ? (
                    <div className="m-auto flex flex-col items-center gap-2">
                        <LoadingSpinner />
                        <p className="text-sm text-gray-500 dark:text-zinc-400">Searching...</p>
                    </div>
                ) : results.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
                        {results.map((profile) => (
                            <li key={profile.id}>
                                <UserResultCard profile={profile} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="m-auto text-center">
                        <h3 className="font-semibold text-gray-900 dark:text-zinc-100">
                            {query.length > 1 ? 'No users found' : 'Search for users'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                            {query.length > 1 ? `We couldn't find anyone matching "${query}".` : 'Start typing above to find users.'}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}