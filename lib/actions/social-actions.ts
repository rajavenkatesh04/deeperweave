'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createNotification, deleteNotification } from '@/lib/actions/notification-actions';
import { getUserProfile } from '@/lib/data/user-data';

export async function followUser(profileId: string, isPrivate: boolean) {
    const supabase = await createClient();
    const userData = await getUserProfile();

    if (!userData?.user || !userData.profile) {
        return { error: 'You must be logged in to follow user.' };
    }
    const { user, profile } = userData;

    if (user.id === profileId) {
        return { error: "You cannot follow yourself." };
    }

    const status = isPrivate ? 'pending' : 'accepted';

    const { error } = await supabase
        .from('followers')
        .upsert({
            follower_id: user.id,
            following_id: profileId,
            status: status
        });

    if (error) {
        console.error("Follow error:", error);
        return { error: "Could not follow user." };
    }

    // ✨ SEND NOTIFICATION (Fixed Types)
    await createNotification({
        recipientId: profileId,
        actorId: user.id,
        actorUsername: profile.username,
        // If private -> 'follow_request'. If public -> 'new_follower' (Started following you)
        type: isPrivate ? 'follow_request' : 'new_follower',
        targetPostId: null
    });

    revalidatePath(`/profile/${profileId}`);
    return { success: true };
}

export async function unfollowUser(profileId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'You must be logged in.' };

    const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profileId);

    if (error) {
        console.error("Unfollow error:", error);
        return { error: "Could not unfollow user." };
    }

    // ✨ CLEANUP: Try to delete both potential notification types
    // We pass recipientId so we delete the specific alert sent to this person
    await deleteNotification({
        actorId: user.id,
        recipientId: profileId,
        type: 'new_follower',
        targetPostId: null
    });

    await deleteNotification({
        actorId: user.id,
        recipientId: profileId,
        type: 'follow_request',
        targetPostId: null
    });

    revalidatePath(`/profile/${profileId}`);
    return { success: true };
}

export async function approveFollowRequest(requesterId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in.' };
    }

    // 1. Update Follower Status
    const { error } = await supabase
        .from('followers')
        .update({ status: 'accepted' })
        .eq('follower_id', requesterId)
        .eq('following_id', user.id);

    if (error) {
        return { error: 'Could not approve request.' };
    }

    // 2. ✨ CONVERT "Request" -> "New Follower" Notification
    // Instead of creating a duplicate, we find the "follow_request" notification
    // and change it to "new_follower" (or whatever type shows as "Started following you")
    // and bump the timestamp so it shows as new.
    await supabase
        .from('notifications')
        .update({
            type: 'new_follower' as any,
            created_at: new Date().toISOString(), // Bump to top of list
            is_read: false // Mark unread so user notices the update
        })
        .match({
            recipient_id: user.id,
            actor_id: requesterId,
            type: 'follow_request'
        });

    revalidatePath('/profile/notifications');
    return { success: true };
}

export async function denyFollowRequest(requesterId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in.' };
    }

    // 1. Delete Follow Row
    const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', requesterId)
        .eq('following_id', user.id);

    if (error) {
        return { error: 'Could not deny request.' };
    }

    // 2. ✨ Delete the Notification (Cleanup)
    await supabase
        .from('notifications')
        .delete()
        .match({
            recipient_id: user.id,
            actor_id: requesterId,
            type: 'follow_request'
        });

    revalidatePath('/profile/notifications');
    return { success: true };
}