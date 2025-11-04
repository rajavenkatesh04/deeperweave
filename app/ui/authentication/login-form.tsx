// app/auth/login/page.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { login, type AuthState } from '@/lib/actions/auth-actions';
import LoadingSpinner from "@/app/ui/loading-spinner";

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            // ✨ REBRANDED: Button colors changed from rose to orange
            className="flex w-full h-10 items-center justify-center rounded-lg bg-orange-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:bg-orange-400"
        >
            {pending ? <><LoadingSpinner className={`mr-2`}/>Signing In...</> : <span>Sign In</span>}
        </button>
    );
}

export default function LoginForm() {
    const initialState: AuthState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(login, initialState);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 dark:bg-zinc-950">
            <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-3xl">Welcome Back</h1>
                    {/* ✨ REBRANDED: Updated brand name */}
                    <p className="mt-2 text-gray-600 dark:text-zinc-400">Sign in to continue to Deeper Weave.</p>
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
                    </div>

                    <div>
                        {/* --- 👇 LINK ADDED HERE --- */}
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Password</label>
                            <Link
                                href="/auth/forgot-password"
                                // ✨ REBRANDED: Link color
                                className="text-sm font-medium text-orange-600 hover:underline dark:text-orange-500"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        {/* --- 👆 END OF CHANGE --- */}
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            // ✨ REBRANDED: Input focus colors
                            className="mt-2 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800"
                            required
                        />
                    </div>

                    {state?.message && (
                        <p className="text-sm text-red-600 dark:text-red-500">{state.message}</p>
                    )}

                    <LoginButton />
                </form>

                <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
                    Don&apos;t have an account?{' '}
                    {/* ✨ REBRANDED: Link color */}
                    <Link href="/auth/sign-up" className="font-medium text-orange-600 hover:underline dark:text-orange-500">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}