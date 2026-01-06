'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { getMovieDetails, getSeriesDetails, getPersonDetails } from '@/lib/actions/cinematic-actions';
import { SaveableItemType } from '@/lib/definitions';

export async function toggleSaveItem(
    itemType: SaveableItemType,
    itemId: string | number,
    path: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    try {
        if (itemType === 'movie') await getMovieDetails(Number(itemId));
        else if (itemType === 'series') await getSeriesDetails(Number(itemId));
        else if (itemType === 'person') await getPersonDetails(Number(itemId));
    } catch {}

    const queryPayload: any = {
        user_id: user.id,
        item_type: itemType,
    };

    if (itemType === 'movie') queryPayload.movie_id = Number(itemId);
    else if (itemType === 'series') queryPayload.series_id = Number(itemId);
    else if (itemType === 'person') queryPayload.person_id = Number(itemId);
    else if (itemType === 'post') queryPayload.post_id = String(itemId);
    else if (itemType === 'profile') queryPayload.target_user_id = String(itemId);

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

        if (deleteError) {
            return { saved: true };
        }

        revalidatePath(path);
        return { saved: false };
    } else {
        const { error: insertError } = await supabase
            .from('saved_items')
            .insert(queryPayload)
            .select();

        if (insertError) {
            return { saved: false };
        }

        revalidatePath(path);
        return { saved: true };
    }
}

export async function getIsSaved(itemType: SaveableItemType, itemId: string | number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const queryPayload: any = {
        user_id: user.id,
        item_type: itemType,
    };

    if (itemType === 'movie') queryPayload.movie_id = itemId;
    else if (itemType === 'series') queryPayload.series_id = itemId;
    else if (itemType === 'person') queryPayload.person_id = itemId;
    else if (itemType === 'post') queryPayload.post_id = itemId;
    else if (itemType === 'profile') queryPayload.target_user_id = itemId;

    const { data } = await supabase
        .from('saved_items')
        .select('id')
        .match(queryPayload)
        .maybeSingle();

    return !!data;
}
