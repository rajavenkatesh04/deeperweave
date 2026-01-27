'use server';

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import {revalidatePath, revalidateTag} from 'next/cache';
import { ProfileSearchResult, UserProfile } from '@/lib/definitions';
import { getMovieDetails, getSeriesDetails, getPersonDetails } from './cinematic-actions'; // Ensure getPersonDetails is exported from here
import { unstable_noStore as noStore } from 'next/cache';

// =====================================================================
// 1. ONBOARDING ACTIONS
// =====================================================================

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
        return { message: 'Authentication error. Please log in again.' };
    }
    const validatedFields = OnboardingSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'There were errors with your submission. Please review the fields.',
        };
    }
    const { username, display_name, date_of_birth, country, gender } = validatedFields.data;

    // Check for username uniqueness
    const { data: existingProfile } = await supabase
        .from('profiles').select('username').eq('username', username).neq('id', user.id).maybeSingle();
    if (existingProfile) {
        return {
            errors: { username: ['This username is already taken.'] },
            message: 'Username is unavailable.',
        };
    }

    // Upsert ensures row is created if missing
    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            username,
            display_name,
            date_of_birth,
            country,
            gender
        });

    if (error) {
        console.error('Profile update error:', error);
        return { message: 'Database error: Could not save profile.' };
    }

    revalidatePath('/profile', 'layout');
    redirect('/profile');
}

// =====================================================================
// 2. PROFILE EDITING (DYNAMIC SECTIONS)
// =====================================================================

export type EditProfileState = {
    message?: string | null;
    errors?: {
        username?: string[];
        display_name?: string[];
        bio?: string[];
        profile_pic?: string[];
        sections?: string[];
    };
};

// Schema now expects a JSON string for sections instead of individual fields
const UpdateProfileSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters.').regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores.'),
    display_name: z.string().min(1, 'Display name is required.'),
    bio: z.string().max(160, 'Bio cannot be longer than 160 characters.').optional(),
    sections_json: z.string().optional(), // The entire UI state serialized
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
            message: 'There were errors with your submission.',
        };
    }

    const { username, display_name, bio, sections_json } = validatedFields.data;

    // 1. Check Username Uniqueness
    const { data: existingProfile } = await supabase
        .from('profiles').select('username').eq('username', username).neq('id', user.id).maybeSingle();
    if (existingProfile) {
        return {
            errors: { username: ['This username is already taken.'] },
            message: 'Username is unavailable.',
        };
    }

    // 2. Prepare Update Data
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

    // 3. Handle Profile Picture (Cleanup + Upload)
    const profilePicFile = formData.get('profile_pic') as File;
    if (profilePicFile && profilePicFile.size > 0) {
        try {
            // A. Cleanup old files
            const { data: oldFiles } = await supabase.storage.from('profile_pics').list(user.id);
            if (oldFiles && oldFiles.length > 0) {
                const filesToRemove = oldFiles.map(file => `${user.id}/${file.name}`);
                await supabase.storage.from('profile_pics').remove(filesToRemove);
            }

            // B. Upload new file with timestamp for cache busting
            const fileExtension = profilePicFile.name.split('.').pop();
            const timestamp = Date.now();
            const filePath = `${user.id}/profile-${timestamp}.${fileExtension}`;

            const { error: uploadError } = await supabase.storage
                .from('profile_pics')
                .upload(filePath, profilePicFile, { upsert: true, cacheControl: '3600' });

            if (uploadError) throw uploadError;

            // C. Get URL
            const { data: { publicUrl } } = supabase.storage.from('profile_pics').getPublicUrl(filePath);
            dataToUpdate.profile_pic_url = publicUrl;

        } catch (error) {
            console.error('Profile Pic Error:', error);
            return { message: 'Database error: Could not upload profile picture.' };
        }
    }

    // 4. Update Profile Row
    const { error: updateError } = await supabase
        .from('profiles')
        .update(dataToUpdate)
        .eq('id', user.id);

    if (updateError) {
        console.error('Profile update error:', updateError);
        return { message: 'Database error: Could not update profile details.' };
    }

    // 5. Handle Dynamic Sections
    if (sections_json) {
        try {
            const sections = JSON.parse(sections_json);

            // A. CACHE DATA (Ensure Foreign Keys Exist)
            // We collect all IDs first to do efficient batch caching
            const moviesToCache = new Set<number>();
            const seriesToCache = new Set<number>();
            const peopleToCache = new Set<number>();

            sections.forEach((sec: any) => {
                if (sec.items && Array.isArray(sec.items)) {
                    sec.items.forEach((item: any) => {
                        if (!item) return;
                        const id = Number(item.id);
                        if (item.type === 'movie') moviesToCache.add(id);
                        else if (item.type === 'tv') seriesToCache.add(id);
                        else if (item.type === 'person') peopleToCache.add(id);
                    });
                }
            });

            // Run API calls in parallel
            await Promise.all([
                ...Array.from(moviesToCache).map(id => getMovieDetails(id)),
                ...Array.from(seriesToCache).map(id => getSeriesDetails(id)),
                ...Array.from(peopleToCache).map(id => getPersonDetails(id))
            ]);

            // B. DATABASE UPDATE (Transaction-like)

            // Delete old sections (Cascade will delete items)
            await supabase.from('profile_sections').delete().eq('user_id', user.id);

            // Insert new sections and items
            for (let i = 0; i < sections.length; i++) {
                const sec = sections[i];

                // Create Section
                const { data: secRow, error: secError } = await supabase
                    .from('profile_sections')
                    .insert({
                        user_id: user.id,
                        title: sec.title,
                        type: sec.type,
                        rank: i + 1
                    })
                    .select('id')
                    .single();

                if (secError || !secRow) {
                    console.error("Error creating section:", secError);
                    continue;
                }

                // Create Items
                const itemsToInsert = (sec.items || [])
                    .map((item: any, idx: number) => {
                        if (!item) return null;
                        return {
                            section_id: secRow.id,
                            item_type: item.type,
                            movie_id: item.type === 'movie' ? Number(item.id) : null,
                            series_id: item.type === 'tv' ? Number(item.id) : null,
                            person_id: item.type === 'person' ? Number(item.id) : null,
                            rank: idx + 1
                        };
                    })
                    .filter(Boolean); // Remove nulls

                if (itemsToInsert.length > 0) {
                    const { error: itemError } = await supabase
                        .from('section_items')
                        .insert(itemsToInsert);

                    if (itemError) console.error("Error inserting items:", itemError);
                }
            }

        } catch (error) {
            console.error("Error processing sections:", error);
            return { message: "Saved profile, but failed to update showcase sections." };
        }
    }

    revalidatePath('/profile', 'layout');
    redirect('/profile');
}

