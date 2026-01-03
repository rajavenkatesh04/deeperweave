'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowPathIcon,
    ExclamationTriangleIcon,
    HomeIcon,
    ArrowLeftIcon,
    SignalIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative">

            {/* Desktop Back Button (Fixed Top-Left) */}
            <div className="hidden md:block absolute top-8 left-8">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                    <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Go Back
                </button>
            </div>

            {/* Main Content Wrapper - Reduced max-width for a tighter fit */}
            <div className="w-full max-w-4xl">

                {/* Mobile Back Button */}
                <div className="md:hidden mb-4">
                    <button
                        onClick={() => router.back()}
                        className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                        <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Go Back
                    </button>
                </div>

                {/* Card Container (Split Layout) - Compact & Red Border */}
                <div className="grid md:grid-cols-2 bg-white dark:bg-black border-2 border-rose-200 dark:border-rose-900/50 shadow-xl overflow-hidden rounded-lg">

                    {/* LEFT COLUMN: Visual/Thematic Area (Desktop Only) */}
                    <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-white p-10 border-r border-zinc-200 dark:border-zinc-800 relative overflow-hidden min-h-[400px]">

                        {/* Film Grain Texture */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                             style={{
                                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                             }}
                        />
                        {/* Red Tint for Error Context */}
                        <div className="absolute inset-0 bg-radial-gradient from-rose-900/20 to-black/90 opacity-90" />

                        <div className="relative z-10 text-center space-y-6 max-w-xs">
                            <div className="mx-auto w-32 h-32 flex items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 backdrop-blur-sm">
                                <ExclamationTriangleIcon className="w-16 h-16 text-rose-500" />
                            </div>

                            <div className="space-y-3">
                                <h2 className={`${PlayWriteNewZealandFont.className} text-4xl font-bold text-white tracking-tight`}>
                                    Scene Missing.
                                </h2>
                                <p className="text-sm font-medium text-zinc-400 italic">
                                    "We apologize for the interruption."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: The Action/Details */}
                    <div className="flex flex-col justify-center p-8 md:p-10">

                        {/* Mobile Icon (Only shows on mobile) */}
                        <div className="md:hidden flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20">
                                <ExclamationTriangleIcon className="w-5 h-5 text-rose-500" />
                            </div>
                            <h2 className={`${PlayWriteNewZealandFont.className} text-xl font-bold text-zinc-900 dark:text-white`}>
                                Error.
                            </h2>
                        </div>

                        <div className="mb-6">
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white">
                                We're sorry, something went wrong.
                            </h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                We couldn't load this page. It's probably our fault, not yours.
                            </p>
                        </div>

                        {/* Simplified Tips - Compact */}
                        <div className="mb-6 rounded-md border border-rose-100 bg-rose-50 p-4 dark:border-rose-900/20 dark:bg-rose-950/10">
                            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-200">
                                What you can try:
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                                    <ArrowPathIcon className="h-4 w-4 shrink-0 text-rose-500" />
                                    <span>Try refreshing the page.</span>
                                </li>
                                <li className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                                    <SignalIcon className="h-4 w-4 shrink-0 text-rose-500" />
                                    <span>Check your internet connection.</span>
                                </li>
                                <li className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                                    <ClockIcon className="h-4 w-4 shrink-0 text-rose-500" />
                                    <span>Come back later.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Actions - Compact */}
                        <div className="space-y-3">
                            <button
                                onClick={() => reset()}
                                className="group flex w-full h-10 items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg active:scale-95 rounded-sm"
                            >
                                <ArrowPathIcon className="h-4 w-4 transition-transform group-hover:rotate-180" />
                                <span>Try Again</span>
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => router.back()}
                                    className="group flex flex-1 h-10 items-center justify-center gap-2 bg-white hover:bg-zinc-50 dark:bg-transparent dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-[10px] font-bold uppercase tracking-widest transition-colors hover:border-rose-300 dark:hover:border-rose-800 rounded-sm"
                                >
                                    <ArrowLeftIcon className="h-3 w-3 text-zinc-400 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors" />
                                    <span>Go Back</span>
                                </button>

                                <Link
                                    href="/"
                                    className="group flex flex-1 h-10 items-center justify-center gap-2 bg-white hover:bg-zinc-50 dark:bg-transparent dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-[10px] font-bold uppercase tracking-widest transition-colors hover:border-rose-300 dark:hover:border-rose-800 rounded-sm"
                                >
                                    <HomeIcon className="h-3 w-3 text-zinc-400 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors" />
                                    <span>Home</span>
                                </Link>
                            </div>
                        </div>

                        {/* Tiny Tech Digest (Very subtle) */}
                        {error.digest && (
                            <div className="mt-4 text-[10px] text-zinc-300 dark:text-zinc-700 font-mono text-center">
                                Error ID: {error.digest}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}