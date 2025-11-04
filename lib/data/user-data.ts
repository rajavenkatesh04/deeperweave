'use server';

import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
// ✨ 1. IMPORT Series and other types
import {Movie, UserProfile, Series, ProfileSearchResult} from "@/lib/definitions";

// ... (getUserProfile, checkProfileCompletion, getProfileByUsername, checkFollowStatus, getFollowRequests, getProfileAndFollowStatus, getProfileData are all unchanged) ...
export async function getUserProfile() {
    noStore();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return null;
    }
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
        return false;
    }
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
    const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).single<UserProfile>();
    return profile;
}

type ProfileData = {
    profile: UserProfile | null;
    followStatus: 'not_following' | 'pending' | 'accepted';
    followerCount: number;
    followingCount: number;
};

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
    const { data, error } = await supabase
        .from('followers')
        .select('*, profiles:follower_id(*)')
        .eq('following_id', userId)
        .eq('status', 'pending');
    if (error) {
        console.error("Error fetching follow requests:", error);
        return [];
    }
    return data as FollowRequestWithProfile[];
}

type ProfileAndFollowStatus = {
    profile: UserProfile | null;
    followStatus: 'not_following' | 'pending' | 'accepted';
};

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
    return { profile, followStatus: followStatus as 'pending' | 'accepted' | 'not_following' };
}

export async function getProfileData(username: string): Promise<ProfileData> {
    noStore();
    const supabase = await createClient();
    const { data: { user: viewer } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
        .from('profiles')
        .select('*, follower_count:followers!following_id(count), following_count:followers!follower_id(count)')
        .eq('username', username)
        .single<UserProfile & { follower_count: [{ count: number }], following_count: [{ count: number }] }>();
    if (!profile) {
        return { profile: null, followStatus: 'not_following', followerCount: 0, followingCount: 0 };
    }
    const followerCount = profile.follower_count[0]?.count || 0;
    const followingCount = profile.following_count[0]?.count || 0;
    if (!viewer || viewer.id === profile.id) {
        return { profile, followStatus: 'not_following', followerCount, followingCount };
    }
    const { data: follow } = await supabase.from('followers').select('status').eq('follower_id', viewer.id).eq('following_id', profile.id).single();
    const followStatus = follow ? follow.status : 'not_following';
    return { profile, followStatus: followStatus as 'not_following' | 'pending' | 'accepted', followerCount, followingCount };
}


/**
 * =================================================================
 * ✨ 2. UPDATED: getProfileForEdit
 * =================================================================
 */
export async function getProfileForEdit() {
    noStore();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return null;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<UserProfile>();

    if (!profile) {
        // ✨ 3. RENAMED prop
        return { user, profile: null, favoriteItems: [] };
    }

    // ✨ 4. UPDATED select to fetch both movies and series
    const { data: itemData, error } = await supabase
        .from('favorite_films')
        .select('rank, movies(*), series(*)') // ✨ FETCH BOTH
        .eq('user_id', user.id)
        .order('rank', { ascending: true });

    if (error) {
        console.error("Error fetching favorite items for edit page:", error);
        // ✨ 5. RENAMED prop
        return { user, profile, favoriteItems: [] };
    }

    // ✨ 6. Safely transform the data.
    const favoriteItems = itemData
        .map(fav => ({
            rank: fav.rank,
            movies: (Array.isArray(fav.movies) ? fav.movies[0] : fav.movies) as Movie | null,
            series: (Array.isArray(fav.series) ? fav.series[0] : fav.series) as Series | null,
        }))
        .filter(fav => fav.movies || fav.series); // Ensure we don't pass any null items

    // ✨ 7. RENAMED prop
    return { user, profile, favoriteItems: favoriteItems as { rank: number; movies: Movie | null; series: Series | null }[] };
}

// ... (getFollowers and getFollowing are unchanged) ...
export async function getFollowers(userId: string): Promise<UserProfile[]> {
    noStore();
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('followers')
        .select('profiles:follower_id(*)')
        .eq('following_id', userId)
        .eq('status', 'accepted');
    if (error) {
        console.error("Error fetching followers:", error);
        return [];
    }
    if (!data) {
        return [];
    }
    return data
        .map(item => item.profiles)
        .filter(Boolean) as unknown as UserProfile[];
}

export async function getFollowing(userId: string): Promise<UserProfile[]> {
    noStore();
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('followers')
        .select('profiles:following_id(*)')
        .eq('follower_id', userId)
        .eq('status', 'accepted');
    if (error) {
        console.error("Error fetching following list:", error);
        return [];
    }
    if (!data) {
        return [];
    }
    return data
        .map(item => item.profiles)
        .filter(Boolean) as unknown as UserProfile[];
}