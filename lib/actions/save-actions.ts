'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { getMovieDetails, getSeriesDetails, getPersonDetails } from '@/lib/actions/cinematic-actions';
import { SaveableItemType } from '@/lib/definitions';

export async function toggleSaveItem(
    itemType: SaveableItemType | 'tv', // Allow 'tv' as input
    itemId: string | number,
    path: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    // ✨ FIX: Normalize 'tv' -> 'series' immediately
    const normalizedType = itemType === 'tv' ? 'series' : itemType;
    const numericId = Number(itemId);

    // 1. Ensure the item exists in our local cache (movies/series/people tables)
    try {
        if (normalizedType === 'movie') await getMovieDetails(numericId);
        else if (normalizedType === 'series') await getSeriesDetails(numericId);
        else if (normalizedType === 'person') await getPersonDetails(numericId);
    } catch (e) {
        console.error("Error ensuring item details exist:", e);
    }

    const queryPayload: any = {
        user_id: user.id,
        item_type: normalizedType, // Store as 'series' in DB
    };

    // 2. Set the correct foreign key based on normalized type
    if (normalizedType === 'movie') queryPayload.movie_id = numericId;
    else if (normalizedType === 'series') queryPayload.series_id = numericId;
    else if (normalizedType === 'person') queryPayload.person_id = numericId;
    else if (normalizedType === 'post') queryPayload.post_id = String(itemId);
    else if (normalizedType === 'profile') queryPayload.target_user_id = String(itemId);

    // 3. Check if already saved
    const { data: existing, error: fetchError } = await supabase
        .from('saved_items')
        .select('id')
        .match(queryPayload)
        .maybeSingle();

    if (fetchError) {
        return { saved: false };
    }

    // 4. Toggle Logic
    if (existing) {
        const { error: deleteError } = await supabase
            .from('saved_items')
            .delete()
            .eq('id', existing.id);

        if (deleteError) return { saved: true };

        revalidatePath(path);
        return { saved: false };
    } else {
        const { error: insertError } = await supabase
            .from('saved_items')
            .insert(queryPayload)
            .select();

        if (insertError) {
            console.error("Insert Error:", insertError);
            return { saved: false };
        }

        revalidatePath(path);
        return { saved: true };
    }
}

export async function getIsSaved(itemType: SaveableItemType | 'tv', itemId: string | number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // ✨ FIX: Normalize here too so the UI button lights up correctly
    const normalizedType = itemType === 'tv' ? 'series' : itemType;

    const queryPayload: any = {
        user_id: user.id,
        item_type: normalizedType,
    };

    if (normalizedType === 'movie') queryPayload.movie_id = itemId;
    else if (normalizedType === 'series') queryPayload.series_id = itemId;
    else if (normalizedType === 'person') queryPayload.person_id = itemId;
    else if (normalizedType === 'post') queryPayload.post_id = itemId;
    else if (normalizedType === 'profile') queryPayload.target_user_id = itemId;

    const { data } = await supabase
        .from('saved_items')
        .select('id')
        .match(queryPayload)
        .maybeSingle();

    return !!data;
}