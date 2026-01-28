'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    HomeIcon,
    ArrowLeftIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    EnvelopeIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

export default function NotFound() {
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

            {/* Main Card Container */}
            <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white dark:bg-black border-2 border-orange-200 dark:border-orange-900/50 shadow-xl overflow-hidden rounded-lg transition-colors duration-500">

                {/* LEFT COLUMN: Visual Branding */}
                <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-white p-10 border-r border-zinc-200 dark:border-zinc-800 relative overflow-hidden min-h-[400px]">
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />
                    <div className="absolute inset-0 opacity-90 transition-colors duration-700 bg-radial-gradient to-black/90 from-orange-900/20" />

                    <div className="relative z-10 text-center space-y-6 max-w-xs">
                        <div className="mx-auto w-32 h-32 flex items-center justify-center rounded-full border backdrop-blur-sm transition-colors bg-orange-500/10 border-orange-500/20">
                            <ExclamationTriangleIcon className="w-16 h-16 text-orange-500" />
                        </div>

                        <div className="space-y-3">
                            <h2 className={`${PlayWriteNewZealandFont.className} text-4xl font-bold text-white tracking-tight`}>
                                Lost?
                            </h2>
                            <p className="text-sm font-medium text-zinc-400 italic">
                                "The page you are looking for has vanished."
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Action & Details */}
                <div className="flex flex-col justify-center p-8 md:p-10">

                    {/* Mobile Back Button */}
                    <div className="md:hidden mb-6">
                        <button
                            onClick={() => router.back()}
                            className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                            <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Go Back
                        </button>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white">
                            Page Not Found
                        </h1>
                        <p className="text-sm font-medium leading-relaxed p-3 border rounded transition-colors text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20">
                            We couldn't locate the page you requested. It might have been moved, deleted, or the URL might be incorrect.
                        </p>
                        {/* Removed font-mono here */}
                        <p className="mt-2 text-xs text-zinc-400">Error Code: 404</p>
                    </div>

                    {/* SUGGESTED ACTIONS */}
                    <div className="mb-8 pl-1">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Suggested Actions:
                        </h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                                <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-zinc-400" />
                                <span>Double-check the URL for typos.</span>
                            </li>
                            <li className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                                <ClockIcon className="h-4 w-4 shrink-0 text-zinc-400" />
                                <span>If you believe this is a mistake, please contact support.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        {/* Primary Action */}
                        <Link
                            href="/"
                            className="group flex w-full h-10 items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg active:scale-95 rounded-sm"
                        >
                            <HomeIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                            <span>Return Home</span>
                        </Link>

                        {/* Secondary Actions Row */}
                        <div className="flex gap-3">
                            <a
                                href="mailto:developer@deeperweave.com"
                                className="group flex flex-1 h-10 items-center justify-center gap-2 bg-white hover:bg-zinc-50 dark:bg-transparent dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-sm hover:border-orange-300 dark:hover:border-orange-800"
                            >
                                <EnvelopeIcon className="h-3 w-3 text-zinc-400 transition-colors group-hover:text-orange-500" />
                                <span>Contact Support</span>
                            </a>

                            <button
                                onClick={() => router.back()}
                                className="group flex flex-1 h-10 items-center justify-center gap-2 bg-white hover:bg-zinc-50 dark:bg-transparent dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-sm hover:border-orange-300 dark:hover:border-orange-800"
                            >
                                <ArrowLeftIcon className="h-3 w-3 text-zinc-400 transition-colors group-hover:text-orange-500" />
                                <span>Go Back</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}