'use client';

import { ChartBarIcon } from '@heroicons/react/24/outline';
import { geistSans } from "@/app/ui/fonts";

export default function Analytics() {
    return(
        <div className={`w-full min-h-[60vh] flex flex-col items-center justify-center p-4 text-zinc-900 dark:text-zinc-100 ${geistSans.className}`}>

            {/* Icon Container with subtle border/bg */}
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <ChartBarIcon className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                Analytics
            </h1>

            {/* Subtext */}
            <p className="text-zinc-500 dark:text-zinc-400 text-center max-w-sm text-sm md:text-base leading-relaxed">
                We are crafting deep insights for your logs. <br className="hidden md:block"/>
                Check back soon to see your growth and reach.
            </p>

            {/* Optional: "Work in Progress" Badge */}
            <div className="mt-8 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Coming Soon
                </span>
            </div>

        </div>
    )
}