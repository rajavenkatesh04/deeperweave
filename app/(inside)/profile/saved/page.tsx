import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FilmIcon, TvIcon, UserIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

export const dynamic = 'force-dynamic';

export default async function SavedPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    // 1. Fetch saved items
    const { data: savedItems } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (!savedItems || savedItems.length === 0) {
        return <EmptyState />;
    }

    // 2. Separate IDs
    const movieIds = savedItems.filter(i => i.item_type === 'movie').map(i => i.movie_id);
    const seriesIds = savedItems.filter(i => i.item_type === 'series' || i.item_type === 'tv').map(i => i.series_id).filter(id => id !== null);
    const personIds = savedItems.filter(i => i.item_type === 'person').map(i => i.person_id);

    // 3. Fetch Details (Added 'release_date' to selection)
    const [moviesRes, seriesRes, peopleRes] = await Promise.all([
        movieIds.length > 0 ? supabase.from('movies').select('tmdb_id, title, poster_url, release_date').in('tmdb_id', movieIds) : { data: [] },
        seriesIds.length > 0 ? supabase.from('series').select('tmdb_id, title, poster_url, release_date').in('tmdb_id', seriesIds) : { data: [] },
        personIds.length > 0 ? supabase.from('people').select('tmdb_id, name, profile_path').in('tmdb_id', personIds) : { data: [] }
    ]);

    // 4. Create lookup maps
    const movieMap = new Map(moviesRes.data?.map(m => [m.tmdb_id, m]));
    const seriesMap = new Map(seriesRes.data?.map(s => [s.tmdb_id, s]));
    // @ts-ignore
    const personMap = new Map(peopleRes.data?.map(p => [p.tmdb_id, p]));

    // 5. Counts
    const movieCount = movieIds.length;
    const seriesCount = seriesIds.length;
    const personCount = personIds.length;

    return (
        <main className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-6 md:px-8 md:py-10 pb-24">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed"
                 style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}
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

                    <div className="flex flex-wrap gap-3 mt-6">
                        {movieCount > 0 && <StatBadge icon={<FilmIcon className="w-4 h-4"/>} label="Movies" count={movieCount} />}
                        {seriesCount > 0 && <StatBadge icon={<TvIcon className="w-4 h-4"/>} label="TV Shows" count={seriesCount} />}
                        {personCount > 0 && <StatBadge icon={<UserIcon className="w-4 h-4"/>} label="People" count={personCount} />}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {savedItems.map((item) => {
                        let details: any = null;
                        let isPerson = false;
                        let isMovie = false;
                        let href = '#';
                        let tmdbId = 0;

                        if (item.item_type === 'movie') {
                            details = movieMap.get(item.movie_id);
                            isMovie = true;
                            href = `/discover/movie/${item.movie_id}`;
                            tmdbId = item.movie_id || 0;
                        }
                        else if (item.item_type === 'series' || item.item_type === 'tv') {
                            details = seriesMap.get(item.series_id);
                            href = `/discover/tv/${item.series_id}`;
                            tmdbId = item.series_id || 0;
                        }
                        else if (item.item_type === 'person') {
                            details = personMap.get(item.person_id);
                            isPerson = true;
                            href = `/discover/actor/${item.person_id}`;
                            tmdbId = Number(item.person_id) || 0;
                        }

                        if (!details) return null;

                        const title = details.title || details.name;
                        const rawImage = details.poster_url || details.profile_path;
                        const image = rawImage ? (rawImage.startsWith('http') ? rawImage : `https://image.tmdb.org/t/p/w500${rawImage}`) : null;

                        // Subtitle Logic
                        let subtitle = 'N/A';
                        if (isPerson) {
                            subtitle = 'Star';
                        } else if (details.release_date) {
                            subtitle = details.release_date.split('-')[0];
                        }

                        // Badge Logic
                        let badgeLabel = 'TV';
                        let badgeColorClass = 'bg-zinc-900/90 dark:bg-white/90 text-white dark:text-black';

                        if (isMovie) badgeLabel = 'FILM';
                        else if (isPerson) {
                            badgeLabel = 'STAR';
                            badgeColorClass = 'bg-amber-500/90 text-black border-amber-400/20';
                        }

                        return (
                            <div key={item.id} className="group relative w-full h-full">
                                <Link href={href} className="block w-full h-full">

                                    {/* --- POSTER CONTAINER --- */}
                                    <div className="relative aspect-[2/3] w-full rounded-sm overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:border-zinc-400 dark:group-hover:border-zinc-100">

                                        {image ? (
                                            <Image
                                                src={image}
                                                alt={title}
                                                fill
                                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:saturate-100 grayscale-[0.1] group-hover:grayscale-0"
                                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-100 dark:bg-zinc-900">
                                                <span className="text-[10px] uppercase font-bold tracking-widest">No Image</span>
                                            </div>
                                        )}

                                        {/* Badge */}
                                        <div className="absolute top-0 left-0 p-2 z-10">
                                            <div className={`px-1.5 py-0.5 backdrop-blur-sm text-[9px] font-black uppercase tracking-wider shadow-sm border border-white/10 dark:border-black/10 ${badgeColorClass}`}>
                                                {badgeLabel}
                                            </div>
                                        </div>

                                        {/* Inner Border & Shine */}
                                        <div className="absolute inset-0 border border-black/5 dark:border-white/5 pointer-events-none rounded-sm group-hover:opacity-0 transition-opacity" />
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-tr from-transparent via-white to-transparent pointer-events-none transition-opacity duration-500" />
                                    </div>

                                    {/* --- INFO SECTION --- */}
                                    <div className="mt-4 px-1 space-y-1 transition-opacity duration-300 opacity-80 group-hover:opacity-100">
                                        <h3 className="text-base font-bold leading-tight text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:underline decoration-1 underline-offset-4">
                                            {title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                                                {subtitle}
                                            </span>

                                            {!isPerson && (
                                                <>
                                                    <span className="h-px w-3 bg-zinc-300 dark:bg-zinc-700" />
                                                    <span className="text-[10px] font-mono text-zinc-400 uppercase">
                                                        TMDB-{tmdbId}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}

function StatBadge({ icon, label, count }: { icon: any, label: string, count: number }) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-500">{icon}</span>
            <span className="text-xs font-mono text-zinc-500 uppercase">{label}</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{count}</span>
        </div>
    );
}

function EmptyState() {
    return (
        <main className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col items-center justify-center">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative z-10 flex flex-col items-center">
                <div className="p-8 bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700 mb-6">
                    <ArchiveBoxIcon className="w-16 h-16 text-zinc-300 dark:text-zinc-700" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Library Empty</h2>
                <p className="text-sm font-mono text-zinc-500 uppercase tracking-wider mb-6">No saved items yet</p>
                <Link href="/discover" className="group relative px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm uppercase tracking-wider overflow-hidden transition-all hover:shadow-lg">
                    <span className="relative z-10">Start Exploring</span>
                    <div className="absolute inset-0 bg-zinc-800 dark:bg-zinc-200 translate-y-full group-hover:translate-y-0 transition-transform" />
                </Link>
            </div>
        </main>
    );
}