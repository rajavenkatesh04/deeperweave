'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { toggleSaveItem } from '@/lib/actions/save-actions';
import { SaveableItemType } from '@/lib/definitions';
import clsx from 'clsx';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

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
    const queryClient = useQueryClient();

    // Local state controls the UI instantly
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    // We track if a request is in flight to prevent spamming, but we DON'T show a spinner
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return; // Prevent double-clicks

        // 1. ⚡️ OPTIMISTIC UPDATE: Flip state immediately
        const previousState = isSaved;
        setIsSaved(!previousState);
        setIsLoading(true);

        try {
            // 2. Perform Server Action in background
            const result = await toggleSaveItem(itemType, itemId, pathname);

            if (result?.error) {
                throw new Error(result.error);
            }

            // 3. Silent Success: Invalidate cache for the Saved Page
            queryClient.invalidateQueries({ queryKey: ['saved-items'] });

        } catch (error: any) {
            // 4. ↩️ ROLLBACK: If it failed, revert the icon
            setIsSaved(previousState);

            if (error.message === "Unauthorized") {
                toast.error("Please log in to save");
            } else {
                toast.error("Could not save item");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            title={isSaved ? "Remove from Vault" : "Add to Vault"}
            className={clsx(
                // Base Layout
                "group relative flex items-center justify-center rounded-full transition-all duration-300 ease-out",
                // Interaction
                "hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-75", // Added satisfying 'click' shrink
                // Sizing
                "p-2",
                // Color Logic
                isSaved
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200",
                className
            )}
        >
            {/* Icon Layer - No Spinner, just the Icon */}
            <div className={clsx(
                "relative z-10 flex items-center justify-center transition-all duration-300",
                // Add a little 'pop' animation when saving
                isSaved ? "animate-in zoom-in-50" : ""
            )}>
                {isSaved ? (
                    <BookmarkIconSolid className={iconSize} />
                ) : (
                    <BookmarkIcon className={iconSize} strokeWidth={1.5} />
                )}
            </div>
        </button>
    );
}