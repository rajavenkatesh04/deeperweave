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