import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getListDetails } from '@/lib/data/lists-data'; // Using the clean fetcher
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { ArrowLeftIcon, PencilSquareIcon, UserCircleIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

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
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-24">

            {/* HERO HEADER */}
            <div className="relative w-full h-[50vh] flex items-end">
                <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
                    {list.backdrop_url && (
                        <Image
                            src={list.backdrop_url.startsWith('http') ? list.backdrop_url : `https://image.tmdb.org/t/p/original${list.backdrop_url}`}
                            alt="Background"
                            fill
                            className="object-cover opacity-40 blur-sm scale-105"
                            priority
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 via-zinc-50/50 dark:via-zinc-950/50 to-transparent" />
                </div>

                <div className="absolute top-6 left-6 z-20">
                    <Link href="/discover" className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-bold hover:bg-white/20 transition-colors">
                        <ArrowLeftIcon className="w-4 h-4" /> Home
                    </Link>
                </div>

                {isOwner && (
                    <div className="absolute top-6 right-6 z-20">
                        <Link href={`/lists/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 rounded-full text-sm font-bold hover:bg-white transition-colors shadow-lg">
                            <PencilSquareIcon className="w-4 h-4" /> Edit List
                        </Link>
                    </div>
                )}

                <div className="relative z-10 px-6 pb-12 max-w-5xl mx-auto w-full">
                    <div className="flex items-center gap-3 mb-4">
                        {list.creator?.profile_pic_url ? (
                            <Image src={list.creator.profile_pic_url} alt={list.creator.username} width={32} height={32} className="rounded-full border border-zinc-500"/>
                        ) : (
                            <UserCircleIcon className="w-8 h-8 text-zinc-500" />
                        )}
                        <Link href={`/profile/${list.creator?.username}`} className="text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline">
                            @{list.creator?.username || 'Unknown'}
                        </Link>
                        <span className="text-zinc-400">•</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{list.entries.length} Items</span>
                    </div>

                    <h1 className={`${PlayWriteNewZealandFont.className} text-5xl md:text-7xl font-bold leading-tight mb-4 text-zinc-900 dark:text-zinc-50`}>
                        {list.title}
                    </h1>
                    {list.description && (
                        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed font-light">
                            {list.description}
                        </p>
                    )}
                </div>
            </div>

            {/* LIST ITEMS */}
            <div className="max-w-5xl mx-auto px-6 space-y-4 -mt-8 relative z-10">
                {list.entries.map((entry, index) => {
                    if (!entry.media) return null;

                    return (
                        <Link
                            key={entry.id}
                            href={entry.media.type === 'movie' ? `/discover/movie/${entry.media.id}` : `/discover/tv/${entry.media.id}`}
                            className="group block bg-white dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
                        >
                            <div className="flex items-stretch h-32 md:h-40">
                                {/* Rank */}
                                <div className="w-12 md:w-16 flex items-center justify-center bg-zinc-100 dark:bg-black/40 border-r border-zinc-200 dark:border-zinc-800">
                                    <span className={`${PlayWriteNewZealandFont.className} text-2xl md:text-4xl text-zinc-300 dark:text-zinc-700 font-bold group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors`}>
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Poster */}
                                <div className="relative w-24 md:w-28 shrink-0">
                                    {entry.media.poster_url && (
                                        <Image
                                            src={entry.media.poster_url.startsWith('http') ? entry.media.poster_url : `https://image.tmdb.org/t/p/w500${entry.media.poster_url}`}
                                            alt={entry.media.title}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>

                                {/* Content: Title + NOTE */}
                                <div className="flex-1 p-4 md:p-6 flex flex-col justify-center">
                                    <div className="flex items-baseline gap-3 mb-2">
                                        <h3 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-amber-600 transition-colors">
                                            {entry.media.title}
                                        </h3>
                                        <span className="text-sm font-mono text-zinc-500">
                                            {entry.media.release_date?.split('-')[0]}
                                        </span>
                                    </div>

                                    {entry.note ? (
                                        <div className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                                            <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                                            <p className="font-medium italic text-sm md:text-base leading-relaxed">
                                                "{entry.note}"
                                            </p>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}