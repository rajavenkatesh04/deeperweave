// app/lib/actions/profile-actions.ts

'use server';

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { UserProfile, ProfileSearchResult  } from '@/lib/definitions';

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

// Schema for updating the profile. Most fields are optional.
const UpdateProfileSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters.').regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores.'),
    display_name: z.string().min(1, 'Display name is required.'),
    bio: z.string().max(160, 'Bio cannot be longer than 160 characters.').optional(),
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

    const { username, display_name, bio } = validatedFields.data;

    // Check if the new username is already taken by another user
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

    // --- Handle File Upload ---
    const profilePicFile = formData.get('profile_pic') as File;

    if (profilePicFile && profilePicFile.size > 0) {
        // Create a unique path for the file.
        const fileExtension = profilePicFile.name.split('.').pop();
        const filePath = `${user.id}/profile.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
            .from('profile_pics') // Your bucket name
            .upload(filePath, profilePicFile, {
                upsert: true, // Overwrite existing file if any
                cacheControl: '3600',
            });

        if (uploadError) {
            console.error('Upload Error:', uploadError);
            return { message: 'Database error: Could not upload profile picture.' };
        }

        // Get the public URL of the uploaded file
        const { data: { publicUrl } } = supabase.storage
            .from('profile_pics')
            .getPublicUrl(filePath);

        dataToUpdate.profile_pic_url = publicUrl;
    }

    // --- Update the profiles table ---
    const { error: updateError } = await supabase
        .from('profiles')
        .update(dataToUpdate)
        .eq('id', user.id);

    if (updateError) {
        console.error('Profile update error:', updateError);
        return { message: 'Database error: Could not update profile.' };
    }

    // Revalidate paths and redirect
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