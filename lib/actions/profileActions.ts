// app/lib/actions/profileActions.ts

'use server';

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

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