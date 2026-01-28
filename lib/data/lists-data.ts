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

// 1. getUserLists: For "My Dashboard" (Fetches ALL lists: Public + Private)
export const getUserLists = cache(async (userId: string): Promise<ListSummary[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('lists')
        .select(`
            id, 
            title, 
            description,
            is_public,
            updated_at,
            list_entries (
                rank,
                movies ( poster_url ),
                series ( poster_url )
            )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error || !data) return [];

    return data.map((list: any) => {
        // Flatten posters for the stack UI
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

// 2. getPublicListsByUserId: For "Public Profile" (Fetches ONLY Public lists)
export const getPublicListsByUserId = cache(async (userId: string): Promise<ListSummary[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('lists')
        .select(`
            id, 
            title, 
            description,
            is_public,
            updated_at,
            list_entries (
                rank,
                movies ( poster_url ),
                series ( poster_url )
            )
        `)
        .eq('user_id', userId)
        .eq('is_public', true) // Security: Public only
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