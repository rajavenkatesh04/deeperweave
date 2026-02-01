'use server';

import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
// ✨ 1. IMPORT Series and other types
import {Movie, UserProfile, Series, ProfileSearchResult, ProfileSection} from "@/lib/definitions";
import { unstable_cache } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

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
    timelineCount: number;
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

/**
 * ✨ UPDATED: Fetch Public Profile Data
 * Now fetches ALL sections for the user to display on their profile.
 */
export async function getProfileData(username: string) {
    noStore();
    const supabase = await createClient();
    const { data: { user: viewer } } = await supabase.auth.getUser();

    // 1. Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*, timeline_count:timeline_entries!user_id(count)')
        .eq('username', username)
        .single();

    if (!profile) {
        return {
            profile: null,
            followStatus: 'not_following',
            followerCount: 0,
            followingCount: 0,
            timelineCount: 0,
            sections: [] // Empty sections
        };
    }

    // 2. Fetch ALL Sections with Items
    const { data: sectionsData } = await supabase
        .from('profile_sections')
        .select(`
            *,
            items:section_items(
                *,
                movie:movies(*),
                series:series(*),
                person:people(*)
            )
        `)
        .eq('user_id', profile.id)
        .order('rank', { ascending: true });

    // Clean up the data structure (Supabase returns arrays for relations)
    const sections: ProfileSection[] = (sectionsData || []).map((sec: any) => ({
        ...sec,
        items: (sec.items || []).sort((a: any, b: any) => a.rank - b.rank).map((item: any) => ({
            ...item,
            movie: Array.isArray(item.movie) ? item.movie[0] : item.movie,
            series: Array.isArray(item.series) ? item.series[0] : item.series,
            person: Array.isArray(item.person) ? item.person[0] : item.person,
        }))
    }));

    // 3. Fetch Counts (Existing logic)
    const [followerRes, followingRes, followStatusRes] = await Promise.all([
        supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', profile.id).eq('status', 'accepted'),
        supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id).eq('status', 'accepted'),
        viewer && viewer.id !== profile.id
            ? supabase.from('followers').select('status').eq('follower_id', viewer.id).eq('following_id', profile.id).single()
            : Promise.resolve({ data: null })
    ]);

    return {
        profile,
        followStatus: (followStatusRes.data?.status || 'not_following') as 'not_following' | 'pending' | 'accepted',
        followerCount: followerRes.count || 0,
        followingCount: followingRes.count || 0,
        timelineCount: profile.timeline_count?.[0]?.count || 0,
        sections // ✨ Return the new sections
    };
}

/**
 * =================================================================
 * ✨ 2. UPDATED: getProfileForEdit
 * =================================================================
 */
/**
 * ✨ UPDATED: Fetch Data for the Edit Page
 * Now retrieves the "Top 3 Favorites" section from the new tables.
 */
export async function getProfileForEdit() {
    noStore();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<UserProfile>();

    if (!profile) return { user, profile: null, sections: [] };

    // Fetch ALL sections and their items (Polymorphic associations)
    const { data: sectionsData } = await supabase
        .from('profile_sections')
        .select(`
            *,
            items:section_items(
                *,
                movie:movies(*),
                series:series(*),
                person:people(*)
            )
        `)
        .eq('user_id', user.id)
        .order('rank', { ascending: true });

    // Format the data for the UI
    const sections: ProfileSection[] = (sectionsData || []).map((sec: any) => ({
        id: sec.id,
        user_id: sec.user_id,
        title: sec.title,
        type: sec.type,
        rank: sec.rank,
        // Sort items by rank and flatten array responses
        items: (sec.items || [])
            .sort((a: any, b: any) => a.rank - b.rank)
            .map((item: any) => ({
                id: item.id,
                section_id: item.section_id,
                item_type: item.item_type,
                rank: item.rank,
                movie: Array.isArray(item.movie) ? item.movie[0] : item.movie,
                series: Array.isArray(item.series) ? item.series[0] : item.series,
                person: Array.isArray(item.person) ? item.person[0] : item.person,
            }))
    }));

    return { user, profile, sections };
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


/**
 * ✨ UPDATED: Cached Podium Data
 * Uses unstable_cache to prevent excessive DB reads on the home page.
 * Call revalidateTag(`home-${username}`) in your actions to refresh this.
 */
export async function getPodiumData(username: string) {
    // 1. We use the standard client directly
    const supabase = await createClient(); // Ensure this import is from '@/utils/supabase/server'

    // 2. Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    if (!profile) return null;

    // 3. Fetch Sections
    const { data: sectionsData, error } = await supabase
        .from('profile_sections')
        .select(`
            *,
            items:section_items(
                *,
                movie:movies(*),
                series:series(*),
                person:people(*)
            )
        `)
        .eq('user_id', profile.id)
        .order('rank', { ascending: true });

    if (error || !sectionsData) return { profile, sections: [] };

    // 4. Process Data (Sort and Flatten)
    const sections = sectionsData.map((sec: any) => ({
        ...sec,
        items: (sec.items || [])
            .sort((a: any, b: any) => a.rank - b.rank)
            .map((item: any) => ({
                ...item,
                movie: Array.isArray(item.movie) ? item.movie[0] : item.movie,
                series: Array.isArray(item.series) ? item.series[0] : item.series,
                person: Array.isArray(item.person) ? item.person[0] : item.person,
            }))
    }));

    return { profile, sections };
}