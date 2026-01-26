// app/delete-success/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlayWriteNewZealandFont, geistSans } from "@/app/ui/fonts";
import {
    ArrowPathIcon,
    HomeIcon,
    TvIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function DeleteSuccessPage() {
    return (
        <div className={clsx(
            "min-h-screen w-full flex items-center justify-center p-4 md:p-8",
            "bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100",
            geistSans.className
        )}>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-5xl grid md:grid-cols-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden relative"
            >

                {/* --- LEFT COLUMN: Cinematic Visual (The "Static" Screen) --- */}
                <div className="relative flex flex-col items-center justify-center min-h-[300px] md:min-h-[600px] bg-zinc-950 overflow-hidden border-b md:border-b-0 md:border-r border-zinc-800">

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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="w-20 h-20 flex items-center justify-center rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm"
                        >
                            <TvIcon className="w-10 h-10 text-zinc-400" />
                        </motion.div>

                        <div className="space-y-2">
                            <motion.h1
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className={`${PlayWriteNewZealandFont.className} text-4xl md:text-5xl font-bold text-white tracking-widest drop-shadow-lg`}
                            >
                                NO SIGNAL
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-[10px] font-mono uppercase tracking-[0.4em] text-red-500 animate-pulse"
                            >
                                ● Connection Lost
                            </motion.p>
                        </div>
                    </div>

                    {/* Technical Footer (Left Col) */}
                    <div className="absolute bottom-6 w-full px-8 flex justify-between text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                        <span>Err_410_Gone</span>
                        <span>Sys_Terminated</span>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: User Action Area --- */}
                <div className="flex flex-col justify-center p-8 md:p-16 bg-white dark:bg-black relative">

                    {/* Decorative Top Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent opacity-50" />

                    <div className="max-w-md mx-auto w-full space-y-8">

                        {/* Header Text */}
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm">
                                <span className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full" />
                                <span className="text-[10px] font-mono uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Account Deleted</span>
                            </div>

                            <h2 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-white">
                                Account Deletion Successful.
                            </h2>

                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
                                Your data has been deleted. All watch history, lists, and personal data have been permanently erased from the weave.
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-zinc-100 dark:bg-zinc-900" />

                        {/* Action Buttons */}
                        <div className="space-y-4 pt-2">
                            <Link
                                href="/auth/sign-up"
                                className="group relative w-full h-12 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-zinc-50 dark:text-zinc-950 text-sm font-medium transition-all hover:translate-y-[-1px] hover:shadow-lg overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <ArrowPathIcon className="w-4 h-4" />
                                    Create Account
                                </span>
                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-white/10 dark:bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </Link>

                            <Link
                                href="/"
                                className="w-full h-12 flex items-center justify-center gap-2 bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors text-sm font-medium"
                            >
                                <HomeIcon className="w-4 h-4" />
                                Return to Home
                            </Link>
                        </div>

                    </div>
                </div>
            </motion.div>

            {/* Background Texture for the whole page (Subtle) */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.05]"
                 style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                 }}
            />
        </div>
    );
}