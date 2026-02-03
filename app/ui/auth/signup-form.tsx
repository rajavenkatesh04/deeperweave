// app/auth/sign-up/page.tsx
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signup, type AuthState } from '@/lib/actions/auth-actions';
import LoadingSpinner from "@/app/ui/loading-spinner";
import { PlayWriteNewZealandFont, geistSans } from "@/app/ui/fonts";
import {
    ArrowLeftIcon,
    EyeIcon,
    EyeSlashIcon,
    VideoCameraIcon,
    ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import { GoogleButton } from '@/app/ui/auth/google-button';
import { motion } from 'framer-motion';
import clsx from 'clsx';

function SignupButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="group relative w-full h-12 flex items-center justify-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-black text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md overflow-hidden rounded-sm"
        >
            <div className="relative z-10 flex items-center gap-2">
                {pending ? (
                    <><LoadingSpinner className="h-4 w-4"/> Creating...</>
                ) : (
                    <span>Create Account</span>
                )}
            </div>
        </button>
    );
}

export default function SignupForm() {
    const initialState: AuthState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(signup, initialState);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={clsx(
            "min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative",
            "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100",
            geistSans.className
        )}>

            {/* Desktop Back Button */}
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
                className="w-full max-w-5xl grid md:grid-cols-2 bg-white dark:bg-black md:border border-zinc-200 dark:border-zinc-800 md:shadow-2xl overflow-hidden relative z-10"
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
                            className="w-32 h-32 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
                        >
                            <VideoCameraIcon className="w-16 h-16 text-zinc-200" />
                        </motion.div>

                        <div className="space-y-4">
                            <motion.h2
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className={`${PlayWriteNewZealandFont.className} text-5xl font-bold text-white tracking-tight`}
                            >
                                Act One.
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-sm font-medium text-zinc-400 italic"
                            >
                                "Every great story has a beginning."
                            </motion.p>
                        </div>
                    </div>

                    {/* Footer Info (Desktop) */}
                    <div className="absolute bottom-10 w-full px-12 flex justify-between text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                        <span>Sc_01_Int_Archive</span>
                        <span>Take_1</span>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Form Area --- */}
                <div className="flex flex-col min-h-[500px] md:min-h-[600px] relative bg-white dark:bg-black">

                    {/* Mobile Back Button (Minimal) */}
                    <div className="md:hidden pt-8 px-6 pb-2">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                            <ArrowLeftIcon className="w-4 h-4" />
                            Back
                        </Link>
                    </div>

                    <div className="p-6 md:p-12 lg:p-16 flex-1 flex flex-col justify-center">
                        <div className="mb-8 md:mb-10">
                            {/* Minimal Badge - Replaces big header on mobile */}
                            <div className="inline-flex items-center gap-2 px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-sm mb-4">
                                <span className="w-1.5 h-1.5 bg-zinc-900 dark:bg-white rounded-full" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Scene 1: The Setup</span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-medium tracking-tight mb-2 text-zinc-900 dark:text-white">
                                Create account
                            </h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Start logging your cinema journey today.
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

                        {/* Sign Up Form */}
                        <form action={dispatch} className="space-y-5">

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
                                {state?.errors?.email && (
                                    <motion.p
                                        initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                                        className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-1"
                                    >
                                        <ExclamationCircleIcon className="w-3 h-3" />
                                        {state.errors.email[0]}
                                    </motion.p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="At least 8 characters"
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
                                {state?.errors?.password && (
                                    <motion.p
                                        initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                                        className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-1"
                                    >
                                        <ExclamationCircleIcon className="w-3 h-3" />
                                        {state.errors.password[0]}
                                    </motion.p>
                                )}
                            </div>

                            {state?.message && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-3 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 text-xs font-medium border border-red-100 dark:border-red-900/20 rounded-sm"
                                >
                                    {state.message}
                                </motion.div>
                            )}

                            <div className="pt-2">
                                <SignupButton />
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="mt-auto pt-8 text-center md:text-left">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Already have an account?{' '}
                                <Link href="/auth/login" className="font-bold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}