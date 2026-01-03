'use client';

import Link from 'next/link';
import { ArrowLeftIcon, MagnifyingGlassIcon, FilmIcon } from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

export default function NotFound() {
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

            <div className="relative z-10 max-w-2xl w-full space-y-10">

                {/* 1. The "Lost Reel" Graphic */}
                <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                    {/* Outer Ring */}
                    <div className="absolute inset-0 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-full animate-[spin_10s_linear_infinite]" />

                    {/* Inner Square */}
                    <div className="w-20 h-20 bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center transform -rotate-6 shadow-xl">
                        <span className="text-3xl font-black text-white dark:text-black">404</span>
                    </div>

                    {/* Decorative Crosshairs */}
                    <div className="absolute top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800" />
                    <div className="absolute left-0 right-0 h-px bg-zinc-200 dark:bg-zinc-800" />
                </div>

                {/* 2. Typography */}
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
                        <FilmIcon className="w-4 h-4" />
                        <span>Scene Missing</span>
                    </div>

                    <h1 className={`${PlayWriteNewZealandFont.className} text-5xl sm:text-7xl font-bold text-zinc-900 dark:text-zinc-100 leading-none`}>
                        Footage Not Found.
                    </h1>

                    <p className="mx-auto max-w-md text-sm md:text-base text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                        The reel you are looking for has been cut from the final edit or does not exist in this archive.
                    </p>
                </div>

                {/* 3. Actions (Technical Buttons) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Link
                        href="/"
                        className="group flex w-full sm:w-auto h-12 items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-8 text-xs font-bold uppercase tracking-widest transition-all shadow-lg"
                    >
                        <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span>Return to Set</span>
                    </Link>

                    <Link
                        href="/discover"
                        className="group flex w-full sm:w-auto h-12 items-center justify-center gap-3 bg-white hover:bg-zinc-50 dark:bg-black dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 px-8 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                        <MagnifyingGlassIcon className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
                        <span>Search Archives</span>
                    </Link>
                </div>

                {/* 4. Footer Meta */}
                <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800/50 w-full max-w-xs mx-auto">
                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                        Error Code: 404_NOT_FOUND
                    </p>
                </div>
            </div>

        </main>
    );
}