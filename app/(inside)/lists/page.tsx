import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import { getUserLists, ListSummary } from '@/lib/data/lists-data';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import {
    PlusIcon,
    QueueListIcon,
    ChevronRightIcon,
    FolderIcon
} from '@heroicons/react/24/outline';
import { redirect } from 'next/navigation';

// --- Component: Empty State ---
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <QueueListIcon className="w-12 h-12 text-zinc-300 mb-4" strokeWidth={1} />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No lists yet</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Create your first list to start organizing your movies and shows.
            </p>
        </div>
    );
}

// --- Component: List Row ---
function ListRow({ list }: { list: ListSummary }) {
    return (
        <Link
            href={`/lists/${list.id}/edit`}
            className="group flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-200"
        >
            <div className="flex items-center gap-4">
                {/* Preview Stack or Folder Icon */}
                <div className="relative w-12 h-12 flex-shrink-0">
                    {list.preview_items && list.preview_items.length > 0 ? (
                        // Show a little stack of posters if available
                        <div className="relative w-full h-full">
                            {list.preview_items.slice(0, 3).map((item, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 left-0 w-8 h-12 rounded-sm overflow-hidden border border-white dark:border-zinc-900 shadow-sm bg-zinc-200 dark:bg-zinc-800"
                                    style={{
                                        transform: `translateX(${i * 6}px) translateY(${i * 2}px)`,
                                        zIndex: 3 - i
                                    }}
                                >
                                    {item.poster_url && (
                                        <Image
                                            src={item.poster_url.startsWith('http') ? item.poster_url : `https://image.tmdb.org/t/p/w92${item.poster_url}`}
                                            alt=""
                                            fill
                                            className="object-cover"
                                            sizes="32px"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Fallback Folder Icon
                        <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                            <FolderIcon className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                    )}
                </div>

                {/* Title & Info */}
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tracking-wide">
                        {list.title}
                    </span>
                    <span className="text-xs text-zinc-500">
                        {list.item_count} items • {list.is_public ? 'Public' : 'Private'}
                    </span>
                </div>
            </div>

            <ChevronRightIcon className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
        </Link>
    );
}

// --- Main Page ---
export default async function ListsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    // Fetch real data
    const lists = await getUserLists(user.id);

    return (
        <main className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 pb-20">
            <header className="w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 py-4 px-6 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <h1 className={`${PlayWriteNewZealandFont.className} text-xl md:text-2xl text-zinc-900 dark:text-zinc-100`}>
                        Your Lists
                    </h1>

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
                <section className="border-y sm:border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                    {lists.length > 0 ? (
                        lists.map((list) => (
                            <ListRow key={list.id} list={list} />
                        ))
                    ) : (
                        <EmptyState />
                    )}
                </section>
            </div>
        </main>
    );
}