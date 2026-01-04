'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { CameraIcon, XMarkIcon, ArrowsPointingOutIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ImageType {
    file_path: string;
}

export default function PortraitGallery({ images }: { images: ImageType[] }) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // --- Navigation Logic ---
    const closeModal = useCallback(() => setSelectedIndex(null), []);

    const nextImage = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
        e?.stopPropagation();
        setSelectedIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
    }, [images.length]);

    const prevImage = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
        e?.stopPropagation();
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
    }, [images.length]);

    // --- Keyboard & Scroll Lock ---
    useEffect(() => {
        if (selectedIndex === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowRight') nextImage(e);
            if (e.key === 'ArrowLeft') prevImage(e);
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden'; // Lock scroll

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset'; // Unlock scroll
        };
    }, [selectedIndex, closeModal, nextImage, prevImage]);

    // --- Mobile Swipe Logic ---
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            setSelectedIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
        }
        if (isRightSwipe) {
            setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
        }
    };

    if (!images || images.length === 0) return null;

    return (
        <>
            {/* --- Masonry Grid (Pinterest Style) --- */}
            <section className="z-80 space-y-8 mb-24 animate-in fade-in duration-700">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-light text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                        <CameraIcon className="w-7 h-7 text-zinc-400" />
                        Portraits
                    </h2>
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                        {images.length} Images
                    </span>
                </div>

                {/* CSS Columns for Masonry Effect */}
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {images.map((img, index) => (
                        <div
                            key={img.file_path + index}
                            onClick={() => setSelectedIndex(index)}
                            className="break-inside-avoid group relative w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <Image
                                src={`https://image.tmdb.org/t/p/w500${img.file_path}`}
                                alt={`Portrait ${index + 1}`}
                                width={500}
                                height={750}
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                <ArrowsPointingOutIcon className="w-8 h-8 text-white opacity-0 transform scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 drop-shadow-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- Fullscreen Lightbox (ALWAYS DARK MODE) --- */}
            {selectedIndex !== null && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/98 backdrop-blur-xl flex items-center justify-center touch-none"
                    onClick={closeModal} // Click backdrop to close
                >
                    {/* Fixed Top-Right Close Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); closeModal(); }}
                        className="fixed top-6 right-6 z-[10000] p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                        aria-label="Close Gallery"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    {/* Main Image Container */}
                    <div
                        className="relative w-full h-full flex items-center justify-center p-4 pb-20 md:pb-4"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div
                            className="relative w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()} // Click image does NOT close
                        >
                            <Image
                                src={`https://image.tmdb.org/t/p/original${images[selectedIndex].file_path}`}
                                alt="Gallery Fullscreen"
                                fill
                                className="object-contain select-none animate-in zoom-in-95 duration-300"
                                sizes="100vw"
                                priority
                            />
                        </div>
                    </div>

                    {/* --- Controls (Forced White Text) --- */}

                    {/* Desktop Left Arrow */}
                    <button
                        onClick={prevImage}
                        className="fixed left-6 top-1/2 -translate-y-1/2 z-[10000] p-4 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors hidden md:block"
                    >
                        <ChevronLeftIcon className="w-8 h-8" />
                    </button>

                    {/* Desktop Right Arrow */}
                    <button
                        onClick={nextImage}
                        className="fixed right-6 top-1/2 -translate-y-1/2 z-[10000] p-4 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors hidden md:block"
                    >
                        <ChevronRightIcon className="w-8 h-8" />
                    </button>

                    {/* Mobile Bottom Control Bar */}
                    <div
                        className="fixed bottom-0 left-0 right-0 z-[10000] p-6 pb-8 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-between md:justify-center gap-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={prevImage}
                            className="md:hidden p-3 rounded-full text-zinc-400 hover:text-white active:bg-white/10 transition-colors"
                        >
                            <ChevronLeftIcon className="w-8 h-8" />
                        </button>

                        <div className="font-mono text-sm text-zinc-400 tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                            {selectedIndex + 1} / {images.length}
                        </div>

                        <button
                            onClick={nextImage}
                            className="md:hidden p-3 rounded-full text-zinc-400 hover:text-white active:bg-white/10 transition-colors"
                        >
                            <ChevronRightIcon className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}