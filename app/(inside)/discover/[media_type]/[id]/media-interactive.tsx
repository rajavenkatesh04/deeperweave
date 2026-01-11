'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // ✨ IMPORT ADDED
import { ShareIcon, PlayIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

/* --- 1. Share Button --- */
export function ShareButton() {
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            title="Copy Link"
        >
            {copied ? (
                <>
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Copied!</span>
                </>
            ) : (
                <>
                    <ShareIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Share</span>
                </>
            )}
        </button>
    );
}

/* --- 2. Trailer Button --- */
export function TrailerButton({ videos }: { videos: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false); // ✨ STATE ADDED

    useEffect(() => {
        setMounted(true); // ✨ COMPONENT MOUNTED
    }, []);

    // Lock scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    // Logic: Look for 'Trailer' on YouTube. Fallback to 'Teaser'.
    const trailer = videos?.find(
        (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    );

    if (!trailer) {
        return (
            <button disabled className="px-8 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed font-medium flex items-center gap-2">
                <PlayIcon className="w-4 h-4" />
                No Trailer
            </button>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="group px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all font-medium relative overflow-hidden"
            >
                <span className="flex items-center gap-2 relative z-10">
                    <PlayIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    Watch Trailer
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

            {/* Modal - Wrapped in Portal */}
            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-zinc-800">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-zinc-800 rounded-full text-white transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                            allow="autoplay; encrypted-media; fullscreen"
                            className="w-full h-full"
                        />
                    </div>
                </div>,
                document.body // ✨ TARGET DESTINATION
            )}
        </>
    );
}

/* --- 3. Backdrop Gallery --- */
export function BackdropGallery({ images, fallbackPath }: { images: any[], fallbackPath: string | null }) {
    const [index, setIndex] = useState(0);
    // Filter textless backdrops preferably
    const backdrops = images?.filter((img: any) => !img.iso_639_1 || img.iso_639_1 === 'en').slice(0, 6) || [];

    const hasMultiple = backdrops.length > 1;
    const currentPath = hasMultiple ? backdrops[index].file_path : fallbackPath;

    useEffect(() => {
        if (!hasMultiple) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % backdrops.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [hasMultiple, backdrops.length]);

    if (!currentPath) return null;

    return (
        <div className="relative w-full h-[35rem] bg-zinc-200 dark:bg-zinc-900 overflow-hidden group">
            <div key={currentPath} className="relative w-full h-full animate-fadeIn">
                <Image
                    src={`https://image.tmdb.org/t/p/original${currentPath}`}
                    alt="Backdrop"
                    fill
                    className="object-cover opacity-100 dark:opacity-60 transition-all duration-1000 ease-in-out transform scale-100 group-hover:scale-105"
                    priority
                />
            </div>
            <div className="absolute inset-0 dark:bg-gradient-to-b dark:from-transparent dark:via-transparent dark:to-zinc-950" />
        </div>
    );
}