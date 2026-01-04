'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeftIcon,
    HomeIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative">

            {/* Desktop Back Button (Fixed Top-Left) */}
            <div className="hidden md:block absolute top-10 left-10">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                    <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Previous
                </button>
            </div>

            {/* Main Content Wrapper */}
            <div className="w-full max-w-5xl">

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

                {/* Card Container (Split Layout) - Matches Login/Signup Aesthetic */}
                <div className="grid md:grid-cols-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden rounded-sm">

                    {/* LEFT COLUMN: Visual/Atmospheric (Desktop Only) */}
                    <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-white p-12 border-r border-zinc-900 relative overflow-hidden min-h-[500px]">

                        {/* 1. Grain Texture (The "Richness" Factor) */}
                        <div className="absolute inset-0 opacity-15 pointer-events-none"
                             style={{
                                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                             }}
                        />

                        {/* 2. Amber Glow/Gradient (Replaces the flat red) */}
                        <div className="absolute inset-0 bg-radial-gradient from-orange-900/30 via-zinc-950/80 to-zinc-950 opacity-100" />

                        {/* 3. The Visual Centerpiece */}
                        <div className="relative z-10 text-center space-y-8 max-w-sm">

                            {/* Glassmorphism Icon Container */}
                            <div className="mx-auto w-40 h-40 flex items-center justify-center rounded-full bg-orange-500/5 border border-orange-500/20 backdrop-blur-md shadow-[0_0_40px_-10px_rgba(249,115,22,0.3)]">
                                <span className={`${PlayWriteNewZealandFont.className} text-6xl font-bold text-orange-500/90`}>
                                    404
                                </span>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-white tracking-tight">
                                    Page Not Found
                                </h2>
                                <div className="h-px w-12 bg-orange-500/50 mx-auto" />
                                <p className="text-sm font-medium text-zinc-500 font-mono uppercase tracking-widest">
                                    Error_Code: Missing_Link
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Actionable Content */}
                    <div className="flex flex-col justify-center p-8 md:p-16 bg-white dark:bg-black relative">

                        {/* Mobile Header (Visible only on mobile) */}
                        <div className="md:hidden flex items-center gap-4 mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-500/10 border border-orange-500/20">
                                <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h1 className={`${PlayWriteNewZealandFont.className} text-2xl font-bold text-zinc-900 dark:text-white`}>
                                    404
                                </h1>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Page Not Found</p>
                            </div>
                        </div>

                        <div className="mb-10">
                            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4 text-zinc-900 dark:text-white">
                                We couldn't find that page.
                            </h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                The link you clicked might be broken, or the page may have been removed from the archives.
                            </p>
                        </div>

                        {/* Helpful Actions */}
                        <div className="space-y-4">

                            {/* Primary Button */}
                            <Link
                                href="/"
                                className="group flex w-full h-12 items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-sm font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                            >
                                <HomeIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                                <span>Return Home</span>
                            </Link>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => router.back()}
                                    className="group flex h-12 items-center justify-center gap-2 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold uppercase tracking-widest transition-colors"
                                >
                                    <ArrowLeftIcon className="h-3 w-3 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                                    <span>Go Back</span>
                                </button>

                                <Link
                                    href="/search"
                                    className="group flex h-12 items-center justify-center gap-2 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold uppercase tracking-widest transition-colors"
                                >
                                    <MagnifyingGlassIcon className="h-3 w-3 text-zinc-400 group-hover:text-orange-500 transition-colors" />
                                    <span>Search</span>
                                </Link>
                            </div>
                        </div>

                        {/* Footer decorative text */}
                        <div className="mt-12 pt-6 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                            <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center">
                                If you believe this is a mistake, please contact support.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}