// app/lib/actions/auth-actions.ts

'use server';

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkProfileCompletion } from '@/lib/data/user-data';

export type AuthState = {
    message?: string | null;
    errors?: {
        email?: string[];
        password?: string[];
    };
};

const LoginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
});

const SignupSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
});

// --- LOGIN ACTION (MODIFIED) ---
export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const supabase = await createClient();

    const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid fields. Please check your email and password.',
        };
    }

    const { email, password } = validatedFields.data;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error || !data.user) {
        return { message: error?.message || 'Authentication failed. Please check your credentials.' };
    }

    // --- THIS IS THE KEY ---
    // After a successful login, we immediately check if the user's profile is complete.
    const isProfileComplete = await checkProfileCompletion(data.user.id);

    // Now, we redirect to the correct page based on the result.
    if (isProfileComplete) {
        redirect('/profile'); // User is fully set up, go to profile.
    } else {
        redirect('/onboarding'); // User is new, start the onboarding flow.
    }
}

// --- SIGNUP ACTION ---
export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const supabase = await createClient();

    const validatedFields = SignupSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid fields. Please check the form for errors.',
        };
    }

    const { email, password } = validatedFields.data;
    const origin = new URL(process.env.NEXT_PUBLIC_BASE_URL!).origin;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/confirm`
        },
    });

    if (error) {
        return { message: error.message };
    }

    redirect(`/auth/sign-up-success?email=${encodeURIComponent(email)}`);
}


export type UpdatePasswordState = {
    message?: string | null;
    errors?: {
        password?: string[];
    };
    success?: boolean;
};

const UpdatePasswordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters long.'),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"], // path of error
});


export async function updatePassword(prevState: UpdatePasswordState, formData: FormData): Promise<UpdatePasswordState> {
    const supabase = await createClient();

    const validatedFields = UpdatePasswordSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please check the form for errors.',
        };
    }

    const { password } = validatedFields.data;

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        console.error('Update password error:', error);
        return { message: 'Failed to update password. The link may have expired.' };
    }

    // Don't redirect here, just return a success state. Let the client handle the redirect.
    return { success: true, message: 'Your password has been updated successfully!' };
}

// --- LOGOUT ACTION ---
export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();

    revalidatePath('/', 'layout');
    redirect('/'); // Redirect to the home page after logout is a better UX.
}