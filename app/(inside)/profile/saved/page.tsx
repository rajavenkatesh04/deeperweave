import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FilmIcon, TvIcon, UserIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

export const dynamic = 'force-dynamic';

export default async function SavedPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    // 1. Fetch the "Bookmarks" (IDs only)
    const { data: savedItems } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (!savedItems || savedItems.length === 0) {
        return <EmptyState />;
    }

    // 2. Separate IDs by type
    const movieIds = savedItems.filter(i => i.item_type === 'movie').map(i => i.movie_id);
    const seriesIds = savedItems.filter(i => i.item_type === 'series').map(i => i.series_id);
    const personIds = savedItems.filter(i => i.item_type === 'person').map(i => i.person_id);

    // 3. Fetch Details in Parallel (The "Manual Join")
    const [moviesRes, seriesRes, peopleRes] = await Promise.all([
        movieIds.length > 0 ? supabase.from('movies').select('tmdb_id, title, poster_url').in('tmdb_id', movieIds) : { data: [] },
        seriesIds.length > 0 ? supabase.from('series').select('tmdb_id, title, poster_url').in('tmdb_id', seriesIds) : { data: [] },
        personIds.length > 0 ? supabase.from('people').select('tmdb_id, name, profile_path').in('tmdb_id', personIds) : { data: [] }
    ]);

    // 4. Create lookup maps for easy access
    const movieMap = new Map(moviesRes.data?.map(m => [m.tmdb_id, m]));
    const seriesMap = new Map(seriesRes.data?.map(s => [s.tmdb_id, s]));
    const personMap = new Map(peopleRes.data?.map(p => [p.tmdb_id, p]));

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 pb-24">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-end justify-between mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                    <div>
                        <h1 className={`${PlayWriteNewZealandFont.className} text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2`}>
                            Saved
                        </h1>
                        <p className="text-sm text-zinc-500 font-mono uppercase tracking-wider">
                            Private Library // {savedItems.length} Items
                        </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <BookmarkIcon className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
                    </div>
                </div>

                {/* The Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {savedItems.map((item) => {
                        let details: any = null;
                        let href = '#';
                        let icon = null;
                        let subtitle = '';

                        if (item.item_type === 'movie') {
                            details = movieMap.get(item.movie_id);
                            href = `/discover/movie/${item.movie_id}`;
                            icon = <FilmIcon className="w-3 h-3" />;
                            subtitle = 'Movie';
                        } else if (item.item_type === 'series') {
                            details = seriesMap.get(item.series_id);
                            href = `/discover/tv/${item.series_id}`;
                            icon = <TvIcon className="w-3 h-3" />;
                            subtitle = 'TV Series';
                        } else if (item.item_type === 'person') {
                            details = personMap.get(item.person_id);
                            href = `/discover/actor/${item.person_id}`;
                            icon = <UserIcon className="w-3 h-3" />;
                            subtitle = 'Person';
                        }

                        // Skip if details are missing (e.g. cache failed but save succeeded)
                        if (!details) return null;

                        const title = details.title || details.name;
                        const image = details.poster_url || (details.profile_path ? `https://image.tmdb.org/t/p/w500${details.profile_path}` : null);

                        return (
                            <Link key={item.id} href={href} className="group relative block bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 aspect-[2/3] overflow-hidden rounded-sm hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors shadow-sm hover:shadow-md">
                                {image ? (
                                    <Image
                                        src={image.startsWith('http') ? image : `https://image.tmdb.org/t/p/w500${image}`}
                                        alt={title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-400">
                                        <span className="text-xs font-mono">No Image</span>
                                    </div>
                                )}

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 p-3 w-full">
                                    <div className="flex items-center gap-1.5 text-zinc-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                                        {icon}
                                        {subtitle}
                                    </div>
                                    <p className="text-white text-sm font-bold leading-tight line-clamp-2">
                                        {title}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}

function EmptyState() {
    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col items-center justify-center">
            <BookmarkIcon className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-lg font-medium text-zinc-500">Your vault is empty.</p>
            <Link href="/discover" className="mt-4 px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-bold text-sm">
                Go Explore
            </Link>
        </main>
    );
}