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
            className="group relative w-full h-12 flex items-center justify-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-black text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl overflow-hidden"
        >
            <div className="relative z-10 flex items-center gap-2">
                {pending ? (
                    <><LoadingSpinner className="h-4 w-4"/> Authenticating...</>
                ) : (
                    <span>Sign In</span>
                )}
            </div>
            {/* Subtle hover gleam effect */}
            <div className="absolute inset-0 bg-white/10 dark:bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
    );
}

export default function LoginForm({ item, type }: { item?: string; type?: string }) {
    const initialState: AuthState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(login, initialState);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={clsx(
            "min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative",
            "bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100",
            geistSans.className
        )}>
            {/* Ambient Background Noise */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
                 style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                 }}
            />

            {/* Desktop Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
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
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-5xl grid md:grid-cols-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden relative z-10"
            >

                {/* --- LEFT COLUMN: Cinematic Visual (Desktop) --- */}
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
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="w-32 h-32 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
                        >
                            <FilmIcon className="w-16 h-16 text-zinc-200" />
                        </motion.div>

                        <div className="space-y-4">
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className={`${PlayWriteNewZealandFont.className} text-5xl font-bold text-white tracking-tight drop-shadow-md`}
                            >
                                Resume.
                            </motion.h2>
                            <motion.p
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-sm font-medium text-zinc-400 italic"
                            >
                                "Pick up exactly where you left off."
                            </motion.p>
                        </div>
                    </div>

                    {/* Technical Footer (Desktop) */}
                    <div className="absolute bottom-10 w-full px-12 flex justify-between text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                        <span>Sc_01_Int_Studio</span>
                        <span>Roll_A_Take_1</span>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Form Area --- */}
                <div className="flex flex-col min-h-[600px] relative bg-white dark:bg-black">

                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent opacity-50" />

                    {/* Mobile Header (Visible only on mobile) */}
                    <div className="md:hidden relative bg-zinc-950 text-white py-12 px-6 text-center border-b border-zinc-800 overflow-hidden">
                        <div className="absolute inset-0 opacity-10"
                             style={{
                                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                             }}
                        />
                        <div className="relative z-10">
                            <Link href="/" className="absolute top-4 left-4 text-zinc-400">
                                <ArrowLeftIcon className="w-5 h-5" />
                            </Link>
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
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm mb-4">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-mono uppercase tracking-wide text-zinc-500 dark:text-zinc-400">System Ready</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-2 text-zinc-900 dark:text-white">
                                Welcome back
                            </h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">
                                Enter your credentials to access the weave.
                            </p>
                        </div>

                        {/* Reusable Google Button */}
                        <GoogleButton />

                        {/* DIVIDER */}
                        <div className="relative flex py-2 items-center mb-6">
                            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                            <span className="flex-shrink-0 mx-4 text-[10px] text-zinc-400 uppercase tracking-widest font-medium">Or with email</span>
                            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                        </div>

                        {/* EMAIL SIGN IN Form */}
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
                                        className="text-[10px] font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors hover:underline underline-offset-4"
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
                                    className="p-3 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 text-xs font-medium border border-red-100 dark:border-red-900/20 flex items-center gap-2"
                                >
                                    <LockClosedIcon className="w-3 h-3 flex-shrink-0" />
                                    {state.message}
                                </motion.div>
                            )}

                            <div className="pt-4">
                                <LoginButton />
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="mt-auto pt-8 text-center">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                                New to the archive?{' '}
                                <Link href="/auth/sign-up" className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4 transition-colors">
                                    Create account
                                </Link>
                            </p>

                            {/* Mobile Logo Footer */}
                            <div className="md:hidden opacity-50">
                                <span className={`${PlayWriteNewZealandFont.className} text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100`}>
                                    Deeper Weave
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}