// =====================================================================
// 3. UTILITY & SETTINGS
// =====================================================================

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
    revalidatePath('/profile');
    redirect('/profile');
    return { message: 'Your settings have been saved successfully!' };
}

// Find the searchProfiles function and update the .select() part
export async function searchProfiles(query: string): Promise<ProfileSearchResult[]> {
    if (query.length < 2) return [];

    const supabase = await createClient();

    // ✨ UPDATE: Added 'role' to the select string
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, profile_pic_url, bio, role')
        .textSearch('fts', query, {
            type: 'websearch',
            config: 'english'
        })
        .limit(10);

    if (error) {
        console.error('Search error:', error);
        return [];
    }
    return data as ProfileSearchResult[];
}

type ProfileData = {
    profile: UserProfile | null;
    followerCount: number;
    followingCount: number;
};

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

// =====================================================================
// 4. ACCOUNT DELETION
// =====================================================================

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

    const validatedFields = DeleteAccountSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Confirmation is incorrect.',
        };
    }

    // Clean up storage before DB
    try {
        // 1. Profile Pics
        const { data: profileFiles } = await supabase.storage.from('profile_pics').list(user.id);
        if (profileFiles && profileFiles.length > 0) {
            const filesToRemove = profileFiles.map(file => `${user.id}/${file.name}`);
            const { error: removeError } = await supabase.storage.from('profile_pics').remove(filesToRemove);
            if (removeError) console.error("Failed to delete profile pics:", removeError);
        }

        // 2. Timeline Photos (if applicable)
        const { data: timelineFiles } = await supabase.storage.from('timeline_photos').list(user.id);
        if (timelineFiles && timelineFiles.length > 0) {
            const timelineRemovals = timelineFiles.map(file => `${user.id}/${file.name}`);
            await supabase.storage.from('timeline_photos').remove(timelineRemovals);
        }

    } catch (storageError) {
        console.error('Error cleaning up storage files:', storageError);
    }

    // Delete DB Record
    const { error: rpcError } = await supabase.rpc('delete_my_account');

    if (rpcError) {
        console.error('Account deletion RPC error:', rpcError);
        return { message: 'A server error occurred. Could not delete account.' };
    }

    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/delete-success');
}