// app/auth/login/page.tsx
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { login, type AuthState } from '@/lib/actions/auth-actions';
import LoadingSpinner from "@/app/ui/loading-spinner";
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex w-full h-11 items-center justify-center bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent"
        >
            {pending ? <><LoadingSpinner className="mr-2 h-4 w-4"/>Sign in...</> : <span>Sign In</span>}
        </button>
    );
}

export default function LoginForm() {
    const initialState: AuthState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(login, initialState);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex flex-col md:flex-row items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative">

            {/* Desktop Back Button (Absolute Top-Left) */}
            <div className="hidden md:block absolute top-10 left-10">
                <Link href="/" className="group flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
                    <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                </Link>
            </div>

            <div className="w-full max-w-[440px]">

                {/* Mobile Back Button (In-flow, above card) */}
                <div className="md:hidden mb-6">
                    <Link href="/" className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
                        <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back
                    </Link>
                </div>

                {/* Main Card Container */}
                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 shadow-sm">

                    {/* Header with Separator */}
                    <div className="mb-8 text-center md:text-left">
                        <Link href="/" className="inline-block mb-6">
                            <span className={`${PlayWriteNewZealandFont.className} text-3xl font-bold tracking-tight`}>
                                Deeper Weave
                            </span>
                        </Link>

                        {/* Visual Separator */}
                        <hr className="border-t border-zinc-100 dark:border-zinc-800 mb-6" />

                        <h1 className="text-2xl font-semibold tracking-tight mb-2">
                            Welcome back
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    {/* Form */}
                    <form action={dispatch} className="space-y-6">

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                className="block w-full h-11 border-b border-zinc-200 bg-transparent px-0 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Password
                                </label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors underline-offset-4 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="block w-full h-11 border-b border-zinc-200 bg-transparent px-0 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-2 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {state?.message && (
                            <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 text-xs font-medium border border-red-100 dark:border-red-900/20">
                                {state.message}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <LoginButton />
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Don&apos;t have an account?{' '}
                            <Link href="/auth/sign-up" className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}