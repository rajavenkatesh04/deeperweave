'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FilmIcon } from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

const LOADING_PHRASES = [
    "Setting the scene...",
    "Checking camera focus...",
    "Scouting locations...",
    "Developing negatives...",
    "Casting the stars...",
    "Finalizing the cut..."
];

export default function CinematicLoader() {
    const [phraseIndex, setPhraseIndex] = useState(0);

    // Cycle through phrases every 1.5s
    useEffect(() => {
        const interval = setInterval(() => {
            setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center gap-6 z-10">
            {/* 1. Animated Logo / Reel */}
            <div className="relative">
                {/* Outer Ring (Spinning) */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-700 opacity-50"
                />

                {/* Inner Icon (Pulsing) */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <FilmIcon className="w-8 h-8 text-amber-500" />
                </motion.div>
            </div>

            {/* 2. Text Content */}
            <div className="text-center space-y-2">
                <h1 className="text-xl font-bold tracking-[0.2em] text-white uppercase">
                    Deeper Weave
                </h1>

                {/* Cycling Status Text */}
                <div className="h-6 overflow-hidden relative">
                    <motion.p
                        key={phraseIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className={`${PlayWriteNewZealandFont.className} text-sm text-zinc-500`}
                    >
                        {LOADING_PHRASES[phraseIndex]}
                    </motion.p>
                </div>
            </div>

            {/* 3. Progress Line */}
            <div className="w-32 h-0.5 bg-zinc-800 mt-4 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-amber-500/50"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        </div>
    );
}