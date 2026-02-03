'use client';

import { useState } from 'react';
import { EyeSlashIcon } from '@heroicons/react/24/solid';

export default function ContentGuard({
                                         children,
                                         isAdult,
                                         isSFW
                                     }: {
    children: React.ReactNode;
    isAdult?: boolean;
    isSFW: boolean;
}) {
    const [revealed, setRevealed] = useState(false);

    // If it's not adult content, or the user allows NSFW, just render the content.
    if (!isAdult || !isSFW) {
        return <>{children}</>;
    }

    // If already revealed by the user this session, show it
    if (revealed) {
        return <>{children}</>;
    }

    // Otherwise, show the Safety Blur
    return (
        <div className="relative w-full h-full overflow-hidden rounded-md group">
            {/* The Blurred Content (rendered behind) */}
            <div className="blur-xl opacity-50 pointer-events-none select-none grayscale transition-opacity duration-500" aria-hidden="true">
                {children}
            </div>

            {/* The Guard Overlay - THEME RESPONSIVE FIX */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center backdrop-blur-md transition-colors
                bg-zinc-100/80 dark:bg-black/80
                hover:bg-zinc-200/90 dark:hover:bg-black/90"
            >
                <EyeSlashIcon className="w-8 h-8 mb-2 text-zinc-500 dark:text-zinc-400" />

                <p className="text-xs font-bold uppercase tracking-wider mb-3 text-zinc-700 dark:text-zinc-300">
                    Explicit Content
                </p>

                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent clicking the card itself
                        setRevealed(true);
                    }}
                    // Button Colors: Black button on Light Mode, White button on Dark Mode (High Contrast)
                    className="px-4 py-1.5 text-xs font-bold rounded-full transition-transform active:scale-95 shadow-sm
                        bg-zinc-900 text-white hover:bg-zinc-700
                        dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                    Show Anyway
                </button>
            </div>
        </div>
    );
}