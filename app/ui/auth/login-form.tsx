// app/ui/auth/login-form.tsx
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { login, type AuthState } from '@/lib/actions/auth-actions';
import LoadingSpinner from "@/app/ui/loading-spinner";
import { PlayWriteNewZealandFont, geistSans } from "@/app/ui/fonts";
import {
    ArrowLeftIcon,
    EyeIcon,
    EyeSlashIcon,
    FilmIcon,
    LockClosedIcon
} from "@heroicons/react/24/outline";
import { GoogleButton } from './google-button';
import { motion } from 'framer-motion';
import clsx from 'clsx';

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="group relative w-full h-12 flex items-center justify-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-black text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md overflow-hidden rounded-sm"
        >
            <div className="relative z-10 flex items-center gap-2">
                {pending ? (
                    <><LoadingSpinner className="h-4 w-4"/> Authenticating...</>
                ) : (
                    <span>Sign In</span>
                )}
            </div>
        </button>
    );
}

export default function LoginForm({ item, type }: { item?: string; type?: string }) {
    const initialState: AuthState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(login, initialState);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={clsx(
            "min-h-screen w-full flex md:items-center md:justify-center relative",
            "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100",
            geistSans.className
        )}>

            {/* Desktop Only: Floating Back Button (Outside Card) */}
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:block absolute top-10 left-10 z-20"
            >
                <Link href="/" className="group flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
                    <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Studio
                </Link>
            </motion.div>

            {/* Main Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={clsx(
                    "w-full bg-white dark:bg-black overflow-hidden relative z-10 grid md:grid-cols-2",
                    // Mobile: Forced screen height
                    "h-screen",
                    // Desktop: Auto height (fits content), constrained width, rounded, borders
                    "md:h-auto md:min-h-[600px] md:max-w-5xl md:border md:border-zinc-200 md:dark:border-zinc-800 md:shadow-2xl md:rounded-lg"
                )}
            >

                {/* --- LEFT COLUMN: Cinematic Visual (Desktop Only) --- */}
                <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-white p-12 border-r border-zinc-800 relative overflow-hidden">
                    {/* Noise Texture */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                         style={{
                             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                         }}
                    />
                    <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/90 opacity-90" />

                    <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm text-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="w-24 h-24 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
                        >
                            <FilmIcon className="w-12 h-12 text-zinc-200" />
                        </motion.div>

                        <div className="space-y-4">
                            <motion.h2
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className={`${PlayWriteNewZealandFont.className} text-4xl font-bold text-white tracking-tight`}
                            >
                                Resume.
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-sm font-medium text-zinc-400 italic"
                            >
                                &quot;Pick up exactly where you left off.&quot;
                            </motion.p>
                        </div>
                    </div>

                    <div className="absolute bottom-8 w-full px-12 flex justify-between text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                        <span>Sc_01_Int_Studio</span>
                        <span>Rec_Mode</span>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Form Area --- */}
                <div className="flex flex-col h-full relative bg-white dark:bg-black p-6 md:p-12 lg:p-16">

                    {/* Mobile Header: Back Button (Inline) */}
                    <div className="md:hidden absolute top-6 left-6 z-20">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span className="sr-only">Back</span>
                        </Link>
                    </div>

                    {/* Centered Content Wrapper */}
                    <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                        <div className="mb-8">
                            {/* Status Badge: Hidden on Mobile */}
                            <div className="hidden md:inline-flex items-center gap-2 px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-sm mb-4">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">System Ready</span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-medium tracking-tight mb-2 text-zinc-900 dark:text-white">
                                Welcome back
                            </h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Enter your credentials to access the weave.
                            </p>
                        </div>

                        {/* Reusable Google Button */}
                        <GoogleButton />

                        {/* Divider */}
                        <div className="relative flex py-2 items-center my-6">
                            <div className="flex-grow border-t border-zinc-100 dark:border-zinc-800"></div>
                            <span className="flex-shrink-0 mx-4 text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Or with email</span>
                            <div className="flex-grow border-t border-zinc-100 dark:border-zinc-800"></div>
                        </div>

                        {/* Login Form */}
                        <form action={dispatch} className="space-y-5">
                            {item && <input type="hidden" name="post_login_item" value={item} />}
                            {type && <input type="hidden" name="post_login_type" value={type} />}

                            <div className="space-y-1.5">
                                <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="block w-full h-11 border-b border-zinc-200 dark:border-zinc-800 bg-transparent px-0 text-base placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                        Password
                                    </label>
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                    >
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="block w-full h-11 border-b border-zinc-200 dark:border-zinc-800 bg-transparent px-0 text-base placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none transition-colors pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-2 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-4 h-4" />
                                        ) : (
                                            <EyeIcon className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {state?.message && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-3 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 text-xs font-medium border border-red-100 dark:border-red-900/20 flex items-center gap-2 rounded-sm"
                                >
                                    <LockClosedIcon className="w-3 h-3 flex-shrink-0" />
                                    {state.message}
                                </motion.div>
                            )}

                            <div className="pt-2">
                                <LoginButton />
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                New here?{' '}
                                <Link href="/auth/sign-up" className="font-bold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4 transition-colors">
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}