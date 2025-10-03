'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signup, type AuthState } from '@/lib/actions/auth-actions';
import LoadingSpinner from "@/app/ui/loading-spinner";

function SignupButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            // ✨ REBRANDED: Button colors
            className="flex w-full h-10 items-center justify-center rounded-lg bg-orange-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:bg-orange-400"
        >
            {pending ? <><LoadingSpinner className={`mr-2`}/><span>Creating Account...</span></> : <span>Create Account</span>}
        </button>
    );
}

export default function SignupForm() {
    const initialState: AuthState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(signup, initialState);

    return (
        // ✨ REBRANDED: Background colors
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 dark:bg-[#121212]">
            {/* ✨ REBRANDED: Card colors and shadow */}
            <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-[#1c1c1c] dark:shadow-2xl dark:shadow-orange-500/10 sm:p-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-3xl">Create your Account</h1>
                    {/* ✨ REBRANDED: Copy */}
                    <p className="mt-2 text-gray-600 dark:text-zinc-400">Start your journey with Deeper Weave.</p>
                </div>

                <form action={dispatch} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            // ✨ REBRANDED: Input styles
                            className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800"
                            required
                        />
                        {state?.errors?.email && (
                            <p className="mt-1 text-xs text-red-500">{state.errors.email[0]}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Must be at least 8 characters"
                            // ✨ REBRANDED: Input styles
                            className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800"
                            required
                        />
                        {state?.errors?.password && (
                            <p className="mt-1 text-xs text-red-500">{state.errors.password[0]}</p>
                        )}
                    </div>

                    {state?.message && (
                        <p className="text-sm text-red-600 dark:text-red-500">{state.message}</p>
                    )}

                    <SignupButton />
                </form>

                <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
                    Already have an account?{' '}
                    {/* ✨ REBRANDED: Link colors */}
                    <Link href="/auth/login" className="font-medium text-orange-600 hover:underline dark:text-orange-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}