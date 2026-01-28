import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getListDetails } from '@/lib/data/lists-data';
import { ArrowLeftIcon, PencilSquareIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default async function PublicListPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Efficient Fetch
    const list = await getListDetails(id);
    if (!list) notFound();

    // 2. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user?.id === list.user_id;

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

            {/* HEADER SECTION: Clean, contained, editorial */}
            <div className="relative border-b border-zinc-200 dark:border-zinc-800">
                {/* Subtle Background Blur */}
                <div className="absolute inset-0 overflow-hidden h-full z-0">
                    {list.backdrop_url && (
                        <Image
                            src={list.backdrop_url.startsWith('http') ? list.backdrop_url : `https://image.tmdb.org/t/p/original${list.backdrop_url}`}
                            alt="Background"
                            fill
                            className="object-cover opacity-10 dark:opacity-20 blur-2xl"
                            priority
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/95 to-white dark:from-zinc-950/80 dark:via-zinc-950/95 dark:to-zinc-950" />
                </div>

                {/* Header Content */}
                <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
                    <div className="flex justify-between items-start mb-8">
                        <Link href="/discover" className="group flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Discover
                        </Link>

                        {isOwner && (
                            <Link href={`/lists/${id}/edit`} className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded text-sm font-medium hover:opacity-90 transition-opacity">
                                <PencilSquareIcon className="w-4 h-4" />
                                Edit
                            </Link>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                            <Link href={`/profile/${list.creator?.username}`} className="flex items-center gap-2 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
                                {list.creator?.profile_pic_url ? (
                                    <Image src={list.creator.profile_pic_url} alt={list.creator.username} width={24} height={24} className="rounded-full"/>
                                ) : (
                                    <UserCircleIcon className="w-6 h-6" />
                                )}
                                <span className="font-semibold">{list.creator?.username || 'Unknown'}</span>
                            </Link>
                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                            <span>{new Date(list.updated_at || list.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                            <span className="font-mono">{list.entries.length} Items</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            {list.title}
                        </h1>

                        {list.description && (
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed border-l-2 border-zinc-200 dark:border-zinc-800 pl-4 italic">
                                {list.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* LIST SECTION: Structured, Index-style */}
            <div className="max-w-4xl mx-auto px-6 pb-24">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {list.entries.map((entry, index) => {
                        if (!entry.media) return null;

                        const rank = (index + 1).toString().padStart(2, '0');

                        return (
                            <Link
                                key={entry.id}
                                href={entry.media.type === 'movie' ? `/discover/movie/${entry.media.id}` : `/discover/tv/${entry.media.id}`}
                                className="group block py-8 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 -mx-6 px-6 transition-colors"
                            >
                                <div className="flex gap-6 md:gap-8 items-start">
                                    {/* 1. Rank & Poster */}
                                    <div className="flex-shrink-0 flex gap-4">
                                        <div className="hidden md:block w-8 pt-1 text-right font-mono text-zinc-400 dark:text-zinc-600 text-sm">
                                            {rank}
                                        </div>
                                        <div className="relative w-20 md:w-24 aspect-[2/3] bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800">
                                            {entry.media.poster_url && (
                                                <Image
                                                    src={entry.media.poster_url.startsWith('http') ? entry.media.poster_url : `https://image.tmdb.org/t/p/w500${entry.media.poster_url}`}
                                                    alt={entry.media.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* 2. Content */}
                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-3">
                                            <div className="flex items-baseline gap-3">
                                                {/* Mobile Rank */}
                                                <span className="md:hidden font-mono text-xs text-zinc-400">{rank}</span>
                                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline decoration-zinc-400 underline-offset-4 decoration-1">
                                                    {entry.media.title}
                                                </h3>
                                            </div>
                                            <span className="text-sm text-zinc-500">
                                                ({entry.media.release_date?.split('-')[0]})
                                            </span>
                                        </div>

                                        {/* Editorial Note */}
                                        {entry.note && (
                                            <div className="mt-3 pl-4 border-l-2 border-amber-500/50 dark:border-amber-500/30">
                                                <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                                    {entry.note}
                                                </p>
                                            </div>
                                        )}

                                        {!entry.note && (
                                            <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-600 line-clamp-2">
                                                {entry.media.release_date}
                                            </p>
                                        )}
                                    </div>

                                    {/* Arrow for indication */}
                                    <div className="hidden md:block self-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
                                        <ArrowLeftIcon className="w-5 h-5 text-zinc-400 rotate-180" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Footer / End of List indicator */}
                <div className="mt-12 pt-12 border-t border-zinc-200 dark:border-zinc-800 text-center">
                    <div className="inline-block w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                </div>
            </div>
        </div>
    );
}