// app/auth/login/page.tsx
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { login, type AuthState } from '@/lib/actions/auth-actions';
import LoadingSpinner from "@/app/ui/loading-spinner";
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, FilmIcon } from "@heroicons/react/24/outline";

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex w-full h-12 items-center justify-center bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
            {pending ? <><LoadingSpinner className="mr-2 h-4 w-4"/>Signing In...</> : <span>Sign In</span>}
        </button>
    );
}

export default function LoginForm({ item, type }: { item?: string; type?: string }) {
    const initialState: AuthState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(login, initialState);
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
                                <FilmIcon className="w-20 h-20 text-zinc-200" />
                            </div>

                            <div className="space-y-4">
                                <h2 className={`${PlayWriteNewZealandFont.className} text-5xl font-bold text-white tracking-tight`}>
                                    Resume.
                                </h2>
                                <p className="text-sm font-medium text-zinc-400 italic">
                                    "Pick up exactly where you left off."
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
                                    <FilmIcon className="w-6 h-6 text-white" />
                                </div>
                                <h2 className={`${PlayWriteNewZealandFont.className} text-3xl font-bold text-white mb-1`}>
                                    Resume.
                                </h2>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                                    Scene: The Return
                                </p>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 lg:p-16 flex-1 flex flex-col justify-center">
                            <div className="mb-8 text-center md:text-left">
                                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
                                    Welcome back
                                </h1>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Enter your credentials to access the weave.
                                </p>
                            </div>

                            {/* Form */}
                            <form action={dispatch} className="space-y-6">

                                {/* These hidden inputs pass the values to the server action */}
                                {item && <input type="hidden" name="post_login_item" value={item} />}
                                {type && <input type="hidden" name="post_login_type" value={type} />}

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
                                </div>

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
                                </div>

                                {state?.message && (
                                    <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 text-xs font-medium border border-red-100 dark:border-red-900/20">
                                        {state.message}
                                    </div>
                                )}

                                <div className="pt-4">
                                    <LoginButton />
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="mt-auto pt-10 text-center">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                                    Don&apos;t have an account?{' '}
                                    <Link href="/auth/sign-up" className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4 transition-colors">
                                        Sign up
                                    </Link>
                                </p>

                                {/* Mobile Logo (Footer) */}
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