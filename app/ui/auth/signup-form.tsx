// app/auth/sign-up/page.tsx
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signup, type AuthState } from '@/lib/actions/auth-actions'; // Removed signInWithGoogle
import LoadingSpinner from "@/app/ui/loading-spinner";
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { GoogleButton } from '@/app/ui/auth/google-button'; // Import reusable component

function SignupButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex w-full h-12 items-center justify-center bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
            {pending ? <><LoadingSpinner className="mr-2 h-4 w-4"/>Creating...</> : <span>Create Account</span>}
        </button>
    );
}

export default function SignupForm() {
    const initialState: AuthState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(signup, initialState);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative">

            {/* Desktop Back Button (Fixed Top-Left) */}
            <div className="hidden md:block absolute top-10 left-10">
                <Link href="/" className="group flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
                    <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                </Link>
            </div>

            {/* Main Content Wrapper */}
            <div className="w-full max-w-5xl">

                {/* Mobile Back Button (Outside Card) */}
                <div className="md:hidden mb-6">
                    <Link href="/" className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
                        <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back
                    </Link>
                </div>

                {/* Card Container (Split Layout) */}
                <div className="grid md:grid-cols-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-sm md:shadow-2xl overflow-hidden">

                    {/* LEFT COLUMN: Visual/Thematic Area (Desktop Only) */}
                    <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-white p-12 border-r border-zinc-200 dark:border-zinc-800 relative overflow-hidden">

                        {/* Film Grain Texture */}
                        <div className="absolute inset-0 opacity-10"
                             style={{
                                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                             }}
                        />
                        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80 opacity-90" />

                        <div className="relative z-10 text-center space-y-8 max-w-sm">
                            <div className="mx-auto w-40 h-40 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                <VideoCameraIcon className="w-20 h-20 text-zinc-200" />
                            </div>

                            <div className="space-y-4">
                                <h2 className={`${PlayWriteNewZealandFont.className} text-5xl font-bold text-white tracking-tight`}>
                                    Act One.
                                </h2>
                                <p className="text-sm font-medium text-zinc-400 italic">
                                    &#34;Every great story has a beginning.&#34;
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: The Form */}
                    <div className="flex flex-col min-h-[600px]">

                        {/* Mobile Header: Visual with Grain (Visible only on mobile) */}
                        <div className="md:hidden relative bg-zinc-950 text-white py-12 px-6 text-center border-b border-zinc-800 overflow-hidden">
                            {/* Mobile Grain */}
                            <div className="absolute inset-0 opacity-10"
                                 style={{
                                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                 }}
                            />
                            <div className="relative z-10">
                                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-white/10 mb-4 backdrop-blur-md">
                                    <VideoCameraIcon className="w-6 h-6 text-white" />
                                </div>
                                <h2 className={`${PlayWriteNewZealandFont.className} text-3xl font-bold text-white mb-1`}>
                                    Act One.
                                </h2>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                                    Scene 1: The Setup
                                </p>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 lg:p-16 flex-1 flex flex-col justify-center">
                            <div className="mb-8 text-center md:text-left">
                                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
                                    Create account
                                </h1>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Start logging your cinema journey today.
                                </p>
                            </div>

                            {/* Reusable Google Button */}
                            <GoogleButton />

                            {/* DIVIDER */}
                            <div className="relative flex py-2 items-center mb-6">
                                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                                <span className="flex-shrink-0 mx-4 text-xs text-zinc-400 uppercase tracking-wider">Or with email</span>
                                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                            </div>

                            {/* Email Form */}
                            <form action={dispatch} className="space-y-6">

                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="block w-full h-12 border-b border-zinc-200 bg-transparent px-0 text-base placeholder:text-zinc-300 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors"
                                        required
                                    />
                                    {state?.errors?.email && (
                                        <p className="text-xs text-red-600 dark:text-red-400 font-medium animate-pulse">{state.errors.email[0]}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="At least 8 characters"
                                            className="block w-full h-12 border-b border-zinc-200 bg-transparent px-0 text-base placeholder:text-zinc-300 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors pr-10"
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
                                    {state?.errors?.password && (
                                        <p className="text-xs text-red-600 dark:text-red-400 font-medium animate-pulse">{state.errors.password[0]}</p>
                                    )}
                                </div>

                                {state?.message && (
                                    <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 text-xs font-medium border border-red-100 dark:border-red-900/20">
                                        {state.message}
                                    </div>
                                )}

                                <div className="pt-4">
                                    <SignupButton />
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="mt-auto pt-10 text-center">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                                    Already have an account?{' '}
                                    <Link href="/auth/login" className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4 transition-colors">
                                        Sign in
                                    </Link>
                                </p>

                                {/* Mobile Logo (Moved to bottom) */}
                                <div className="md:hidden">
                                    <Link href="/" className="inline-block opacity-50 grayscale hover:grayscale-0 transition-all">
                                        <span className={`${PlayWriteNewZealandFont.className} text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100`}>
                                            Deeper Weave
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}