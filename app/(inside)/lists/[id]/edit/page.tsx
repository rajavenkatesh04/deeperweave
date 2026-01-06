import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import ListSearch from '@/app/ui/lists/ListSearch';
import ListEntryRow from '@/app/ui/lists/ListEntryRow'; // ✨ Use the new Row

export const dynamic = 'force-dynamic';

export default async function ListEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    // 1. Fetch List
    const { data: list } = await supabase.from('lists').select('*').eq('id', id).single();
    if (!list) notFound();
    if (list.user_id !== user.id) redirect(`/lists/${id}`);

    // 2. Fetch Entries
    const { data: entries } = await supabase
        .from('list_entries')
        .select('*')
        .eq('list_id', id)
        .order('rank', { ascending: true });

    const safeEntries = entries || [];

    // 3. Manual Join for Details
    const movieIds = safeEntries.filter(e => e.movie_id).map(e => e.movie_id);
    const seriesIds = safeEntries.filter(e => e.series_id).map(e => e.series_id);

    const [moviesRes, seriesRes] = await Promise.all([
        movieIds.length > 0 ? supabase.from('movies').select('tmdb_id, title, poster_url, release_date').in('tmdb_id', movieIds) : { data: [] },
        seriesIds.length > 0 ? supabase.from('series').select('tmdb_id, title, poster_url, release_date').in('tmdb_id', seriesIds) : { data: [] }
    ]);

    const movieMap = new Map(moviesRes.data?.map(m => [m.tmdb_id, m]));
    const seriesMap = new Map(seriesRes.data?.map(s => [s.tmdb_id, s]));

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
            <div className="max-w-6xl mx-auto h-[calc(100vh-3rem)] grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: The List View */}
                <div className="lg:col-span-2 flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between">
                        <div>
                            <Link href="/profile" className="text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 mb-2">
                                <ArrowLeftIcon className="w-3 h-3" /> Back
                            </Link>
                            <h1 className={`${PlayWriteNewZealandFont.className} text-2xl font-bold`}>{list.title}</h1>
                            <p className="text-sm text-zinc-500">{safeEntries.length} Items</p>
                        </div>
                        <Link href={`/lists/${id}`} className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-full">
                            View Public Page
                        </Link>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {safeEntries.map((entry, index) => {
                            const details: any = entry.movie_id ? movieMap.get(entry.movie_id) : seriesMap.get(entry.series_id);
                            if (!details) return null;

                            return (
                                <ListEntryRow
                                    key={entry.id}
                                    entry={entry}
                                    details={details}
                                    index={index}
                                    listId={id}
                                />
                            );
                        })}

                        {safeEntries.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-50 pt-20">
                                <p>List is empty.</p>
                                <p className="text-sm">Use the search bar to add items.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Search Panel */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 h-fit shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Add Items</h3>
                    <ListSearch listId={id} />
                </div>
            </div>
        </main>
    );
}