// @/app/ui/blog/badges.tsx

import { StarIcon, EyeSlashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { clsx } from 'clsx';

/**
 * Premium Content Badge
 * Style: Gold/Amber technical tag
 */
export function PremiumBadge() {
    return (
        <div
            className={clsx(
                "inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border",
                // Light Mode
                "bg-amber-50 border-amber-200 text-amber-700",
                // Dark Mode (The Archive Look)
                "dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-500",
                // Typography
                "text-[10px] font-bold uppercase tracking-widest"
            )}
            title="Premium exclusive content"
        >
            <StarIcon className="h-3 w-3" />
            <span>Premium</span>
        </div>
    );
}

/**
 * NSFW Content Badge
 * Style: Red/Rose warning tag
 */
export function NsfwBadge() {
    return (
        <div
            className={clsx(
                "inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border",
                // Light Mode
                "bg-rose-50 border-rose-200 text-rose-700",
                // Dark Mode
                "dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-500",
                // Typography
                "text-[10px] font-bold uppercase tracking-widest"
            )}
            title="Not Safe For Work content"
        >
            <EyeSlashIcon className="h-3 w-3" />
            <span>NSFW</span>
        </div>
    );
}

/**
 * Spoiler Warning Badge
 * Style: High-contrast Zinc tag
 */
export function SpoilerBadge() {
    return (
        <div
            className={clsx(
                "inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border",
                // Light Mode
                "bg-zinc-100 border-zinc-300 text-zinc-700",
                // Dark Mode
                "dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300",
                // Typography
                "text-[10px] font-bold uppercase tracking-widest"
            )}
            title="Warning: This post contains spoilers"
        >
            <ExclamationTriangleIcon className="h-3 w-3" />
            <span>Spoilers</span>
        </div>
    );
}