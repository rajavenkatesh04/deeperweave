// @/app/ui/blog/badges.tsx

import { StarIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { clsx } from 'clsx';

/**
 * A subtle badge for premium content. Designed to be informative but not distracting.
 */
export function PremiumBadge() {
    return (
        <div
            className={clsx(
                "flex h-6 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                // Light & Dark mode colors for a "chip" style
                "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
                // Subtle border
                "border border-amber-200/80 dark:border-amber-500/20"
            )}
            title="Premium exclusive content"
        >
            <StarIcon className="h-3.5 w-3.5" />
            <span>Premium</span>
        </div>
    );
}

/**
 * A subtle badge for NSFW content.
 */
export function NsfwBadge() {
    return (
        <div
            className={clsx(
                "flex h-6 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                // Light & Dark mode colors
                "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
                // Subtle border
                "border border-rose-200/80 dark:border-rose-500/20"
            )}
            title="Not Safe For Work content"
        >
            <EyeSlashIcon className="h-3.5 w-3.5" />
            <span>NSFW</span>
        </div>
    );
}