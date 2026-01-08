'use server';

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
// ✨ 1. IMPORT Series
import { ProfileSearchResult, UserProfile, Movie, Series } from '@/lib/definitions';
// ✨ 2. IMPORT FROM YOUR NEW "LIBRARY"
import { getMovieDetails, getSeriesDetails } from './cinematic-actions';
import { unstable_noStore as noStore } from 'next/cache';

// ... (OnboardingState and OnboardingSchema are unchanged) ...
export type OnboardingState = {
    message?: string | null;
    errors?: {
        username?: string[];
        display_name?: string[];
        date_of_birth?: string[];
        country?: string[];
        gender?: string[];
    };
};
const OnboardingSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters.').regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores.'),
    display_name: z.string().min(1, 'Display name is required.'),
    date_of_birth: z.string().refine(dob => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 18;
    }, { message: 'You must be at least 18 years old to join.' }),
    country: z.string().min(1, 'Please select your country.'),
    gender: z.enum(['male', 'female', 'non-binary', 'prefer_not_to_say'], {
        message: 'Please select a gender option.'
    }),
});

// ... (completeProfile function is unchanged) ...
export async function completeProfile(prevState: OnboardingState, formData: FormData): Promise<OnboardingState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: 'Authentication error. Please timeline in again.' };
    }
    const validatedFields = OnboardingSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'There were errors with your submission. Please review the fields.',
        };
    }
    const { username, display_name, date_of_birth, country, gender } = validatedFields.data;
    const { data: existingProfile } = await supabase
        .from('profiles').select('username').eq('username', username).neq('id', user.id).maybeSingle();
    if (existingProfile) {
        return {
            errors: { username: ['This username is already taken.'] },
            message: 'Username is unavailable.',
        };
    }
    const { error } = await supabase
        .from('profiles')
        .update({ username, display_name, date_of_birth, country, gender })
        .eq('id', user.id);
    if (error) {
        console.error('Profile update error:', error);
        return { message: 'Database error: Could not update profile.' };
    }
    revalidatePath('/profile', 'layout');
    redirect('/profile');
}


// ... (EditProfileState is unchanged) ...
export type EditProfileState = {
    message?: string | null;
    errors?: {
        username?: string[];
        display_name?: string[];
        bio?: string[];
        profile_pic?: string[];
    };
};

// ✨ 3. UPDATED FavoriteFilmInsert type
type FavoriteFilmInsert = {
    user_id: string;
    rank: number;
    movie_id?: number;  // Renamed
    series_id?: number; // Added
};

// ✨ 4. UPDATED UpdateProfileSchema
// This now expects your form to send 'id' and 'type' for each favorite
const UpdateProfileSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters.').regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores.'),
    display_name: z.string().min(1, 'Display name is required.'),
    bio: z.string().max(160, 'Bio cannot be longer than 160 characters.').optional(),

    // Favorite 1
    fav_1_id: z.coerce.number().optional(),
    fav_1_type: z.enum(['movie', 'tv']).optional(),

    // Favorite 2
    fav_2_id: z.coerce.number().optional(),
    fav_2_type: z.enum(['movie', 'tv']).optional(),

    // Favorite 3
    fav_3_id: z.coerce.number().optional(),
    fav_3_type: z.enum(['movie', 'tv']).optional(),
}).refine(data => !data.fav_1_id || (data.fav_1_id && data.fav_1_type), {
    message: 'Type missing for favorite 1', path: ['fav_1_id']
}).refine(data => !data.fav_2_id || (data.fav_2_id && data.fav_2_type), {
    message: 'Type missing for favorite 2', path: ['fav_2_id']
}).refine(data => !data.fav_3_id || (data.fav_3_id && data.fav_3_type), {
    message: 'Type missing for favorite 3', path: ['fav_3_id']
});

