// app/auth/reset-password/page.tsx
'use client';

// --- 👇 ADD THESE IMPORTS ---
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // Import your CLIENT-side createClient
// --- 👆 (Assuming you have a client component version.
// If not, let me know, but this is standard)

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { updatePassword, type UpdatePasswordState } from '@/lib/actions/auth-actions';
import LoadingSpinner from "@/app/ui/loading-spinner";

function UpdatePasswordButton() {
    // ... (This component is fine, no changes)
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex w-full h-10 items-center justify-center rounded-lg bg-orange-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:bg-orange-400"
        >
            {pending ? <><LoadingSpinner className={`mr-2`}/>Saving New Password...</> : <span>Update Password</span>}
        </button>
    );
}

export default function ResetPasswordForm() {
    const initialState: UpdatePasswordState = { message: null, errors: {}, success: false };
    const [state, dispatch] = useActionState(updatePassword, initialState);

    // --- 👇 ADD THIS STATE ---
    // We'll use state to wait for Supabase to be ready.
    const [isReady, setIsReady] = useState(false);
    const [authMessage, setAuthMessage] = useState<string | null>(null);

    // --- 👇 ADD THIS EFFECT TO HANDLE THE AUTH EVENT ---
    useEffect(() => {
        // This must be a client component Supabase client
        const supabase = createClient();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                // The auth event is complete. The session is set.
                // It's now safe to show the form.
                setIsReady(true);
                setAuthMessage(null);
            } else if (event === 'SIGNED_IN' && session === null) {
                // This can happen if the link is old, used, or invalid
                setAuthMessage('This password reset link is invalid or has expired.');
                setIsReady(true);
            } else if (event === 'INITIAL_SESSION') {
                // This handles the case where the page reloads *after* the session is set
                setIsReady(true);
            }
        });

        // Cleanup the listener on component unmount
        return () => {
            subscription.unsubscribe();
        };
    }, []);


    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 dark:bg-zinc-950">
            <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">

                {state.success ? (
                    // --- SUCCESS STATE (No change) ---
                    <div className="space-y-4 text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-3xl">Success!</h1>
                        <p className="text-gray-600 dark:text-zinc-400">
                            {state.message || 'Your password has been updated.'}
                        </p>
                        <p>
                            <Link
                                href="/auth/login"
                                className="font-medium text-orange-600 hover:underline dark:text-orange-500"
                            >
                                Click here to Sign In
                            </Link>
                        </p>
                    </div>
                ) : (
                    // --- 👇 WRAP YOUR FORM IN THIS LOGIC ---
                    !isReady ? (
                        // 1. LOADING STATE
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <LoadingSpinner className="w-8 h-8"/>
                            <p className="text-gray-600 dark:text-zinc-400">Verifying link...</p>
                        </div>
                    ) : authMessage ? (
                        // 2. INVALID LINK STATE
                        <div className="space-y-4 text-center">
                            <h1 className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-500">Link Invalid</h1>
                            <p className="text-gray-600 dark:text-zinc-400">
                                {authMessage}
                            </p>
                            <Link
                                href="/auth/forgot-password"
                                className="font-medium text-orange-600 hover:underline dark:text-orange-500"
                            >
                                Request a new link
                            </Link>
                        </div>
                    ) : (
                        // 3. READY STATE (Show the form)
                        <>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-3xl">Set a New Password</h1>
                                <p className="mt-2 text-gray-600 dark:text-zinc-400">
                                    Please enter your new password below.
                                </p>
                            </div>

                            {/* Your form is unchanged, just nested */}
                            <form action={dispatch} className="space-y-6">
                                <div>
                                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">New Password</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800"
                                        required
                                    />
                                    {state.errors?.password && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                                            {state.errors.password[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">Confirm New Password</label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800"
                                        required
                                    />
                                    {/* This is the line from your screenshot */}
                                    {state.errors?.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                                            {state.errors.confirmPassword[0]}
                                        </p>
                                    )}
                                </div>

                                {state.message && !state.success && (
                                    <p className="text-sm text-red-600 dark:text-red-500">{state.message}</p>
                                )}

                                <UpdatePasswordButton />
                            </form>
                        </>
                    )
                    // --- 👆 END OF NEW LOGIC WRAPPER ---
                )}
            </div>
        </div>
    );
}