import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import {UserProfile} from "@/lib/definitions";


export async function getUserProfile() {
    noStore();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    // Fetch their corresponding profile from the 'profiles' table
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<UserProfile>();

    return { user, profile };
}


export async function checkProfileCompletion(userId: string): Promise<boolean> {
    noStore();
    const supabase = await createClient();

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, display_name, date_of_birth, country, gender')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        // If there's an error or no profile, assume it's not complete.
        return false;
    }

    // Check if all essential fields have a non-empty value.
    return !!(
        profile.username &&
        profile.display_name &&
        profile.date_of_birth &&
        profile.country &&
        profile.gender
    );
}



export async function getProfileByUsername(username: string) {
    noStore();
    const supabase = await createClient();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single<UserProfile>(); // We expect only one result

    return profile;
}

export async function checkFollowStatus(viewerId: string, profileId: string): Promise<boolean> {
    noStore();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('follower_id', viewerId)
        .eq('following_id', profileId)
        .maybeSingle();

    if (error) {
        console.error('Follow status check error:', error);
        return false;
    }

    // If data is not null, it means a follow relationship exists.
    return data !== null;
}


// Define a type for the joined data
export type FollowRequestWithProfile = {
    follower_id: string;
    following_id: string;
    status: 'pending' | 'accepted';
    created_at: string;
    profiles: UserProfile; // This will hold the requester's profile info
}

export async function getFollowRequests(userId: string): Promise<FollowRequestWithProfile[]> {
    noStore();
    const supabase = await createClient();

    // Fetch followers where the current user is being followed and the status is 'pending'
    // The 'profiles(*)' syntax tells Supabase to join and fetch all columns from the
    // related profile using the 'follower_id' foreign key.
    const { data, error } = await supabase
        .from('followers')
        .select('*, profiles:follower_id(*)')
        .eq('following_id', userId)
        .eq('status', 'pending');

    if (error) {
        console.error("Error fetching follow requests:", error);
        return [];
    }

    // The type assertion is needed because Supabase TS generation can be tricky with joins
    return data as FollowRequestWithProfile[];
}


// ✨ 1. DEFINE a clear return type for our function
type ProfileAndFollowStatus = {
    profile: UserProfile | null;
    followStatus: 'not_following' | 'pending' | 'accepted';
};

// 2. APPLY the return type to the function signature
export async function getProfileAndFollowStatus(username: string): Promise<ProfileAndFollowStatus> {
    noStore();
    const supabase = await createClient();
    const { data: { user: viewer } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single<UserProfile>();

    if (!profile) {
        return { profile: null, followStatus: 'not_following' };
    }

    if (!viewer || viewer.id === profile.id) {
        return { profile, followStatus: 'not_following' };
    }

    const { data: follow } = await supabase
        .from('followers')
        .select('status')
        .eq('follower_id', viewer.id)
        .eq('following_id', profile.id)
        .single();

    const followStatus = follow ? follow.status : 'not_following';

    // 3. The 'as' assertion helps ensure the value matches our defined type
    return { profile, followStatus: followStatus as 'pending' | 'accepted' | 'not_following' };
}