'use client';

import { useMemo } from 'react';
import { TvIcon } from '@heroicons/react/24/outline';

interface PlatformChartProps {
    platforms: { name: string; count: number }[];
    totalLogs: number;
    isOwner: boolean;
}

// "Cinematic Fire" Palette (cycling colors)
const COLORS = [
    '#18181b', // Zinc-950 (Main/Black)
    '#f59e0b', // Amber-500
    '#ef4444', // Red-500
    '#71717a', // Zinc-500
    '#fbbf24', // Amber-400
    '#dc2626', // Red-600
];

export default function PlatformChart({ platforms, totalLogs, isOwner }: PlatformChartProps) {

    // Calculate segments for the SVG Donut
    const segments = useMemo(() => {
        let cumulativePercent = 0;
        return platforms.map((plat, i) => {
            const percent = plat.count / totalLogs;
            const start = cumulativePercent; // Start where previous ended
            cumulativePercent += percent;
            return {
                ...plat,
                percent,
                start,
                color: COLORS[i % COLORS.length]
            };
        });
    }, [platforms, totalLogs]);

    // If no data
    if (platforms.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 min-h-[300px]">
                <TvIcon className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">No platform data found</p>
            </div>
        );
    }

    const leastUsed = platforms[platforms.length - 1];
    const showTip = isOwner && platforms.length > 2;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <TvIcon className="w-4 h-4 text-zinc-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                    Platform Split
                </h3>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[220px]">
                {/* SVG DONUT CHART */}
                <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {segments.map((seg, i) => {
                            // SVG Math: Circumference of r=40 is approx 251.2
                            const circumference = 2 * Math.PI * 40;
                            const dashArray = `${seg.percent * circumference} ${circumference}`;
                            const dashOffset = -seg.start * circumference;

                            return (
                                <circle
                                    key={seg.name}
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke={seg.color}
                                    strokeWidth="12"
                                    strokeDasharray={dashArray}
                                    strokeDashoffset={dashOffset}
                                    className="transition-all duration-500 hover:opacity-80"
                                />
                            );
                        })}
                    </svg>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{platforms.length}</span>
                        <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Apps</span>
                    </div>
                </div>
            </div>

            {/* LEGEND */}
            <div className="mt-6 space-y-2">
                {segments.slice(0, 4).map((seg) => (
                    <div key={seg.name} className="flex items-center justify-between text-sm group">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: seg.color }}
                            />
                            <span className="font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                {seg.name}
                            </span>
                        </div>
                        <span className="text-zinc-500 text-xs font-mono">
                            {Math.round(seg.percent * 100)}%
                        </span>
                    </div>
                ))}
            </div>

            {/* MONEY SAVER TIP (Styled like a ticket stub) */}
            {showTip && (
                <div className="mt-8 relative border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 pt-4">
                    {/* Cutout circles for ticket effect */}
                    <div className="absolute -left-[31px] -top-[10px] w-5 h-5 bg-zinc-50 dark:bg-zinc-950 rounded-full" />
                    <div className="absolute -right-[31px] -top-[10px] w-5 h-5 bg-zinc-50 dark:bg-zinc-900 rounded-full" />

                    <p className="text-[11px] text-zinc-500 leading-relaxed text-center">
                        <span className="block font-bold text-zinc-900 dark:text-zinc-200 mb-1">💰 Subscription Audit</span>
                        You only used <span className="font-semibold text-zinc-800 dark:text-zinc-300">{leastUsed.name}</span> for {leastUsed.count} logs. Worth keeping?
                    </p>
                </div>
            )}
        </div>
    );
}