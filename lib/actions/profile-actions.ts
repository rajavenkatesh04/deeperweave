// app/lib/actions/profile-actions.ts

'use server';

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ProfileSearchResult, UserProfile, Movie  } from '@/lib/definitions';
import { getMovieDetails } from './blog-actions';
import { unstable_noStore as noStore } from 'next/cache';

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



export type EditProfileState = {
    message?: string | null;
    errors?: {
        username?: string[];
        display_name?: string[];
        bio?: string[];
        profile_pic?: string[];
    };
};

// Define a specific type for the data being inserted
type FavoriteFilmInsert = {
    user_id: string;
    movie_tmdb_id: number;
    rank: number;
};

const UpdateProfileSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters.').regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores.'),
    display_name: z.string().min(1, 'Display name is required.'),
    bio: z.string().max(160, 'Bio cannot be longer than 160 characters.').optional(),
    fav_movie_1: z.coerce.number().optional(),
    fav_movie_2: z.coerce.number().optional(),
    fav_movie_3: z.coerce.number().optional(),
});

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

    const { username, display_name, bio, fav_movie_1, fav_movie_2, fav_movie_3 } = validatedFields.data;

    const { data: existingProfile } = await supabase
        .from('profiles').select('username').eq('username', username).neq('id', user.id).maybeSingle();

    if (existingProfile) {
        return {
            errors: { username: ['This username is already taken.'] },
            message: 'Username is unavailable.',
        };
    }

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

    const { error: updateError } = await supabase
        .from('profiles')
        .update(dataToUpdate)
        .eq('id', user.id);


    if (updateError) {
        console.error('Profile update error:', updateError);
        return { message: 'Database error: Could not update profile.' };
    }

    // Upsert movie details before adding them as favorites
    const favoriteMovieIds = [fav_movie_1, fav_movie_2, fav_movie_3].filter(Boolean);
    if (favoriteMovieIds.length > 0) {
        try {
            for (const movieId of favoriteMovieIds) {
                const movieDetails = await getMovieDetails(movieId as number);
                await supabase.from('movies').upsert({
                    tmdb_id: movieId,
                    title: movieDetails.title,
                    poster_url: movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : null,
                    release_date: movieDetails.release_date,
                    director: movieDetails.director,
                });
            }
        } catch (error) {
            console.error("Favorite movie upsert error:", error);
            return { message: "Server Error: Could not save favorite movie details." };
        }
    }

    const { error: deleteError } = await supabase.from('favorite_films').delete().eq('user_id', user.id);
    if (deleteError) {
        console.error('Error clearing old favorites:', deleteError);
        return { message: 'Database error: Could not update favorite films.' };
    }

    const newFavorites = [
        fav_movie_1 && { user_id: user.id, movie_tmdb_id: fav_movie_1, rank: 1 },
        fav_movie_2 && { user_id: user.id, movie_tmdb_id: fav_movie_2, rank: 2 },
        fav_movie_3 && { user_id: user.id, movie_tmdb_id: fav_movie_3, rank: 3 },
    ].filter(Boolean);

    if (newFavorites.length > 0) {
        const { error: insertError } = await supabase.from('favorite_films').insert(newFavorites as FavoriteFilmInsert[]);
        if (insertError) {
            console.error('Error inserting new favorites:', insertError);
            return { message: 'Database error: Could not save favorite films.' };
        }
    }

    revalidatePath('/profile/edit');
    revalidatePath('/profile');
    redirect('/profile');
}


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
        .neq('id', user.id) // Important: exclude the current user's own profile
        .maybeSingle();

    if (error) {
        return { available: false, message: 'Database error' };
    }

    if (existingProfile) {
        return { available: false, message: 'Username is already taken.' };
    }

    return { available: true, message: 'Username is available!' };
}


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
    revalidatePath('/profile'); // Also revalidate the main profile page
    redirect('/profile');
    return { message: 'Your settings have been saved successfully!' };
}



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

    // 3. The 'data' now perfectly matches the 'ProfileSearchResult[]' type
    return data;
}


// =====================================================================
// == NEW FUNCTION FOR THE USER PROFILE POPOVER
// =====================================================================

// This is the type your popover component expects
type ProfileData = {
    profile: UserProfile | null;
    followerCount: number;
    followingCount: number;
};

// This is the client-callable Server Action
export async function getProfileCardData(username: string): Promise<ProfileData> {
    noStore(); // Ensures this function re-runs every time it's called
    const supabase = await createClient();

    // Fetch profile and follower/following counts in one go
    const { data: profile } = await supabase
        .from('profiles')
        .select('*, follower_count:followers!following_id(count), following_count:followers!follower_id(count)')
        .eq('username', username)
        .single<UserProfile & { follower_count: [{ count: number }], following_count: [{ count: number }] }>();

    if (!profile) {
        // Return a shape that matches the ProfileData type
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