'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getMovieDetails, getSeriesDetails } from '@/lib/actions/cinematic-actions';

// -----------------------------------------------------------------------------
// SECTION 1: LIST MANAGEMENT (Create, Delete)
// -----------------------------------------------------------------------------

/**
 * Creates a new empty list for the authenticated user.
 * Redirects to the Edit page upon success.
 *
 * @param prevState - Form state from useFormState (if used)
 * @param formData - The form data containing 'title' and 'description'
 */
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
            is_public: true // Default to public
        })
        .select('id')
        .single();

    if (error) return { error: error.message };

    // Redirect to the edit screen to start adding items
    redirect(`/lists/${data.id}/edit`);
}

/**
 * Deletes a specific list and ensures the user owns it.
 *
 * @param listId - The UUID of the list to delete
 */
export async function deleteList(listId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id); // Strict ownership check

    if (error) return { error: error.message };

    // Refresh the dashboard so the list disappears immediately
    revalidatePath('/lists');
    return { success: true };
}


// -----------------------------------------------------------------------------
// SECTION 2: ENTRY MANAGEMENT (Add, Remove, Update Items)
// -----------------------------------------------------------------------------

/**
 * Adds a Movie or TV Series to a specific list.
 * Automatically handles ranking (appends to the bottom).
 *
 * @param listId - Target list
 * @param mediaType - 'movie' or 'tv'
 * @param mediaId - The TMDB ID
 */
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

    // 2. Cache Warm-up (Ensure movie exists in our local DB for joins)
    try {
        if (mediaType === 'movie') await getMovieDetails(mediaId);
        else await getSeriesDetails(mediaId);
    } catch (e) {
        console.error("Cache warm failed", e);
    }

    // 3. Calculate Rank (Append to bottom)
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

/**
 * Removes a single entry from a list.
 */
export async function removeFromList(entryId: string, listId: string) {
    const supabase = await createClient();
    // RLS policies usually handle the "user can only delete own entries" check,
    // but explicit checks in logic are also valid.
    await supabase.from('list_entries').delete().eq('id', entryId);

    revalidatePath(`/lists/${listId}/edit`);
}

/**
 * Updates the personal note attached to a list entry.
 */
export async function updateListEntryNote(entryId: string, note: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('list_entries')
        .update({ note })
        .eq('id', entryId);

    if (error) console.error("Note update failed", error);

    // Revalidate both the edit page and the public view
    revalidatePath('/lists/[id]/edit');
    revalidatePath('/lists/[id]');
}