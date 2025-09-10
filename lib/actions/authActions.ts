'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Schemas are unchanged
const LoginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
});

const SignupSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
});

export type AuthState = {
    message?: string | null;
    errors?: {
        email?: string[];
        password?: string[];
    };
};

// --- LOGIN ACTION ---
export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const supabase = await createClient(); // CORRECTED: No longer passing cookieStore

    const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid fields. Please check your email and password.',
        };
    }

    const { email, password } = validatedFields.data;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { message: error.message };
    }

    redirect('/profile');
}

// --- SIGNUP ACTION ---
export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
    const supabase = await createClient(); // CORRECTED: No longer passing cookieStore

    const validatedFields = SignupSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid fields. Please check the form for errors.',
        };
    }

    const { email, password } = validatedFields.data;

    // The origin is required for the PKCE flow to work on the server
    const origin = new URL(process.env.NEXT_PUBLIC_BASE_URL!).origin;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/confirm`
        },
    });

    if (error) {
        // You might want to return a more specific error message here
        // For example, if the user already exists.
        return { message: error.message };
    }

    redirect('/auth/sign-up-success');
}
