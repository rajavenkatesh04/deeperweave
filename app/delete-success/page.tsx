// app/delete-success/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlayWriteNewZealandFont, geistSans } from "@/app/ui/fonts";
import {
    ArrowPathIcon,
    HomeIcon,
    TvIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function DeleteSuccessPage() {
    return (
        <div className={clsx(
            "min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative",
            "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100",
            geistSans.className
        )}>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-5xl grid md:grid-cols-2 bg-white dark:bg-black md:border border-zinc-200 dark:border-zinc-800 md:shadow-2xl overflow-hidden relative z-10"
            >

                {/* --- LEFT COLUMN: Cinematic Visual (Desktop Only) --- */}
                <div className="hidden md:flex flex-col items-center justify-center min-h-[600px] bg-zinc-950 overflow-hidden border-r border-zinc-800 relative">

                    {/* Animated Noise Texture */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                         style={{
                             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                         }}
                    />

                    {/* Vignette & Gradient */}
                    <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black opacity-90" />

                    {/* Content Layer */}
                    <div className="relative z-10 flex flex-col items-center text-center space-y-6 p-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-20 h-20 flex items-center justify-center rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm"
                        >
                            <TvIcon className="w-10 h-10 text-zinc-400" />
                        </motion.div>

                        <div className="space-y-2">
                            <motion.h1
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className={`${PlayWriteNewZealandFont.className} text-5xl font-bold text-white tracking-widest drop-shadow-lg`}
                            >
                                NO SIGNAL
                            </motion.h1>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center justify-center gap-2 text-red-500 animate-pulse"
                            >
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Connection Lost</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* Footer Info (Desktop) */}
                    <div className="absolute bottom-10 w-full px-12 flex justify-between text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                        <span>ERR_410_GONE</span>
                        <span>SYS_TERMINATED</span>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: User Action Area --- */}
                <div className="flex flex-col justify-center p-6 md:p-16 bg-white dark:bg-black relative min-h-[500px]">

                    {/* Mobile Top Bar (Minimal) */}
                    <div className="md:hidden absolute top-0 left-0 w-full p-6">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <span className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">We will miss you 💔</span>
                        </div>
                    </div>

                    <div className="max-w-md mx-auto w-full space-y-8 mt-12 md:mt-0">

                        {/* Content */}
                        <div className="space-y-4">
                            {/* Desktop Badge */}
                            <div className="hidden md:inline-flex items-center gap-2 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm">
                                <span className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full" />
                                <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Account Deleted</span>
                            </div>

                            <h2 className="text-3xl font-medium tracking-tight text-zinc-900 dark:text-white">
                                Account Deletion Successful.
                            </h2>

                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Your data has been deleted. All watch history, lists, and personal data have been permanently erased from the weave.
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-zinc-100 dark:bg-zinc-900" />

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Link
                                href="/auth/sign-up"
                                className="group relative w-full h-12 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-zinc-50 dark:text-zinc-950 text-sm font-bold transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-sm overflow-hidden shadow-sm"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <ArrowPathIcon className="w-4 h-4" />
                                    Create Account
                                </span>
                            </Link>

                            <Link
                                href="/"
                                className="w-full h-12 flex items-center justify-center gap-2 bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors text-sm font-bold rounded-sm"
                            >
                                <HomeIcon className="w-4 h-4" />
                                Return to Home
                            </Link>
                        </div>

                    </div>
                </div>
            </motion.div>

            {/* Background Texture (Page Level) */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.05]"
                 style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                 }}
            />
        </div>
    );
}