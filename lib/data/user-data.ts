import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import {Movie, UserProfile} from "@/lib/definitions";


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
    const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).single<UserProfile>();
    return profile;
}

// ✨ UPGRADED: This function now fetches follower/following counts as well
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


export async function getProfileData(username: string): Promise<ProfileData> {
    noStore();
    const supabase = await createClient();
    const { data: { user: viewer } } = await supabase.auth.getUser();

    // Fetch profile and follower/following counts in one go
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
 * ✨ CORE FIX: REVISED DATA FETCHING FOR THE EDIT PAGE
 * =================================================================
 * This function now robustly fetches the user's profile and correctly
 * handles the shape of the joined 'favorite_films' data from Supabase.
 */
export async function getProfileForEdit() {
    noStore();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // If there's no user, we can't fetch anything.
        return null;
    }

    // 1. Fetch the user's main profile details.
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<UserProfile>();

    // If the user is authenticated but has no profile row yet, return that info.
    if (!profile) {
        return { user, profile: null, favoriteFilms: [] };
    }

    // 2. Fetch the user's favorite films and join the related movie data.
    const { data: filmData, error } = await supabase
        .from('favorite_films')
        .select('rank, movies(*)') // This joins the ENTIRE movie object
        .eq('user_id', user.id)
        .order('rank', { ascending: true });

    if (error) {
        console.error("Error fetching favorite films for edit page:", error);
        // Return the profile data even if films fail to load.
        return { user, profile, favoriteFilms: [] };
    }

    // 3. ✨ IMPORTANT: Safely transform the film data.
    // This now handles cases where `fav.movies` is an object OR an array.
    const favoriteFilms = filmData
        .map(fav => ({
            rank: fav.rank,
            movies: (Array.isArray(fav.movies) ? fav.movies[0] : fav.movies) as Movie | null,
        }))
        .filter(fav => fav.movies); // Ensure we don't pass any null movie records

    return { user, profile, favoriteFilms: favoriteFilms as { rank: number; movies: Movie }[] };
}
