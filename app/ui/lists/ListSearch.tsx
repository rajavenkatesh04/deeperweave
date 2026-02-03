'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
// ✨ FIX: Changed searchMulti to searchCinematic
import { searchCinematic } from '@/lib/actions/cinematic-actions';
import { addToList } from '@/lib/actions/list-actions';
// ✨ Ensure you have this installed or change to your preferred toast
import { toast } from 'sonner';

export default function ListSearch({ listId }: { listId: string }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (term: string) => {
        setQuery(term);
        if (term.length < 3) {
            setResults([]);
            return;
        }

        setLoading(true);
        // ✨ FIX: Use the correct function name here
        const data = await searchCinematic(term);

        // Filter only movies/tv (cinematic search might return people too)
        setResults(data.filter((i: any) => i.media_type === 'movie' || i.media_type === 'tv'));
        setLoading(false);
    };

    const handleAdd = async (item: any) => {
        const toastId = toast.loading("Adding...");
        const result = await addToList(listId, item.media_type, item.id);

        if (result?.error) {
            toast.error(result.error, { id: toastId });
        } else {
            toast.success("Added to list", { id: toastId });
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search movies & shows..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    onChange={(e) => handleSearch(e.target.value)}
                    value={query}
                />
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {results.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleAdd(item)}
                        className="flex items-center gap-3 w-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-left group"
                    >
                        <div className="relative w-10 h-14 bg-zinc-200 shrink-0 rounded-sm overflow-hidden">
                            {item.poster_path && (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                    alt={item.title || item.name}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title || item.name}</p>
                            <p className="text-xs text-zinc-500 capitalize">{item.media_type} • {item.release_date?.split('-')[0] || 'N/A'}</p>
                        </div>
                        <PlusIcon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
                    </button>
                ))}
            </div>
        </div>
    );
}