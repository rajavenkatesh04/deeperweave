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
                                         }: CreateNotificationParams) {
    // 1. Self-Check: Don't notify if the user is acting on their own content
    if (recipientId === actorId) return;

    const supabase = await createClient();

    // 2. Database Insert
    const { error } = await supabase.from('notifications').insert({
        recipient_id: recipientId,
        actor_id: actorId,
        actor_username: actorUsername,
        type: type,
        target_post_id: targetPostId || null,
        is_read: false,
    });

    if (error) {
        console.error('Failed to create notification:', error);
        return; // specific error handling usually not needed for fire-and-forget notifications
    }

    // 3. Email Trigger (Centralized Place)
    // This is where you would call your email service (Resend, SendGrid, etc.)
    // Example:
    // await sendNotificationEmail({
    //    to: recipientId,
    //    subject: `New ${type} from @${actorUsername}`,
    // });
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
                                             targetPostId
                                         }: {
    actorId: string;
    type: 'like' | 'comment';
    targetPostId: string;
}) {
    const supabase = await createClient();

    await supabase.from('notifications').delete().match({
        actor_id: actorId,
        type: type,
        target_post_id: targetPostId
    });
}


