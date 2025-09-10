'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signup, type AuthState } from '@/lib/actions/authActions';

function SignupButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex w-full h-10 items-center justify-center rounded-lg bg-rose-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:bg-rose-400"
        >
            {pending ? 'Creating Account...' : 'Create Account'}
        </button>
    );
}

export default function SignupForm() {
    const initialState: AuthState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(signup, initialState);

    return (
        // Added padding for spacing on small screens
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 dark:bg-zinc-950">
            {/* Added responsive padding to the card */}
            <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
                <div>
                    {/* Made heading text size responsive */}
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-3xl">Create your Account</h1>
                    <p className="mt-2 text-gray-600 dark:text-zinc-400">Get started with Liv today.</p>
                </div>

                <form action={dispatch} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"
                            required
                        />
                        {state?.errors?.email && (
                            <p className="mt-1 text-xs text-red-500">{state.errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Must be at least 8 characters"
                            className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"
                            required
                        />
                        {state?.errors?.password && (
                            <p className="mt-1 text-xs text-red-500">{state.errors.password}</p>
                        )}
                    </div>

                    {state?.message && !state.errors && (
                        <p className="text-sm text-red-600 dark:text-red-500">{state.message}</p>
                    )}

                    <SignupButton />
                </form>

                <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-medium text-rose-600 hover:underline dark:text-rose-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
