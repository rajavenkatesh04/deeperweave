'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowPathIcon, ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-24 text-center dark:bg-zinc-950 overflow-hidden">

            {/* --- TECHNICAL BACKGROUND --- */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed"
                 style={{
                     backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                     backgroundSize: '24px 24px'
                 }}
            />
            <div className="absolute inset-0 opacity-10 pointer-events-none fixed"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            <div className="relative z-10 max-w-2xl w-full space-y-8">

                {/* 1. The Icon (Pulsing Red) */}
                <div className="mx-auto w-20 h-20 flex items-center justify-center bg-rose-100 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-900 rounded-sm">
                    <ExclamationTriangleIcon className="h-10 w-10 text-rose-600 dark:text-rose-500" />
                </div>

                {/* 2. Typography */}
                <div className="space-y-4">
                    <h1 className={`${PlayWriteNewZealandFont.className} text-4xl sm:text-6xl font-bold text-zinc-900 dark:text-zinc-100 leading-none`}>
                        System Failure.
                    </h1>

                    <p className="mx-auto max-w-md text-base text-zinc-600 dark:text-zinc-400 font-mono">
                        // CRITICAL_PROCESS_DIED <br/>
                        <span className="text-xs opacity-70">The cinematic weave has encountered an unexpected interruption.</span>
                    </p>
                </div>

                {/* 3. Technical Digest (The "Code Block") */}
                {error.digest && (
                    <div className="mx-auto max-w-sm p-4 bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-left">
                        <p className="text-zinc-400 uppercase tracking-widest mb-1">Error Digest Log:</p>
                        <p className="text-rose-600 dark:text-rose-400 break-all">
                            {'>'} {error.digest}
                        </p>
                    </div>
                )}

                {/* 4. Actions (Technical Buttons) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => reset()}
                        className="group flex w-full sm:w-auto h-12 items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-8 text-xs font-bold uppercase tracking-widest transition-all shadow-lg"
                    >
                        <ArrowPathIcon className="h-4 w-4 transition-transform group-hover:rotate-180" />
                        <span>Reboot System</span>
                    </button>

                    <Link
                        href="/"
                        className="group flex w-full sm:w-auto h-12 items-center justify-center gap-3 bg-white hover:bg-zinc-50 dark:bg-black dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 px-8 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                        <HomeIcon className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
                        <span>Return Home</span>
                    </Link>
                </div>
            </div>

            {/* Decorative Corner Markers */}
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-rose-500/20" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-rose-500/20" />

        </main>
    );
}