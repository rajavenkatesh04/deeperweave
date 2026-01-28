import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

// --- Types ---
export type ListSummary = {
    id: string;
    title: string;
    description: string | null;
    is_public: boolean;
    item_count: number;
    updated_at: string;
    preview_items: {
        poster_url: string | null;
    }[];
};

export type ListDetailEntry = {
    id: string;
    rank: number;
    note: string | null;
    media: {
        id: number; // The TMDB ID
        title: string;
        release_date: string | null;
        poster_url: string | null;
        backdrop_url: string | null;
        type: 'movie' | 'series';
    } | null;
};

export type ListDetails = {
    id: string;
    title: string;
    description: string | null;
    user_id: string;
    updated_at: string;
    creator: {
        username: string;
        display_name: string | null;
        profile_pic_url: string | null;
    };
    entries: ListDetailEntry[];
    backdrop_url: string | null;
};

// 1. getUserLists: For "My Dashboard" (All lists)
export const getUserLists = cache(async (userId: string): Promise<ListSummary[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('lists')
        .select(`
            id, title, description, is_public, updated_at,
            list_entries ( rank, movies ( poster_url ), series ( poster_url ) )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error || !data) return [];

    return data.map((list: any) => {
        const allItems = list.list_entries.map((entry: any) => ({
            poster_url: entry.movies?.poster_url || entry.series?.poster_url || null
        })).filter((i: any) => i.poster_url);

        return {
            id: list.id,
            title: list.title,
            description: list.description,
            is_public: list.is_public,
            item_count: list.list_entries.length,
            updated_at: list.updated_at,
            preview_items: allItems.slice(0, 3)
        };
    });
});

// 2. getPublicListsByUserId: For "Public Profile" (Public only)
export const getPublicListsByUserId = cache(async (userId: string): Promise<ListSummary[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('lists')
        .select(`
            id, title, description, is_public, updated_at,
            list_entries ( rank, movies ( poster_url ), series ( poster_url ) )
        `)
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('updated_at', { ascending: false });

    if (error || !data) return [];

    return data.map((list: any) => {
        const allItems = list.list_entries.map((entry: any) => ({
            poster_url: entry.movies?.poster_url || entry.series?.poster_url || null
        })).filter((i: any) => i.poster_url);

        return {
            id: list.id,
            title: list.title,
            description: list.description,
            is_public: list.is_public,
            item_count: list.list_entries.length,
            updated_at: list.updated_at,
            preview_items: allItems.slice(0, 3)
        };
    });
});

// 3. getListDetails: For "Single List View"
export const getListDetails = cache(async (listId: string): Promise<ListDetails | null> => {
    const supabase = await createClient();

    // Fetch List Metadata + Creator
    const { data: list } = await supabase
        .from('lists')
        .select('*, profiles (username, display_name, profile_pic_url)')
        .eq('id', listId)
        .single();

    if (!list) return null;

    // Fetch Entries
    const { data: entries } = await supabase
        .from('list_entries')
        .select('*')
        .eq('list_id', listId)
        .order('rank', { ascending: true });

    if (!entries || entries.length === 0) {
        return {
            id: list.id,
            title: list.title,
            description: list.description,
            user_id: list.user_id,
            updated_at: list.updated_at,
            creator: list.profiles as any,
            entries: [],
            backdrop_url: null
        };
    }

    // Batch Fetch Media Details
    const movieIds = entries.filter(e => e.movie_id).map(e => e.movie_id);
    const seriesIds = entries.filter(e => e.series_id).map(e => e.series_id);

    const [moviesRes, seriesRes] = await Promise.all([
        movieIds.length > 0 ? supabase.from('movies').select('tmdb_id, title, poster_url, release_date, backdrop_url').in('tmdb_id', movieIds) : { data: [] },
        seriesIds.length > 0 ? supabase.from('series').select('tmdb_id, title, poster_url, release_date, backdrop_url').in('tmdb_id', seriesIds) : { data: [] }
    ]);

    const movieMap = new Map(moviesRes.data?.map(m => [m.tmdb_id, m]));
    const seriesMap = new Map(seriesRes.data?.map(s => [s.tmdb_id, s]));

    // Transform
    const processedEntries = entries.map(entry => {
        let mediaDetails = null;
        let type: 'movie' | 'series' = 'movie';

        if (entry.movie_id) {
            const m = movieMap.get(entry.movie_id);
            if (m) { mediaDetails = { ...m, id: m.tmdb_id, type: 'movie' }; }
        } else if (entry.series_id) {
            const s = seriesMap.get(entry.series_id);
            if (s) { mediaDetails = { ...s, id: s.tmdb_id, type: 'series' }; type = 'series'; }
        }

        if(!mediaDetails) return null;

        return {
            id: entry.id,
            rank: entry.rank,
            note: entry.note,
            media: mediaDetails
        };
    }).filter(Boolean) as ListDetailEntry[];

    return {
        id: list.id,
        title: list.title,
        description: list.description,
        user_id: list.user_id,
        updated_at: list.updated_at,
        creator: list.profiles as any,
        entries: processedEntries,
        backdrop_url: processedEntries[0]?.media?.backdrop_url || null
    };
});