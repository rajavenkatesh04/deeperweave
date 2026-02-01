'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cacheMovie, cacheSeries } from '@/lib/actions/cinematic-actions';

// -----------------------------------------------------------------------------
// SECTION 1: LIST MANAGEMENT
// -----------------------------------------------------------------------------

export async function createList(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title) return { error: "Title is required" };

    const { data, error } = await supabase
        .from('lists')
        .insert({
            user_id: user.id,
            title,
            description,
            is_public: true
        })
        .select('id')
        .single();

    if (error) return { error: error.message };

    redirect(`/lists/${data.id}/edit`);
}

export async function deleteList(listId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id);

    if (error) return { error: error.message };

    revalidatePath('/lists');
    return { success: true };
}


// -----------------------------------------------------------------------------
// SECTION 2: ENTRY MANAGEMENT
// -----------------------------------------------------------------------------

export async function addToList(listId: string, mediaType: 'movie' | 'tv', mediaId: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    // 1. Verify Ownership
    const { data: list } = await supabase
        .from('lists')
        .select('user_id')
        .eq('id', listId)
        .single();

    if (!list || list.user_id !== user.id) return { error: "Forbidden" };

    // 2. ✨ CRITICAL: Cache Warm-up via Admin Client
    try {
        if (mediaType === 'movie') await cacheMovie(mediaId);
        else await cacheSeries(mediaId);
    } catch (e) {
        console.error("Cache warm failed", e);
    }

    // 3. Calculate Rank
    const { data: maxRank } = await supabase
        .from('list_entries')
        .select('rank')
        .eq('list_id', listId)
        .order('rank', { ascending: false })
        .limit(1)
        .single();

    const nextRank = (maxRank?.rank || 0) + 1;

    // 4. Insert Entry
    const payload: any = { list_id: listId, rank: nextRank };
    if (mediaType === 'movie') payload.movie_id = mediaId;
    else payload.series_id = mediaId;

    const { error } = await supabase.from('list_entries').insert(payload);

    if (error) return { error: error.message };

    revalidatePath(`/lists/${listId}/edit`);
    return { success: true };
}

export async function removeFromList(entryId: string, listId: string) {
    const supabase = await createClient();
    await supabase.from('list_entries').delete().eq('id', entryId);
    revalidatePath(`/lists/${listId}/edit`);
}

export async function updateListEntryNote(entryId: string, note: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('list_entries')
        .update({ note })
        .eq('id', entryId);

    if (error) console.error("Note update failed", error);

    revalidatePath('/lists/[id]/edit');
    revalidatePath('/lists/[id]');
}