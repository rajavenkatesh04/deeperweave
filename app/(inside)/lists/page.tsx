import Link from 'next/link';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import {
    PlusIcon,
    QueueListIcon,
    ChevronRightIcon,
    FolderIcon
} from '@heroicons/react/24/outline';

// --- Types ---
type ListSummary = {
    id: string;
    name: string;
    itemCount: number;
    updatedAt: string;
};

// --- Mock Data Fetcher (Replace with DB Call) ---
async function getUserLists(): Promise<ListSummary[]> {
    // Simulate DB delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return dummy data
    return [
        { id: '1', name: 'Weekend Watchlist', itemCount: 4, updatedAt: '2024-01-20' },
        { id: '2', name: 'Horror Classics', itemCount: 12, updatedAt: '2023-12-15' },
        { id: '3', name: 'Ghibli Favorites', itemCount: 8, updatedAt: '2023-11-01' },
    ];
}

// --- Component: List Row ---
function ListRow({ list }: { list: ListSummary }) {
    return (
        <Link
            href={`/lists/${list.id}`}
            className="group flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-200"
        >
            <div className="flex items-center gap-4">
                {/* Sharp Icon Container */}
                <div className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                    <FolderIcon className="w-5 h-5" strokeWidth={1.5} />
                </div>

                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tracking-wide">
                    {list.name}
                </span>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-zinc-400">
                    {list.itemCount} items
                </span>
                <ChevronRightIcon className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
            </div>
        </Link>
    );
}

// --- Main Page ---
export default async function ListsPage() {
    const lists = await getUserLists();

    return (
        <main className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 pb-20">

            {/* Ultra-Compact Header with Action */}
            <header className="w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 py-4 px-6 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <h1 className={`${PlayWriteNewZealandFont.className} text-xl md:text-2xl text-zinc-900 dark:text-zinc-100`}>
                        Your Lists
                    </h1>

                    {/* Sharp Action Button */}
                    <Link
                        href="/lists/create"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>New List</span>
                    </Link>
                </div>
            </header>

            <div className="max-w-3xl mx-auto pt-8 px-0 sm:px-6">

                {/* LISTS CONTAINER */}
                <section className="border-y sm:border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">

                    {lists.length > 0 ? (
                        lists.map((list) => (
                            <ListRow key={list.id} list={list} />
                        ))
                    ) : (
                        // Empty State
                        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                            <QueueListIcon className="w-12 h-12 text-zinc-300 mb-4" strokeWidth={1} />
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No lists yet</h3>
                            <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                                Create your first list to start organizing your movies and shows.
                            </p>
                        </div>
                    )}

                </section>
            </div>
        </main>
    );
}