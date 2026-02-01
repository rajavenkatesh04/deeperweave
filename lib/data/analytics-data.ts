'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export async function getUserAnalytics(username: string) {
    noStore();
    const supabase = await createClient();

    // 1. Get User Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name, profile_pic_url')
        .eq('username', username)
        .single();

    if (!profile) return null;

    // 2. Fetch ALL Timeline Entries (Minimal Data for Calc)
    // We fetch everything to allow client-side year filtering without re-fetching
    const { data: entries } = await supabase
        .from('timeline_entries')
        .select(`
            watched_on,
            viewing_context,
            rating,
            movie_id,
            series_id,
            timeline_collaborators (
                profiles (id, username, display_name, profile_pic_url)
            )
        `)
        .eq('user_id', profile.id)
        .order('watched_on', { ascending: true }); // Oldest first for streaks

    if (!entries) return { profile, entries: [] };

    return {
        profile,
        entries
    };
}