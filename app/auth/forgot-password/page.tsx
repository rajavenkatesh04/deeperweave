// app/auth/forgot-password/page.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { requestPasswordReset, type ForgotPasswordState } from '@/lib/actions/auth-actions';
import LoadingSpinner from "@/app/ui/loading-spinner";

function ForgotPasswordButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            // ✨ REBRANDED: Using consistent brand colors
            className="flex w-full h-10 items-center justify-center rounded-lg bg-orange-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:bg-orange-400"
        >
            {pending ? <><LoadingSpinner className={`mr-2`}/>Sending Link...</> : <span>Send Reset Link</span>}
        </button>
    );
}

export default function ForgotPasswordForm() {
    const initialState: ForgotPasswordState = { message: null, errors: {}, success: false };
    const [state, dispatch] = useActionState(requestPasswordReset, initialState);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 dark:bg-zinc-950">
            <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">

                {state.success ? (
                    // --- SUCCESS STATE ---
                    // Show this message *instead* of the form after success
                    <div className="space-y-4 text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-3xl">Check Your Email</h1>
                        <p className="text-gray-600 dark:text-zinc-400">
                            {state.message}
                        </p>
                        <p>
                            <Link
                                href="/auth/login"
                                className="font-medium text-orange-600 hover:underline dark:text-orange-500"
                            >
                                &larr; Back to Sign In
                            </Link>
                        </p>
                    </div>
                ) : (
                    // --- INITIAL STATE ---
                    // Show the form by default
                    <>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-3xl">Forgot Password?</h1>
                            <p className="mt-2 text-gray-600 dark:text-zinc-400">
                                No problem. Enter your email and we&apos;ll send you a link to reset your password.
                            </p>
                        </div>

                        <form action={dispatch} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    // ✨ REBRANDED: Input focus colors
                                    className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800"
                                    required
                                />
                                {state.errors?.email && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                                        {state.errors.email[0]}
                                    </p>
                                )}
                            </div>

                            {/* General error message (if not success) */}
                            {state.message && !state.success && (
                                <p className="text-sm text-red-600 dark:text-red-500">{state.message}</p>
                            )}

                            <ForgotPasswordButton />
                        </form>

                        <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
                            Remembered your password?{' '}
                            {/* ✨ REBRANDED: Link color */}
                            <Link href="/auth/login" className="font-medium text-orange-600 hover:underline dark:text-orange-500">
                                Sign in
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}