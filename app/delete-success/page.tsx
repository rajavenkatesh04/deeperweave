// app/delete-success/page.tsx
'use client';

import Link from 'next/link';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import {
    VideoCameraSlashIcon,
    ArrowPathIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function DeleteSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

            {/* Main Container */}
            <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-sm md:shadow-2xl overflow-hidden">

                {/* LEFT COLUMN: Desktop Visual */}
                <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-zinc-500 p-12 border-r border-zinc-800 relative overflow-hidden">

                    {/* Noise Background */}
                    <div className="absolute inset-0 opacity-10"
                         style={{
                             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                         }}
                    />
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-80" />

                    <div className="relative z-10 flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-zinc-500/20 blur-2xl rounded-full" />
                            <VideoCameraSlashIcon className="w-24 h-24 text-zinc-200 relative z-10" />
                        </div>

                        <div className="space-y-2 text-center">
                            <h1 className={`${PlayWriteNewZealandFont.className} text-4xl font-bold text-white tracking-widest`}>
                                NO SIGNAL
                            </h1>
                            <p className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">
                                00:00:00:00
                            </p>
                        </div>
                    </div>

                    <div className="absolute bottom-10 w-full px-12 flex justify-between text-[10px] font-mono text-zinc-700 uppercase">
                        <span>Err_Connection_Lost</span>
                        <span>Sys_Offline</span>
                    </div>
                </div>

                {/* RIGHT COLUMN: Content */}
                <div className="flex flex-col justify-center bg-white dark:bg-zinc-950">

                    {/* MOBILE HEADER: "No Signal" Visual (Visible only on small screens) */}
                    <div className="md:hidden relative bg-zinc-950 py-16 px-8 flex flex-col items-center justify-center overflow-hidden border-b border-zinc-800">
                        {/* Noise Background (Mobile) */}
                        <div className="absolute inset-0 opacity-10"
                             style={{
                                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                             }}
                        />
                        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-80" />

                        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                            <VideoCameraSlashIcon className="w-12 h-12 text-zinc-200" />
                            <h1 className={`${PlayWriteNewZealandFont.className} text-3xl font-bold text-white tracking-widest`}>
                                NO SIGNAL
                            </h1>
                            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                                SYSTEM_HALTED
                            </p>
                        </div>
                    </div>

                    <div className="p-8 md:p-16">
                        <div className="mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-full mb-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">Account Terminated</span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4 text-zinc-900 dark:text-white">
                                The screen has gone dark.
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
                                Your account, watch history, and connections have been successfully erased.
                                It’s quiet in here without your reviews.
                            </p>
                        </div>

                        {/* Recovery Data Stats */}
                        <div className="grid grid-cols-2 gap-px bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 mb-12">
                            <div className="bg-white dark:bg-zinc-950 p-6">
                                <div className="text-3xl font-light text-zinc-900 dark:text-zinc-100">89%</div>
                                <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium mt-1">Of users return</div>
                            </div>
                            <div className="bg-white dark:bg-zinc-950 p-6">
                                <div className="text-3xl font-light text-zinc-900 dark:text-zinc-100">2 Days</div>
                                <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium mt-1">Avg. Break Time</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <Link
                                href="/auth/sign-up"
                                className="group flex w-full h-14 items-center justify-between px-6 bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all border border-transparent shadow-lg"
                            >
                                <span className="text-sm font-bold tracking-wide">REBOOT SYSTEM</span>
                                <ArrowPathIcon className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
                            </Link>

                            <Link
                                href="/"
                                className="group flex w-full h-14 items-center justify-between px-6 bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                            >
                                <span className="text-sm font-medium">Leave Studio</span>
                                <XMarkIcon className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}