'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface HeatmapProps {
    entries: { watched_on: string }[];
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function CinematicHeatmap({ entries }: HeatmapProps) {
    // 1. Determine available years from data
    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(entries.map(e => new Date(e.watched_on).getFullYear())));
        // Sorts Descending: [2025, 2024, 2023...]
        return uniqueYears.length > 0 ? uniqueYears.sort((a, b) => b - a) : [new Date().getFullYear()];
    }, [entries]);

    // CHANGE THIS LINE:
    // Old: const [selectedYear, setSelectedYear] = useState(years[years.length - 1]);
    // New: Default to index 0 (the latest year because of the sort above)
    const [selectedYear, setSelectedYear] = useState(years[0]);

    const [isExpanded, setIsExpanded] = useState(false);

    // 2. Process data by Month
    const { monthsData, totalInYear } = useMemo(() => {
        const counts: Record<string, number> = {};
        let localMax = 0;
        let total = 0;

        // Filter and Count
        entries.forEach(e => {
            const d = new Date(e.watched_on);
            if (d.getFullYear() === selectedYear) {
                const key = d.toISOString().split('T')[0];
                counts[key] = (counts[key] || 0) + 1;
                localMax = Math.max(localMax, counts[key]);
                total++;
            }
        });

        // Build 12 Month Objects
        const months = Array.from({ length: 12 }, (_, monthIndex) => {
            const days = [];
            const firstDay = new Date(selectedYear, monthIndex, 1);
            const lastDay = new Date(selectedYear, monthIndex + 1, 0);

            // Pad start of month
            const startPadding = firstDay.getDay();
            for (let i = 0; i < startPadding; i++) days.push(null);

            // Fill actual days
            for (let d = 1; d <= lastDay.getDate(); d++) {
                const monthStr = String(monthIndex + 1).padStart(2, '0');
                const dayStr = String(d).padStart(2, '0');
                const dateKey = `${selectedYear}-${monthStr}-${dayStr}`;

                days.push({
                    date: dateKey,
                    dayNum: d,
                    count: counts[dateKey] || 0
                });
            }
            return { name: MONTH_NAMES[monthIndex], days, max: localMax };
        });

        return { monthsData: months, maxCount: localMax, totalInYear: total };
    }, [entries, selectedYear]);

    // 3. Logic for "Smart Slice"
    const visibleMonths = useMemo(() => {
        if (isExpanded) return monthsData;

        // If it's the current year, start from TODAY's month.
        // If it's a past year, start from JAN.
        const currentYear = new Date().getFullYear();
        const startMonthIndex = selectedYear === currentYear ? new Date().getMonth() : 0;

        // We grab 4 months.
        // On Mobile CSS, we will hide the 4th one to show only 3.
        return monthsData.slice(startMonthIndex, startMonthIndex + 4);
    }, [isExpanded, monthsData, selectedYear]);

    // 4. Color Theme ("Cinematic Fire")
    const getColor = (count: number) => {
        if (count === 0) return 'bg-zinc-100 dark:bg-zinc-800/50';
        if (count === 1) return 'bg-amber-300 dark:bg-amber-500/80';
        if (count === 2) return 'bg-orange-400 dark:bg-orange-500';
        if (count >= 3) return 'bg-red-500 dark:bg-red-600';
        return 'bg-zinc-100 dark:bg-zinc-800';
    };

    return (
        <div className="w-full animate-in fade-in duration-500">

            {/* --- HEADER --- */}
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Stats Title */}
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                            {totalInYear}
                        </span>
                        <span className="text-sm text-zinc-500 font-medium uppercase tracking-wide">
                            Logs in {selectedYear}
                        </span>
                    </div>

                    {/* Fixed: Responsive Year Selector (Scrollable) */}
                    <div className="flex items-center gap-1 overflow-x-auto w-full sm:max-w-xs md:max-w-none pb-2 scrollbar-hide mask-fade-right">
                        {years.map(year => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={clsx(
                                    "px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all flex-shrink-0",
                                    selectedYear === year
                                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                )}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- GRID --- */}
            <motion.div
                layout
                className="grid grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6"
            >
                <AnimatePresence mode='popLayout'>
                    {visibleMonths.map((month, index) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            key={month.name}
                            // LOGIC: If collapsed (!isExpanded), hide the 4th item (index 3) on mobile
                            className={clsx(
                                "flex flex-col gap-2",
                                !isExpanded && index === 3 && "hidden md:flex"
                            )}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 pl-0.5">
                                {month.name}
                            </span>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-0.5">
                                {month.days.map((day, i) => {
                                    if (!day) return <div key={`pad-${i}`} />;
                                    return (
                                        <div
                                            key={day.date}
                                            className={clsx(
                                                "w-full aspect-square rounded-[1px] transition-colors duration-200",
                                                getColor(day.count)
                                            )}
                                            title={`${day.date}: ${day.count} logs`}
                                        />
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* --- FOOTER ACTIONS --- */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-900">

                {/* Fixed: Button z-index and clickability */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="relative z-10 flex items-center gap-2 px-4 py-2 -ml-2 rounded-lg text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUpIcon className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                            Collapse View
                        </>
                    ) : (
                        <>
                            <ChevronDownIcon className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                            Show Full Year
                        </>
                    )}
                </button>

                {/* Legend */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase text-zinc-300 dark:text-zinc-600 mr-1 hidden sm:inline">Less</span>
                    <div className="w-2 h-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-full" />
                    <div className="w-2 h-2 bg-amber-300 dark:bg-amber-500/80 rounded-full" />
                    <div className="w-2 h-2 bg-orange-400 dark:bg-orange-500 rounded-full" />
                    <div className="w-2 h-2 bg-red-500 dark:bg-red-600 rounded-full" />
                    <span className="text-[9px] font-bold uppercase text-zinc-300 dark:text-zinc-600 ml-1 hidden sm:inline">More</span>
                </div>
            </div>
        </div>
    );
}