// ✨ 5. UPDATED updateProfile function
export async function updateProfile(prevState: EditProfileState, formData: FormData): Promise<EditProfileState> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: 'Authentication error. Please log in again.' };
    }

    const validatedFields = UpdateProfileSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'There were errors with your submission. Please review the fields.',
        };
    }

    // Get the new validated data
    const {
        username, display_name, bio,
        fav_1_id, fav_1_type,
        fav_2_id, fav_2_type,
        fav_3_id, fav_3_type
    } = validatedFields.data;

    // --- Username Check (unchanged) ---
    const { data: existingProfile } = await supabase
        .from('profiles').select('username').eq('username', username).neq('id', user.id).maybeSingle();
    if (existingProfile) {
        return {
            errors: { username: ['This username is already taken.'] },
            message: 'Username is unavailable.',
        };
    }

    // --- Profile Pic Upload (unchanged) ---
    const dataToUpdate: {
        username: string;
        display_name: string;
        bio?: string;
        profile_pic_url?: string;
    } = {
        username,
        display_name,
        bio: bio,
    };
    const profilePicFile = formData.get('profile_pic') as File;
    if (profilePicFile && profilePicFile.size > 0) {
        const fileExtension = profilePicFile.name.split('.').pop();
        const filePath = `${user.id}/profile.${fileExtension}`;
        const { error: uploadError } = await supabase.storage
            .from('profile_pics')
            .upload(filePath, profilePicFile, {
                upsert: true,
                cacheControl: '3600',
            });
        if (uploadError) {
            console.error('Upload Error:', uploadError);
            return { message: 'Database error: Could not upload profile picture.' };
        }
        const { data: { publicUrl } } = supabase.storage
            .from('profile_pics')
            .getPublicUrl(filePath);
        dataToUpdate.profile_pic_url = `${publicUrl}?updated_at=${Date.now()}`;
    }

    // --- Profile Data Update (unchanged) ---
    const { error: updateError } = await supabase
        .from('profiles')
        .update(dataToUpdate)
        .eq('id', user.id);
    if (updateError) {
        console.error('Profile update error:', updateError);
        return { message: 'Database error: Could not update profile.' };
    }

    // --- ✨ 6. FAVORITES CACHING (Updated) ---
    const favoriteItems = [
        { id: fav_1_id, type: fav_1_type },
        { id: fav_2_id, type: fav_2_type },
        { id: fav_3_id, type: fav_3_type },
    ].filter(item => item.id && item.type); // Filter out empty slots

    if (favoriteItems.length > 0) {
        try {
            for (const item of favoriteItems) {
                if (item.type === 'movie') {
                    // This now calls your caching "library" function
                    await getMovieDetails(item.id!);
                } else if (item.type === 'tv') {
                    // This also calls your "library"
                    await getSeriesDetails(item.id!);
                }
            }
        } catch (error) {
            console.error("Favorite item cache error:", error);
            return { message: "Server Error: Could not save favorite item details." };
        }
    }

    // --- ✨ 7. FAVORITES INSERTION (Updated) ---

    // Delete all old favorites
    const { error: deleteError } = await supabase.from('favorite_films').delete().eq('user_id', user.id);
    if (deleteError) {
        console.error('Error clearing old favorites:', deleteError);
        return { message: 'Database error: Could not update favorite items.' };
    }

    // Build the new array with correct movie/series columns
    const newFavorites: FavoriteFilmInsert[] = [
        fav_1_id && { user_id: user.id, rank: 1, movie_id: fav_1_type === 'movie' ? fav_1_id : undefined, series_id: fav_1_type === 'tv' ? fav_1_id : undefined },
        fav_2_id && { user_id: user.id, rank: 2, movie_id: fav_2_type === 'movie' ? fav_2_id : undefined, series_id: fav_2_type === 'tv' ? fav_2_id : undefined },
        fav_3_id && { user_id: user.id, rank: 3, movie_id: fav_3_type === 'movie' ? fav_3_id : undefined, series_id: fav_3_type === 'tv' ? fav_3_id : undefined },
    ].filter(Boolean) as FavoriteFilmInsert[];

    if (newFavorites.length > 0) {
        const { error: insertError } = await supabase.from('favorite_films').insert(newFavorites);
        if (insertError) {
            console.error('Error inserting new favorites:', insertError);
            return { message: 'Database error: Could not save favorite items.' };
        }
    }

    revalidatePath('/profile/edit');
    revalidatePath('/profile');
    redirect('/profile');
}


// ... (checkUsernameAvailability is unchanged) ...
export async function checkUsernameAvailability(username: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { available: false, message: 'Not authenticated' };
    }
    if (!username || username.length < 3) {
        return { available: false, message: 'Username too short' };
    }
    const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .maybeSingle();
    if (error) {
        return { available: false, message: 'Database error' };
    }
    if (existingProfile) {
        return { available: false, message: 'Username is already taken.' };
    }
    return { available: true, message: 'Username is available!' };
}

// ... (SettingsState and SettingsSchema are unchanged) ...
export type SettingsState = {
    message?: string | null;
    errors?: {
        visibility?: string[];
        content_preference?: string[];
    };
};
const SettingsSchema = z.object({
    visibility: z.enum(['public', 'private']),
    content_preference: z.enum(['sfw', 'all']),
});

