'use server';

import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

export async function getNotifications(userId: string) {
    noStore();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('notifications')
        .select(`
            *,
            actor:actor_id (
                username,
                display_name,
                profile_pic_url
            ),
            post:target_post_id (
                id,
                slug,
                title,
                banner_url
            )
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }

    return data;
}