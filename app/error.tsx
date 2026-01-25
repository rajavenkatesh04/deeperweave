'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowPathIcon,
    ExclamationTriangleIcon,
    HomeIcon,
    ArrowLeftIcon,
    SignalIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

// We need to wrap the search params logic in Suspense for Next.js client builds
function ErrorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get error details from URL
    const errorMsg = searchParams.get('error') || "An unexpected error occurred.";
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    // Also try to read hash fragment for Supabase redirects (often contain the real error)
    const [hashError, setHashError] = useState<string | null>(null);

    useEffect(() => {
        // Supabase sometimes puts errors in the URL hash (#error=...)
        if (typeof window !== 'undefined' && window.location.hash) {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const desc = params.get('error_description');
            if (desc) setHashError(decodeURIComponent(desc.replace(/\+/g, ' ')));
        }
    }, []);

    // Prioritize the most detailed error message we found
    const finalErrorMessage = hashError || errorDescription || errorMsg;

    return (
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

            {/* Card Container */}
            <div className="grid md:grid-cols-2 bg-white dark:bg-black border-2 border-rose-200 dark:border-rose-900/50 shadow-xl overflow-hidden rounded-lg">

                {/* LEFT COLUMN: Visual */}
                <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-white p-10 border-r border-zinc-200 dark:border-zinc-800 relative overflow-hidden min-h-[400px]">
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />
                    <div className="absolute inset-0 bg-radial-gradient from-rose-900/20 to-black/90 opacity-90" />

                    <div className="relative z-10 text-center space-y-6 max-w-xs">
                        <div className="mx-auto w-32 h-32 flex items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 backdrop-blur-sm">
                            <ExclamationTriangleIcon className="w-16 h-16 text-rose-500" />
                        </div>

                        <div className="space-y-3">
                            <h2 className={`${PlayWriteNewZealandFont.className} text-4xl font-bold text-white tracking-tight`}>
                                Cut!
                            </h2>
                            <p className="text-sm font-medium text-zinc-400 italic">
                                "We encountered a script error."
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Action */}
                <div className="flex flex-col justify-center p-8 md:p-10">
                    <div className="mb-6">
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white">
                            Authentication Failed
                        </h1>
                        <p className="text-sm text-rose-600 dark:text-rose-400 font-medium leading-relaxed bg-rose-50 dark:bg-rose-900/10 p-3 border border-rose-100 dark:border-rose-900/20 rounded">
                            {finalErrorMessage}
                        </p>
                        {errorCode && (
                            <p className="mt-2 text-xs text-zinc-400 font-mono">Code: {errorCode}</p>
                        )}
                    </div>

                    <div className="mb-6 rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
                            Suggested Actions:
                        </h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                                <ArrowPathIcon className="h-4 w-4 shrink-0 text-zinc-500" />
                                <span>Try signing in again.</span>
                            </li>
                            <li className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                                <ClockIcon className="h-4 w-4 shrink-0 text-zinc-500" />
                                <span>Wait a moment and refresh.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="/auth/login"
                            className="group flex w-full h-10 items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg active:scale-95 rounded-sm"
                        >
                            <ArrowPathIcon className="h-4 w-4 transition-transform group-hover:rotate-180" />
                            <span>Try Again</span>
                        </Link>

                        <div className="flex gap-3">
                            <Link
                                href="/"
                                className="group flex flex-1 h-10 items-center justify-center gap-2 bg-white hover:bg-zinc-50 dark:bg-transparent dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-[10px] font-bold uppercase tracking-widest transition-colors hover:border-rose-300 dark:hover:border-rose-800 rounded-sm"
                            >
                                <HomeIcon className="h-3 w-3 text-zinc-400 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors" />
                                <span>Home</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative">
            {/* Desktop Back Button */}
            <div className="hidden md:block absolute top-8 left-8">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                    <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Go Back
                </button>
            </div>

            <Suspense fallback={<div className="text-zinc-500">Loading error details...</div>}>
                <ErrorContent />
            </Suspense>
        </div>
    );
}