'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { cacheMovie, cacheSeries, cachePerson } from '@/lib/actions/cinematic-actions';
import { SaveableItemType } from '@/lib/definitions';
import {getProfileByUsername} from "@/lib/data/user-data";

export async function toggleSaveItem(
    itemType: SaveableItemType | 'tv',
    itemId: string | number,
    path: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    const normalizedType = itemType === 'tv' ? 'series' : itemType;
    const numericId = Number(itemId);

    // ✨ CRITICAL: Use the Admin-powered cache helpers
    // This ensures the item exists in the DB before we try to link to it.
    try {
        if (normalizedType === 'movie') await cacheMovie(numericId);
        else if (normalizedType === 'series') await cacheSeries(numericId);
        else if (normalizedType === 'person') await cachePerson(numericId);
    } catch (e) {
        console.error("Error ensuring item details exist:", e);
        // We continue anyway; if it fails, the next insert might fail on FK constraint,
        // but we don't want to crash the UI.
    }

    const queryPayload: any = {
        user_id: user.id,
        item_type: normalizedType,
    };

    if (normalizedType === 'movie') queryPayload.movie_id = numericId;
    else if (normalizedType === 'series') queryPayload.series_id = numericId;
    else if (normalizedType === 'person') queryPayload.person_id = numericId;
    else if (normalizedType === 'post') queryPayload.post_id = String(itemId);
    else if (normalizedType === 'profile') queryPayload.target_user_id = String(itemId);

    // Check if already saved
    const { data: existing, error: fetchError } = await supabase
        .from('saved_items')
        .select('id')
        .match(queryPayload)
        .maybeSingle();

    if (fetchError) {
        return { saved: false };
    }

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
