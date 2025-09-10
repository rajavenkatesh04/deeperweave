import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

// A function to get the current user and their profile data
export async function getUserProfile() {
    // Prevents the result of this function from being cached
    noStore();
    const supabase = await createClient();

    // First, get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    // If there's no user, we can't fetch a profile, so return null
    if (!user) {
        return null;
    }

    // If a user exists, fetch their profile from the 'profiles' table
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Return everything in a single object
    return { user, profile };
}

// You can continue adding all your other data fetching functions here...
// For example:
// export async function getPostsForUser(userId: string) { ... }
// export async function getLatestComments() { ... }