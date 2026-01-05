'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    PlusIcon,
    ChevronDownIcon,
    ArchiveBoxXMarkIcon,
    ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import TimelineEntryCard from './TimelineEntryCard';
import { TimelineEntry } from "@/lib/definitions";
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

export default function TimelineDisplay({
                                            timelineEntries,
                                            isOwnProfile,
                                            username
                                        }: {
    timelineEntries: TimelineEntry[];
    isOwnProfile: boolean;
    username: string;
}) {
    const INITIAL_ITEMS = 10;
    const ITEMS_PER_PAGE = 10;
    const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS);

    const visibleEntries = timelineEntries.slice(0, visibleCount);
    const hasMore = visibleCount < timelineEntries.length;

    const loadMore = () => {
        setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, timelineEntries.length));
    };

    return (
        <div className="flex flex-col w-full">

            {/* --- HEADER SECTION --- */}
            <div className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black py-10 px-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    {/* Title Section */}
                    <div>
                        <h1 className={`${PlayWriteNewZealandFont.className} text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-3`}>
                            Watch History
                        </h1>
                        <p className="text-sm text-zinc-500">
                            A temporal log of your cinematic journey.
                        </p>
                    </div>

                    {/* Actions Section (Counter & Button) */}
                    <div className="flex items-center gap-6">
                        {/* Entry Counter (Only show if there are entries) */}
                        {timelineEntries.length > 0 && (
                            <div className="hidden md:block text-right border-r border-zinc-200 dark:border-zinc-800 pr-6">
                                <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">
                                    Total Entries
                                </p>
                                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-none font-mono">
                                    {timelineEntries.length.toString().padStart(3, '0')}
                                </p>
                            </div>
                        )}

                        {/* Create Button */}
                        {isOwnProfile && (
                            <Link href={`/profile/${username}/timeline/create`} passHref>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-sm shadow-sm transition-all"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Log Entry</span>
                                </motion.button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* --- CONTENT SECTION --- */}
            <section className="relative min-h-[50vh] pb-12 pt-8">
                {timelineEntries.length > 0 ? (
                    <div className="max-w-4xl mx-auto px-6">
                        {/* --- ENTRIES LIST --- */}
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                            <AnimatePresence>
                                {visibleEntries.map((entry, index) => (
                                    <TimelineEntryCard
                                        key={entry.id}
                                        entry={entry}
                                        index={index}
                                        isOwnProfile={isOwnProfile}
                                        username={username}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* --- LOAD MORE BUTTON --- */}
                        {hasMore && (
                            <div className="flex justify-center mt-12 mb-8 relative z-20">
                                <motion.button
                                    onClick={loadMore}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group flex items-center gap-3 px-8 py-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-900 dark:text-zinc-100 transition-all rounded-sm shadow-sm"
                                >
                                    <span className="text-xs font-bold uppercase tracking-widest">Expand Log</span>
                                    <ChevronDownIcon className="w-4 h-4 text-zinc-400 group-hover:translate-y-1 transition-transform" />
                                    <span className="text-[10px] font-mono text-zinc-400 ml-2">
                                        [{timelineEntries.length - visibleCount} REMAINING]
                                    </span>
                                </motion.button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* --- EMPTY STATE (Styled like PrivateProfileScreen) --- */
                    <div className="relative w-full py-24 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 mt-4">

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
                                <ArchiveBoxXMarkIcon className="w-8 h-8 text-zinc-900 dark:text-zinc-100 -rotate-45" />
                            </div>

                            {/* Status Label */}
                            <div className="flex items-center justify-center gap-2 mb-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500">
                                <ShieldExclamationIcon className="w-3 h-3" />
                                <span>Status: Null // 404</span>
                            </div>

                            {/* Headline */}
                            <h2 className={`${PlayWriteNewZealandFont.className} text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 leading-tight`}>
                                Log Empty
                            </h2>

                            {/* Divider Line */}
                            <div className="h-px w-16 bg-zinc-300 dark:bg-zinc-700 mx-auto mb-5" />

                            {/* Description Text */}
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-light mb-8">
                                No cinematic data recorded in this sector.
                                <br />
                                The timeline awaits its first entry.
                            </p>

                            {/* Initialize Button (If Own Profile) */}
                            {isOwnProfile && (
                                <Link href={`/profile/${username}/timeline/create`} passHref>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-2 px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest rounded-sm shadow-lg hover:shadow-xl transition-all mx-auto"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        <span>Initialize Log</span>
                                    </motion.button>
                                </Link>
                            )}
                        </div>

                        {/* --- 3. DECORATIVE CORNERS (Camera Frame Look) --- */}
                        <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-zinc-300 dark:border-zinc-800" />
                        <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-zinc-300 dark:border-zinc-800" />
                        <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-zinc-300 dark:border-zinc-800" />
                        <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-zinc-300 dark:border-zinc-800" />
                    </div>
                )}
            </section>
        </div>
    );
}