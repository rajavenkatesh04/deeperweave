// app/lib/actions/auth-actions.ts

'use server';

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { checkProfileCompletion } from '@/lib/data/user-data';
import {headers} from "next/headers";

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

    // Check profile completion
    const isProfileComplete = await checkProfileCompletion(data.user.id);

    if (isProfileComplete) {
        // 👇 1. Check for intent parameters from the form
        const item = formData.get('post_login_item');
        const type = formData.get('post_login_type');

        // 👇 2. If intent exists, fetch username and redirect to create page
        if (item && type) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', data.user.id)
                .single();

            if (profile?.username) {
                redirect(`/profile/${profile.username}/timeline/create?item=${item}&type=${type}`);
            }
        }

        // Default redirect
        redirect('/profile');
    } else {
        redirect('/onboarding');
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

    // --- 👇 NEW PRE-CHECK ADDED HERE ---

    // 1. Call the SQL function we just created
    const { data: emailExists, error: rpcError } = await supabase.rpc('email_exists', {
        email_to_check: email
    });

    // 2. Handle any error from calling the function itself
    if (rpcError) {
        console.error('Email check RPC error:', rpcError);
        return { message: 'Something went wrong. Please try again.' };
    }

    // 3. If emailExists is true, return a specific error message
    if (emailExists) {
        return {
            // You can also add this to the 'email' field in errors
            // errors: { email: ['An account with this email already exists.'] },
            message: 'An account with this email already exists. Please log in.'
        };
    }
    // --- END OF NEW PRE-CHECK ---


    // If the email doesn't exist, proceed with the original sign-up logic
    const origin = new URL(process.env.NEXT_PUBLIC_BASE_URL!).origin;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/confirm`
        },
    });

    if (error) {
        // This will now mostly catch other errors, like weak password (if not caught by Zod)
        return { message: error.message };
    }

    redirect(`/auth/sign-up-success?email=${encodeURIComponent(email)}`);
}


export type UpdatePasswordState = {
    message?: string | null;
    errors?: {
        password?: string[];
        confirmPassword?: string[];
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


export type ForgotPasswordState = {
    message?: string | null;
    errors?: {
        email?: string[];
    };
    success?: boolean;
};

// --- ADD THIS NEW SCHEMA ---
const ForgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export async function requestPasswordReset(
    prevState: ForgotPasswordState,
    formData: FormData
): Promise<ForgotPasswordState> {

    const supabase = await createClient();

    const validatedFields = ForgotPasswordSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid email.',
        };
    }

    const { email } = validatedFields.data;

    const origin = new URL(process.env.NEXT_PUBLIC_BASE_URL!).origin;

    // FIX: Redirect to /auth/confirm first to exchange the code for a session,
    // then forward the user to the reset-password page.
    const redirectTo = `${origin}/auth/confirm?next=/auth/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
    });

    if (error) {
        console.error('Password reset error:', error);
        return {
            success: true,
            message: 'If an account with this email exists, a reset link has been sent.'
        };
    }

    return {
        success: true,
        message: 'If an account with this email exists, a reset link has been sent.'
    };
}

// --- LOGOUT ACTION ---
export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();

    revalidatePath('/', 'layout');
    redirect('/'); // Redirect to the home page after logout is a better UX.
}



export async function signInWithGoogle() {
    const supabase = await createClient();
    const origin = (await headers()).get('origin');

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/confirm`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });

    if (error) {
        console.error('Google Sign In Error:', error);
        return { message: 'Could not authenticate with Google' };
    }

    if (data.url) {
        redirect(data.url);
    }
}