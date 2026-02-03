import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getListDetails } from '@/lib/data/lists-data';
import { PencilSquareIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import BackButton from "@/app/ui/lists/BackButton";

export const dynamic = 'force-dynamic';

export default async function PublicListPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const list = await getListDetails(id);
    if (!list) notFound();

    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user?.id === list.user_id;

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">

            {/* 1. TOP NAV */}
            <nav className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
                <div className="max-w-4xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
                    <BackButton />
                    {isOwner && (
                        <Link
                            href={`/lists/${id}/edit`}
                            className="text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 px-3 py-1.5 rounded-md hover:opacity-90 flex items-center gap-1.5 transition-opacity"
                        >
                            <PencilSquareIcon className="w-3.5 h-3.5" />
                            Edit
                        </Link>
                    )}
                </div>
            </nav>

            {/* 2. HEADER */}
            <header className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-14 border-b border-zinc-100 dark:border-zinc-800/50">
                <div className="flex flex-col gap-6">
                    <div className="space-y-3">
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            {list.title}
                        </h1>
                        {list.description && (
                            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl font-serif">
                                {list.description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={`/profile/${list.creator?.username}`} className="block w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                            {list.creator?.profile_pic_url ? (
                                <Image
                                    src={list.creator.profile_pic_url}
                                    alt={list.creator.username || 'User'}
                                    width={40}
                                    height={40}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <UserCircleIcon className="w-full h-full text-zinc-300 dark:text-zinc-600 p-1" />
                            )}
                        </Link>
                        <div className="flex flex-col text-xs text-zinc-500">
                            <span className="block text-zinc-400">Curated by</span>
                            <Link href={`/profile/${list.creator?.username}`} className="font-medium text-zinc-900 dark:text-zinc-200 hover:underline">
                                {list.creator?.username || 'Unknown'}
                            </Link>
                        </div>
                        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-2" />
                        <div className="text-xs text-zinc-500 flex flex-col justify-center">
                            <span className="block text-zinc-400">Updated</span>
                            <span className="text-zinc-900 dark:text-zinc-200">
                                {new Date(list.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* 3. THE LIST: Compact & Formal */}
            <main className="max-w-4xl mx-auto px-4 md:px-6 pb-24 pt-6">
                <div className="flex flex-col gap-4">
                    {list.entries.map((entry, index) => {
                        if (!entry.media) return null;
                        const rank = (index + 1).toString().padStart(2, '0');

                        return (
                            <Link
                                key={entry.id}
                                href={entry.media.type === 'movie' ? `/discover/movie/${entry.media.id}` : `/discover/tv/${entry.media.id}`}
                                className="group block p-2 -mx-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                            >
                                {/* Grid: Rank (narrow) | Poster (compact) | Content */}
                                {/* Mobile: 1.5rem | 5rem | 1fr */}
                                {/* Desktop: 3rem   | 7rem | 1fr */}
                                <div className="grid grid-cols-[1.5rem_5rem_1fr] md:grid-cols-[3rem_7rem_1fr] gap-4 items-start">

                                    {/* COL 1: Rank */}
                                    <div className="pt-1 text-right font-mono text-sm md:text-base text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 transition-colors">
                                        {rank}
                                    </div>

                                    {/* COL 2: Poster */}
                                    <div className="relative aspect-[2/3] bg-zinc-100 dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-sm overflow-hidden">
                                        {entry.media.poster_url && (
                                            <Image
                                                src={entry.media.poster_url.startsWith('http') ? entry.media.poster_url : `https://image.tmdb.org/t/p/w300${entry.media.poster_url}`}
                                                alt={entry.media.title}
                                                fill
                                                sizes="(max-width: 768px) 80px, 112px"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                            />
                                        )}
                                    </div>

                                    {/* COL 3: Content */}
                                    <div className="flex flex-col min-w-0 pt-0.5">
                                        <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight group-hover:underline decoration-zinc-300 underline-offset-4 decoration-2">
                                            {entry.media.title}
                                        </h3>

                                        <div className="mt-0.5 text-xs md:text-sm font-mono text-zinc-500 dark:text-zinc-500">
                                            {entry.media.release_date ? entry.media.release_date.split('-')[0] : 'TBA'}
                                        </div>

                                        {entry.note && (
                                            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 leading-snug border-l-2 border-zinc-200 dark:border-zinc-800 pl-3 py-0.5 line-clamp-3">
                                                {entry.note}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-12 text-center">
                    <div className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto" />
                </div>
            </main>
        </div>
    );
}