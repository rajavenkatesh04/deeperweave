'use client';

import { useState, useTransition } from 'react';
import { usePathname } from 'next/navigation';
// Using consistent icons for both states
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { toggleSaveItem } from '@/lib/actions/save-actions';
import { SaveableItemType } from '@/lib/definitions';
import clsx from 'clsx';
import { toast } from 'sonner';
import LoadingSpinner from '@/app/ui/loading-spinner';

interface SaveButtonProps {
    itemType: SaveableItemType;
    itemId: string | number;
    initialIsSaved?: boolean;
    className?: string;
    iconSize?: string;
}

export default function SaveButton({
                                       itemType,
                                       itemId,
                                       initialIsSaved = false,
                                       className,
                                       iconSize = "w-5 h-5"
                                   }: SaveButtonProps) {
    const pathname = usePathname();
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    const [isPending, startTransition] = useTransition();

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const previousState = isSaved;
        setIsSaved(!previousState);

        startTransition(async () => {
            const result = await toggleSaveItem(itemType, itemId, pathname);

            if (result?.error === "Unauthorized") {
                setIsSaved(previousState);
                toast.error("Please log in to save");
                return;
            }

            if (result?.saved === undefined && result?.error) {
                setIsSaved(previousState);
                toast.error("Could not save item");
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            title={isSaved ? "Remove from Vault" : "Add to Vault"}
            className={clsx(
                // Base Layout
                "group relative flex items-center justify-center rounded-full transition-all duration-200 ease-out",
                // Interaction
                "hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90",
                // Sizing (Padding matches a nice touch target)
                "p-2",
                // Color Logic
                isSaved
                    ? "text-zinc-900 dark:text-zinc-100" // Saved: High contrast
                    : "text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200", // Unsaved: Low contrast / muted
                className
            )}
        >
            {/* Loading State - Absolute centered so it doesn't shift layout */}
            {isPending && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 dark:bg-black/50 rounded-full">
                    <LoadingSpinner className="w-3.5 h-3.5 text-zinc-500" />
                </div>
            )}

            {/* Icon Layer */}
            <div className={clsx(
                "relative z-10 flex items-center justify-center transition-opacity duration-200",
                isPending ? "opacity-0" : "opacity-100"
            )}>
                {isSaved ? (
                    <BookmarkIconSolid className={clsx(iconSize, "animate-in zoom-in-50 duration-200")} />
                ) : (
                    <BookmarkIcon className={iconSize} strokeWidth={1.5} />
                )}
            </div>
        </button>
    );
}