// ... (updateProfileSettings is unchanged) ...
export async function updateProfileSettings(prevState: SettingsState, formData: FormData): Promise<SettingsState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: 'Authentication error.' };
    }
    const validatedFields = SettingsSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid data provided.',
        };
    }
    const { visibility, content_preference } = validatedFields.data;
    const { error } = await supabase
        .from('profiles')
        .update({ visibility, content_preference })
        .eq('id', user.id);
    if (error) {
        console.error('Settings update error:', error);
        return { message: 'Database Error: Could not update settings.' };
    }
    revalidatePath('/profile/settings');
    revalidatePath('/profile');
    redirect('/profile');
    // ✨ This return is unreachable due to redirect(), but fine
    return { message: 'Your settings have been saved successfully!' };
}

// ... (searchProfiles is unchanged) ...
export async function searchProfiles(query: string): Promise<ProfileSearchResult[]> {
    if (query.length < 2) {
        return [];
    }
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, profile_pic_url, bio')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10);
    if (error) {
        console.error('Search error:', error);
        return [];
    }
    return data;
}

// ... (ProfileData type is unchanged) ...
type ProfileData = {
    profile: UserProfile | null;
    followerCount: number;
    followingCount: number;
};

// ... (getProfileCardData is unchanged) ...
export async function getProfileCardData(username: string): Promise<ProfileData> {
    noStore();
    const supabase = await createClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('*, follower_count:followers!following_id(count), following_count:followers!follower_id(count)')
        .eq('username', username)
        .single<UserProfile & { follower_count: [{ count: number }], following_count: [{ count: number }] }>();
    if (!profile) {
        return { profile: null, followerCount: 0, followingCount: 0 };
    }
    const followerCount = profile.follower_count[0]?.count || 0;
    const followingCount = profile.following_count[0]?.count || 0;
    return {
        profile,
        followerCount,
        followingCount
    };
}

// ... (DeleteAccountState and DeleteAccountSchema are unchanged) ...
export type DeleteAccountState = {
    message?: string | null;
    errors?: {
        confirmation?: string[];
    };
};
const DeleteAccountSchema = z.object({
    confirmation: z.string().refine(val => val === 'DELETE', {
        message: 'You must type "DELETE" to confirm.'
    }),
});

export async function deleteMyAccount(
    prevState: DeleteAccountState,
    formData: FormData
): Promise<DeleteAccountState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { message: 'Authentication error.' };
    }

    // 1. Validate the form input (Keep your existing logic)
    const validatedFields = DeleteAccountSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Confirmation is incorrect.',
        };
    }

    // =========================================================
    // ✨ NEW: CLEAN UP STORAGE BUCKETS
    // =========================================================
    try {
        // 1. Clean Profile Pictures
        // We assume files are stored in a folder named after the user ID based on your updateProfile code
        const { data: profileFiles } = await supabase.storage
            .from('profile_pics')
            .list(`${user.id}`); // List all files in the user's folder

        if (profileFiles && profileFiles.length > 0) {
            const filesToRemove = profileFiles.map(file => `${user.id}/${file.name}`);
            await supabase.storage.from('profile_pics').remove(filesToRemove);
        }

        // 2. Clean Timeline Photos (If you have a 'timeline_photos' bucket)
        // Repeat this pattern for any other buckets you use (e.g. 'post_banners')
        const { data: timelineFiles } = await supabase.storage
            .from('timeline_photos')
            .list(`${user.id}`);

        if (timelineFiles && timelineFiles.length > 0) {
            const timelineRemovals = timelineFiles.map(file => `${user.id}/${file.name}`);
            await supabase.storage.from('timeline_photos').remove(timelineRemovals);
        }

    } catch (storageError) {
        // Optional: Decide if you want to stop deletion if storage cleanup fails.
        // Usually, it's better to log it and proceed with DB deletion so the account is still closed.
        console.error('Error cleaning up storage files:', storageError);
    }

    // =========================================================
    // ✨ EXISTING: DELETE DATABASE RECORD
    // =========================================================

    // Now that images are gone, we can safely wipe the DB.
    // The SQL Cascades you added will handle posts, likes, comments, etc.
    const { error: rpcError } = await supabase.rpc('delete_my_account');

    if (rpcError) {
        console.error('Account deletion RPC error:', rpcError);
        return { message: 'A server error occurred. Could not delete account.' };
    }

    // Optional: Explicitly sign the user out of the session
    await supabase.auth.signOut();

    revalidatePath('/', 'layout');
    redirect('/delete-success');
}