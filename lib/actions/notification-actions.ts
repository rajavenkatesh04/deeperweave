'use server';

import { createClient } from '@/utils/supabase/server';
import {revalidatePath} from "next/cache";

type NotificationType = 'like' | 'comment' | 'new_follower';

interface CreateNotificationParams {
    recipientId: string;
    actorId: string;
    actorUsername: string;
    type: NotificationType;
    targetPostId?: string; // Optional, for likes/comments
}

export async function createNotification({
                                             recipientId,
                                             actorId,
                                             actorUsername,
                                             type,
                                             targetPostId
                                         }: {
    recipientId: string;
    actorId: string;
    actorUsername: string;
    type: string; // Changed to string to be flexible
    targetPostId?: string | null;
}) {
    if (recipientId === actorId) return;

    const supabase = await createClient();

    // Explicitly handle null/undefined for targetPostId
    const payload: any = {
        recipient_id: recipientId,
        actor_id: actorId,
        actor_username: actorUsername,
        type: type,
        is_read: false,
    };

    if (targetPostId) {
        payload.target_post_id = targetPostId;
    }

    const { error } = await supabase.from('notifications').insert(payload);

    if (error) {
        console.error('Failed to create notification:', error);
    }
}

export async function markNotificationAsRead(notificationId: string) {
    const supabase = await createClient();
    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    revalidatePath('/profile/notifications');
}

export async function dismissNotification(notificationId: string) {
    const supabase = await createClient();
    await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

    revalidatePath('/profile/notifications');
}

export async function markAllNotificationsAsRead(userId: string) {
    const supabase = await createClient();
    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userId);

    revalidatePath('/profile/notifications');
}

export async function deleteNotification({
                                             actorId,
                                             type,
                                             recipientId, // Added recipientId for specificity
                                             targetPostId
                                         }: {
    actorId: string;
    type: string;
    recipientId?: string;
    targetPostId?: string | null;
}) {
    const supabase = await createClient();

    // Start the query chain
    let query = supabase.from('notifications')
        .delete({ count: 'exact' }) // Request count to verify
        .eq('actor_id', actorId)
        .eq('type', type);

    // Conditionally add filters
    if (recipientId) {
        query = query.eq('recipient_id', recipientId);
    }

    if (targetPostId) {
        query = query.eq('target_post_id', targetPostId);
    } else {
        // Essential: If no post ID, make sure we only delete rows that DON'T have a post
        // This prevents accidental deletion of likes/comments
        query = query.is('target_post_id', null);
    }

    const { error } = await query;

    if (error) {
        console.error("❌ Failed to delete notification:", error.message);
    }
}


