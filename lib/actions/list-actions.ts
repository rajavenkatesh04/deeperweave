'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getMovieDetails, getSeriesDetails } from '@/lib/actions/cinematic-actions';

// 1. CREATE LIST
// Add 'prevState: any' as the first parameter
export async function createList(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    // Now these return values will be captured in the 'state' variable in your UI
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

// 2. ADD ITEM (Auto-Save)
export async function addToList(listId: string, mediaType: 'movie' | 'tv', mediaId: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Check Ownership
    const { data: list } = await supabase.from('lists').select('user_id').eq('id', listId).single();
    if (!list || list.user_id !== user.id) return { error: "Forbidden" };

    // Warm Cache (Silent)
    try {
        if (mediaType === 'movie') await getMovieDetails(mediaId);
        else await getSeriesDetails(mediaId);
    } catch (e) {
        console.error("Cache warm failed", e);
    }

    // Get Next Rank
    const { data: maxRank } = await supabase
        .from('list_entries')
        .select('rank')
        .eq('list_id', listId)
        .order('rank', { ascending: false })
        .limit(1)
        .single();

    const nextRank = (maxRank?.rank || 0) + 1;

    // Insert
    const payload: any = { list_id: listId, rank: nextRank };
    if (mediaType === 'movie') payload.movie_id = mediaId;
    else payload.series_id = mediaId;

    await supabase.from('list_entries').insert(payload);
    revalidatePath(`/lists/${listId}/edit`);
    return { success: true };
}

// 3. REMOVE ITEM
export async function removeFromList(entryId: string, listId: string) {
    const supabase = await createClient();
    await supabase.from('list_entries').delete().eq('id', entryId);
    revalidatePath(`/lists/${listId}/edit`);
}

// 4. UPDATE NOTE (New)
export async function updateListEntryNote(entryId: string, note: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('list_entries')
        .update({ note })
        .eq('id', entryId);

    if (error) console.error("Note update failed", error);
    revalidatePath('/lists/[id]/edit');
}