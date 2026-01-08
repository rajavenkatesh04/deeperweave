import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FilmIcon, TvIcon, UserIcon, BookmarkIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
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

    // 5. Count by type
    const movieCount = savedItems.filter(i => i.item_type === 'movie').length;
    const seriesCount = savedItems.filter(i => i.item_type === 'series').length;
    const personCount = savedItems.filter(i => i.item_type === 'person').length;

    return (
        <main className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-6 md:px-8 md:py-10 pb-24">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed"
                 style={{
                     backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                     backgroundSize: '24px 24px'
                 }}
            />

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className={`${PlayWriteNewZealandFont.className} text-3xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-2`}>
                                Saved Library
                            </h1>
                            <p className="text-xs md:text-sm text-zinc-500 font-mono uppercase tracking-wider">
                                Private Collection // {savedItems.length} Total Items
                            </p>
                        </div>
                        <div className="hidden md:block p-4 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <ArchiveBoxIcon className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        {movieCount > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
                                <FilmIcon className="w-4 h-4 text-zinc-500" />
                                <span className="text-xs font-mono text-zinc-500 uppercase">Movies</span>
                                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{movieCount}</span>
                            </div>
                        )}
                        {seriesCount > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
                                <TvIcon className="w-4 h-4 text-zinc-500" />
                                <span className="text-xs font-mono text-zinc-500 uppercase">TV Shows</span>
                                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{seriesCount}</span>
                            </div>
                        )}
                        {personCount > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
                                <UserIcon className="w-4 h-4 text-zinc-500" />
                                <span className="text-xs font-mono text-zinc-500 uppercase">People</span>
                                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{personCount}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* The Grid - Larger Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {savedItems.map((item) => {
                        let details: any = null;
                        let href = '#';
                        let icon = null;
                        let subtitle = '';
                        let badgeColor = '';

                        if (item.item_type === 'movie') {
                            details = movieMap.get(item.movie_id);
                            href = `/discover/movie/${item.movie_id}`;
                            icon = <FilmIcon className="w-3 h-3" />;
                            subtitle = 'FILM';
                            badgeColor = 'bg-blue-500/90';
                        } else if (item.item_type === 'series') {
                            details = seriesMap.get(item.series_id);
                            href = `/discover/tv/${item.series_id}`;
                            icon = <TvIcon className="w-3 h-3" />;
                            subtitle = 'TV';
                            badgeColor = 'bg-purple-500/90';
                        } else if (item.item_type === 'person') {
                            details = personMap.get(item.person_id);
                            href = `/discover/actor/${item.person_id}`;
                            icon = <UserIcon className="w-3 h-3" />;
                            subtitle = 'STAR';
                            badgeColor = 'bg-amber-500/90';
                        }

                        // Skip if details are missing
                        if (!details) return null;

                        const title = details.title || details.name;
                        const image = details.poster_url || (details.profile_path ? `https://image.tmdb.org/t/p/w500${details.profile_path}` : null);

                        return (
                            <Link
                                key={item.id}
                                href={href}
                                className="group block bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-all hover:shadow-lg overflow-hidden"
                            >
                                <div className="relative w-full aspect-[2/3] bg-zinc-100 dark:bg-zinc-900">
                                    {image ? (
                                        <Image
                                            src={image.startsWith('http') ? image : `https://image.tmdb.org/t/p/w500${image}`}
                                            alt={title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                            {icon && <div className="w-12 h-12">{icon}</div>}
                                        </div>
                                    )}

                                    {/* Type Badge */}
                                    <div className="absolute top-2 left-2">
                                        <div className={`${badgeColor} px-2 py-1 flex items-center gap-1.5`}>
                                            <div className="text-white w-3 h-3">{icon}</div>
                                            <span className="text-white text-[9px] font-bold uppercase tracking-wider">
                                                {subtitle}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bookmark Badge */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-white/90 dark:bg-black/90 p-1.5 border border-zinc-200 dark:border-zinc-800">
                                            <BookmarkIcon className="w-3 h-3 text-zinc-900 dark:text-zinc-100 fill-zinc-900 dark:fill-zinc-100" />
                                        </div>
                                    </div>
                                </div>

                                {/* Title Section */}
                                <div className="p-3 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800">
                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2 group-hover:underline decoration-1 underline-offset-2">
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
        <main className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col items-center justify-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                 style={{
                     backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                     backgroundSize: '24px 24px'
                 }}
            />

            <div className="relative z-10 flex flex-col items-center">
                <div className="p-8 bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700 mb-6">
                    <ArchiveBoxIcon className="w-16 h-16 text-zinc-300 dark:text-zinc-700" />
                </div>

                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Library Empty
                </h2>
                <p className="text-sm font-mono text-zinc-500 uppercase tracking-wider mb-6">
                    No saved items yet
                </p>

                <Link
                    href="/discover"
                    className="group relative px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm uppercase tracking-wider overflow-hidden transition-all hover:shadow-lg"
                >
                    <span className="relative z-10">Start Exploring</span>
                    <div className="absolute inset-0 bg-zinc-800 dark:bg-zinc-200 translate-y-full group-hover:translate-y-0 transition-transform" />
                </Link>
            </div>
        </main>
    );
}