import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { ArrowLeftIcon, PencilSquareIcon, UserCircleIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default async function PublicListPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch List
    const { data: list } = await supabase
        .from('lists')
        .select('*, profiles(username, display_name, profile_pic_url)')
        .eq('id', id)
        .single();

    if (!list) notFound();

    // 2. Fetch Entries
    const { data: entries } = await supabase
        .from('list_entries')
        .select('*')
        .eq('list_id', id)
        .order('rank', { ascending: true });

    // 3. Fetch Details
    const movieIds = entries?.filter(e => e.movie_id).map(e => e.movie_id) || [];
    const seriesIds = entries?.filter(e => e.series_id).map(e => e.series_id) || [];

    const [moviesRes, seriesRes] = await Promise.all([
        movieIds.length > 0 ? supabase.from('movies').select('tmdb_id, title, poster_url, release_date, backdrop_url').in('tmdb_id', movieIds) : { data: [] },
        seriesIds.length > 0 ? supabase.from('series').select('tmdb_id, title, poster_url, release_date, backdrop_url').in('tmdb_id', seriesIds) : { data: [] }
    ]);

    const movieMap = new Map(moviesRes.data?.map(m => [m.tmdb_id, m]));
    const seriesMap = new Map(seriesRes.data?.map(s => [s.tmdb_id, s]));

    const isOwner = user?.id === list.user_id;
    const creator = list.profiles as any;

    // Header Backdrop logic
    const firstItem = entries?.[0];
    let headerBackdrop = null;
    if (firstItem) {
        const details = firstItem.movie_id ? movieMap.get(firstItem.movie_id) : seriesMap.get(firstItem.series_id);
        if (details?.backdrop_url) headerBackdrop = details.backdrop_url;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-24">

            {/* HERO HEADER */}
            <div className="relative w-full h-[50vh] flex items-end">
                <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
                    {headerBackdrop && (
                        <Image
                            src={headerBackdrop.startsWith('http') ? headerBackdrop : `https://image.tmdb.org/t/p/original${headerBackdrop}`}
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
                        {creator?.profile_pic_url ? (
                            <Image src={creator.profile_pic_url} alt={creator.username} width={32} height={32} className="rounded-full border border-zinc-500"/>
                        ) : (
                            <UserCircleIcon className="w-8 h-8 text-zinc-500" />
                        )}
                        <Link href={`/profile/${creator?.username}`} className="text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline">
                            @{creator?.username || 'Unknown'}
                        </Link>
                        <span className="text-zinc-400">•</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{entries?.length || 0} Items</span>
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
                {entries?.map((entry, index) => {
                    const details: any = entry.movie_id ? movieMap.get(entry.movie_id) : seriesMap.get(entry.series_id);
                    if (!details) return null;

                    return (
                        <Link
                            key={entry.id}
                            href={entry.movie_id ? `/discover/movie/${entry.movie_id}` : `/discover/tv/${entry.series_id}`}
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
                                    {details.poster_url && (
                                        <Image
                                            src={details.poster_url.startsWith('http') ? details.poster_url : `https://image.tmdb.org/t/p/w500${details.poster_url}`}
                                            alt={details.title}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>

                                {/* Content: Title + NOTE */}
                                <div className="flex-1 p-4 md:p-6 flex flex-col justify-center">
                                    <div className="flex items-baseline gap-3 mb-2">
                                        <h3 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-amber-600 transition-colors">
                                            {details.title}
                                        </h3>
                                        <span className="text-sm font-mono text-zinc-500">
                                            {details.release_date?.split('-')[0]}
                                        </span>
                                    </div>

                                    {/* ✨ IF NOTE EXISTS: Show highlighted note. ELSE: Empty */}
                                    {entry.note ? (
                                        <div className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                                            <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                                            <p className="font-medium italic text-sm md:text-base leading-relaxed">
                                                "{entry.note}"
                                            </p>
                                        </div>
                                    ) : (
                                        // Optional: Show nothing, or a very faint 'No overview'
                                        <div className="hidden" />
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}