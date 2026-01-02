'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PlusIcon, PlayIcon, StarIcon } from '@heroicons/react/24/solid';

interface DynamicActionsProps {
    posterPath: string | null;
    id: number;
    mediaType: string;
}

export default function DynamicActions({ posterPath, id, mediaType }: DynamicActionsProps) {
    const [accentColor, setAccentColor] = useState<string>('#e11d48'); // Default: rose-600
    const [hoverColor, setHoverColor] = useState<string>('#be123c'); // Default: rose-700
    const [textColor, setTextColor] = useState<string>('#ffffff');
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!posterPath) return;

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = `https://image.tmdb.org/t/p/w300${posterPath}`;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Get a patch of data from the center-bottom of the poster (usually has good color)
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let r = 0, g = 0, b = 0;
            const step = 5; // Skip pixels for performance
            let count = 0;

            for (let i = 0; i < data.length; i += 4 * step) {
                // Ignore white/black/very dark/very light pixels to find the "color"
                if (data[i] < 20 && data[i+1] < 20 && data[i+2] < 20) continue;
                if (data[i] > 230 && data[i+1] > 230 && data[i+2] > 230) continue;

                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
            }

            if (count > 0) {
                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);

                // Boost saturation slightly for UI pop
                const boost = 1.2;
                const newColor = `rgb(${Math.min(255, r * boost)}, ${Math.min(255, g * boost)}, ${Math.min(255, b * boost)})`;

                // Calculate darker shade for hover
                const darkerColor = `rgb(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.8)}, ${Math.floor(b * 0.8)})`;

                setAccentColor(newColor);
                setHoverColor(darkerColor);

                // Determine text color (black or white) based on brightness
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                setTextColor(brightness > 125 ? '#000000' : '#ffffff');
            }
        };
    }, [posterPath]);

    return (
        <div className="flex flex-col gap-3">
            {/* The Dynamic Button */}
            <Link
                href={`/log?item=${id}&type=${mediaType}`}
                style={{
                    backgroundColor: accentColor,
                    color: textColor,
                    boxShadow: `0 10px 15px -3px ${accentColor}40` // Colored shadow
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverColor)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = accentColor)}
                className="flex items-center justify-center gap-2 w-full font-bold py-3.5 rounded-xl transition-all duration-300 active:scale-95"
            >
                <PlusIcon className="w-5 h-5" />
                <span>Log Watch</span>
            </Link>

            <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold py-3 rounded-xl transition-colors border border-zinc-700/50 text-sm">
                    <PlayIcon className="w-4 h-4" />
                    <span>Trailer</span>
                </button>
                <button className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold py-3 rounded-xl transition-colors border border-zinc-700/50 text-sm">
                    <StarIcon className="w-4 h-4 text-amber-500" />
                    <span>Rate</span>
                </button>
            </div>
        </div>
    );
}