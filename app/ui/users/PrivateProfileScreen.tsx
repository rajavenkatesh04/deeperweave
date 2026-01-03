'use client';

import { LockClosedIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

export default function PrivateProfileScreen() {
    return (
        <div className="relative w-full py-24 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">

            {/* --- 1. TECHNICAL BACKGROUND --- */}

            {/* Dot Matrix Pattern */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                 style={{
                     backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                     backgroundSize: '20px 20px'
                 }}
            />

            {/* Film Noise Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* --- 2. MAIN CONTENT --- */}
            <div className="relative z-10 max-w-md px-6">

                {/* Icon Box (Sharp & High Contrast) */}
                <div className="mx-auto w-16 h-16 flex items-center justify-center border-2 border-zinc-900 dark:border-zinc-100 mb-8 bg-white dark:bg-black shadow-none rotate-45">
                    <LockClosedIcon className="w-8 h-8 text-zinc-900 dark:text-zinc-100 -rotate-45" />
                </div>

                {/* Status Label */}
                <div className="flex items-center justify-center gap-2 mb-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500">
                    <ShieldExclamationIcon className="w-3 h-3" />
                    <span>Profile Locked // 001</span>
                </div>

                {/* Headline */}
                <h2 className={`${PlayWriteNewZealandFont.className} text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 leading-tight`}>
                    Access Restricted
                </h2>

                {/* Divider Line */}
                <div className="h-px w-16 bg-zinc-300 dark:bg-zinc-700 mx-auto mb-5" />

                {/* Description Text */}
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
                    This timeline is currently private.
                    <br />
                    follow to view the weave.
                </p>
            </div>

            {/* --- 3. DECORATIVE CORNERS (Camera Frame Look) --- */}
            <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-zinc-300 dark:border-zinc-800" />
            <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-zinc-300 dark:border-zinc-800" />
            <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-zinc-300 dark:border-zinc-800" />
            <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-zinc-300 dark:border-zinc-800" />

        </div>
    );
}