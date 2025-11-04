// app/(inside)/search/page.tsx

'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProfileSearchResult } from '@/lib/definitions';
import { searchProfiles } from '@/lib/actions/profile-actions';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';

function UserResultCard({ profile }: { profile: ProfileSearchResult }) {
    return (
        <Link
            href={`/profile/${profile.username}`}
            className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900"
        >
            <Image
                src={profile.profile_pic_url || '/placeholder-user.jpg'}
                alt={profile.display_name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-zinc-100 truncate">
                    {profile.display_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-zinc-400 truncate">
                    <span className={`text-red-400`}>@</span>{profile.username}
                </p>
            </div>
        </Link>
    );
}

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ProfileSearchResult[]>([]);
    const [isSearching, startTransition] = useTransition();

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
        <main className="p-6 max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">Search</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">Find users by name or username</p>
            </div>

            {/* Search Input */}
            <div className="relative mb-6">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-2.5 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
            </div>

            {/* Results */}
            <div>
                {isSearching ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : results.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        {results.map((profile) => (
                            <UserResultCard key={profile.id} profile={profile} />
                        ))}
                    </div>
                ) : query.length > 1 ? (
                    <div className="text-center py-12">
                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                            <p>No results for &ldquo;{query}&rdquo;</p>
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                            Start typing to search
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}