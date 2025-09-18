// app/lib/actions/social-actions.ts

'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function followUser(profileId: string, isPrivate: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to follow users.' };
    }
    if (user.id === profileId) {
        return { error: "You cannot follow yourself." };
    }

    // Determine the status based on profile visibility
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

    revalidatePath(`/profile/${profileId}`);
    return { success: true };
}

export async function unfollowUser(profileId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in.' };
    }

    const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profileId);

    if (error) {
        console.error("Unfollow error:", error);
        return { error: "Could not unfollow user." };
    }

    revalidatePath(`/profile/${profileId}`);
    return { success: true };
}

export async function approveFollowRequest(requesterId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in.' };
    }

    const { error } = await supabase
        .from('followers')
        .update({ status: 'accepted' })
        .eq('follower_id', requesterId)
        .eq('following_id', user.id);

    if (error) {
        return { error: 'Could not approve request.' };
    }

    revalidatePath('/profile/notifications');
    return { success: true };
}

export async function denyFollowRequest(requesterId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in.' };
    }

    const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', requesterId)
        .eq('following_id', user.id);

    if (error) {
        return { error: 'Could not deny request.' };
    }

    revalidatePath('/profile/notifications');
    return { success: true };
}