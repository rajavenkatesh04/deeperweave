'use client';

import { useState } from 'react';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface StarRatingInputProps {
    rating: number;
    setRating: (rating: number) => void;
    name?: string;
}

export default function StarRatingInput({ rating, setRating, name = 'rating' }: StarRatingInputProps) {
    const [hoverRating, setHoverRating] = useState(0);

    // Calculate display rating (priority: hover > actual)
    const displayRating = hoverRating || rating;

    // Helper to determine star state (full, half, empty)
    const getStarState = (index: number) => {
        const starValue = index + 1;
        if (displayRating >= starValue) return 'full';
        if (displayRating >= starValue - 0.5) return 'half';
        return 'empty';
    };

    // Handle Click: Toggle logic for halves
    const handleClick = (starValue: number, isLeftHalf: boolean) => {
        const newValue = isLeftHalf ? starValue - 0.5 : starValue;
        // Allow deselecting if clicking the exact same value
        if (rating === newValue) {
            setRating(0);
        } else {
            setRating(newValue);
        }
    };

    const handleMouseMove = (e: React.MouseEvent, starValue: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Calculate position relative to the star's width
        const x = e.clientX - rect.left;

        // If mouse is in left 50%, it's a half star
        if (x < rect.width / 2) {
            setHoverRating(starValue - 0.5);
        } else {
            setHoverRating(starValue);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                {[0, 1, 2, 3, 4].map((index) => {
                    const starValue = index + 1;
                    const state = getStarState(index);

                    return (
                        <div
                            key={index}
                            className="relative cursor-pointer w-8 h-8 md:w-9 md:h-9 transition-transform hover:scale-105 active:scale-95"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const isLeft = (e.clientX - rect.left) < (rect.width / 2);
                                handleClick(starValue, isLeft);
                            }}
                            onMouseMove={(e) => handleMouseMove(e, starValue)}
                        >
                            {/* 1. Background Outline Star (Always visible) */}
                            <StarIconOutline className="absolute inset-0 w-full h-full text-zinc-300 dark:text-zinc-700" />

                            {/* 2. Full Filled Star (Conditionally rendered) */}
                            {state === 'full' && (
                                <StarIconSolid className="absolute inset-0 w-full h-full text-amber-400 animate-in zoom-in-50 duration-200" />
                            )}

                            {/* 3. Half Filled Star (Uses Clip Path for precision) */}
                            {state === 'half' && (
                                <div className="absolute inset-0 w-full h-full">
                                    <StarIconSolid
                                        className="w-full h-full text-amber-400"
                                        style={{ clipPath: 'inset(0 50% 0 0)' }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Numeric Indicator */}
                <div className="ml-3 min-w-[36px] flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-sm font-bold text-zinc-600 dark:text-zinc-300 tabular-nums">
                    {displayRating > 0 ? displayRating.toFixed(1) : '0.0'}
                </div>
            </div>

            {/* Instruction Tip */}
            <p className="text-[10px] text-zinc-400 flex items-center gap-1.5 ml-1">
                <span className="flex items-center justify-center w-3 h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full text-[8px] font-bold">i</span>
                Hover left side for 0.5
            </p>

            <input type="hidden" name={name} value={rating} />
        </div>
    );
}