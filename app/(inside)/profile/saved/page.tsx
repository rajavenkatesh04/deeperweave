import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FilmIcon, TvIcon, UserIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import PosterCard from '@/app/ui/discover/PosterCard';

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

    // 2. Separate IDs by type
    const movieIds = savedItems.filter(i => i.item_type === 'movie').map(i => i.movie_id);
    const seriesIds = savedItems.filter(i => i.item_type === 'series' || i.item_type === 'tv').map(i => i.series_id).filter(id => id !== null);
    const personIds = savedItems.filter(i => i.item_type === 'person').map(i => i.person_id);

    // 3. Fetch Details in Parallel
    const [moviesRes, seriesRes, peopleRes] = await Promise.all([
        movieIds.length > 0 ? supabase.from('movies').select('tmdb_id, title, poster_url, release_date').in('tmdb_id', movieIds) : { data: [] },
        seriesIds.length > 0 ? supabase.from('series').select('tmdb_id, title, poster_url, release_date').in('tmdb_id', seriesIds) : { data: [] },
        // ✨ FIXED: Removed the invalid "peopleRes:" label here
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
                {/* Header Section */}
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

                {/* Grid Section - Using PosterCard */}
                <div className="flex flex-wrap gap-4 justify-start">
                    {savedItems.map((item) => {
                        let data: any = null;
                        let normalizedItem: any = null;

                        if (item.item_type === 'movie') {
                            data = movieMap.get(item.movie_id);
                            if (data) {
                                normalizedItem = {
                                    id: data.tmdb_id,
                                    title: data.title,
                                    poster_path: data.poster_url,
                                    media_type: 'movie',
                                    release_date: data.release_date
                                };
                            }
                        }
                        else if (item.item_type === 'series' || item.item_type === 'tv') {
                            data = seriesMap.get(item.series_id);
                            if (data) {
                                normalizedItem = {
                                    id: data.tmdb_id,
                                    title: data.title,
                                    poster_path: data.poster_url,
                                    media_type: 'tv',
                                    release_date: data.release_date
                                };
                            }
                        }
                        else if (item.item_type === 'person') {
                            data = personMap.get(item.person_id);
                            if (data) {
                                normalizedItem = {
                                    id: data.tmdb_id,
                                    title: data.name,
                                    poster_path: data.profile_path,
                                    media_type: 'person',
                                    release_date: ''
                                };
                            }
                        }

                        if (!normalizedItem) return null;

                        return (
                            <PosterCard
                                key={item.id}
                                item={normalizedItem}
                            />
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