// @/app/ui/blog/badges.tsx
'use client';

import { useState, Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    Star,
    EyeOff,
    AlertTriangle,
    X,
    ShieldAlert
} from 'lucide-react';
import { clsx } from 'clsx';

// --- Configuration: Badge Definitions ---
type BadgeType = 'premium' | 'nsfw' | 'spoiler';

const BADGE_CONFIG: Record<BadgeType, {
    title: string;
    description: string;
    icon: ReactNode;
    style: {
        trigger: string;
        modalIcon: string;
    }
}> = {
    premium: {
        title: "Premium Entry",
        description: "This content is part of the Premium Archive. It includes extended analysis, high-resolution assets, or exclusive insights reserved for supporters.",
        icon: <Star className="w-full h-full" />,
        style: {
            trigger: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-800/50",
            modalIcon: "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-500"
        }
    },
    nsfw: {
        title: "Sensitive Content",
        description: "This post contains material that may be unsuitable for public viewing or younger audiences (NSFW). Viewer discretion is advised.",
        icon: <EyeOff className="w-full h-full" />,
        style: {
            trigger: "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-500 border-rose-200 dark:border-rose-800/50",
            modalIcon: "bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-500"
        }
    },
    spoiler: {
        title: "Spoiler Warning",
        description: "This post discusses significant plot details, twists, or endings. We recommend viewing the source material before reading.",
        icon: <AlertTriangle className="w-full h-full" />,
        style: {
            trigger: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
            modalIcon: "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
        }
    }
};

// --- Reusable Interactive Badge Component ---
function InteractiveBadge({ type }: { type: BadgeType }) {
    const [isOpen, setIsOpen] = useState(false);
    const config = BADGE_CONFIG[type];

    return (
        <>
            {/* --- Trigger (Pill Shape) --- */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className={clsx(
                    "group relative flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all hover:opacity-80 focus:outline-none",
                    config.style.trigger
                )}
            >
                <div className="w-3 h-3">
                    {config.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">
                    {type === 'nsfw' ? 'Sensitive' : type}
                </span>
            </button>

            {/* --- Modal (Boxy / Archive Design) --- */}
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => setIsOpen(false)}>

                    {/* Backdrop */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-zinc-900/40 dark:bg-black/80 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                {/* Boxy Modal Panel */}
                                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-sm bg-white dark:bg-zinc-950 p-6 text-left align-middle shadow-2xl transition-all border-2 border-zinc-100 dark:border-zinc-800">

                                    {/* Close Button */}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>

                                    <div className="flex flex-col items-center text-center pt-2">
                                        {/* Boxy Icon Container */}
                                        <div className={clsx("w-16 h-16 p-4 rounded-sm mb-5 border", config.style.modalIcon)}>
                                            {config.icon}
                                        </div>

                                        <Dialog.Title
                                            as="h3"
                                            className="text-xl font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100"
                                        >
                                            {config.title}
                                        </Dialog.Title>

                                        <div className="mt-4">
                                            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                                {config.description}
                                            </p>
                                        </div>

                                        <div className="mt-8 w-full">
                                            {/* Boxy Action Button */}
                                            <button
                                                type="button"
                                                className="w-full inline-flex justify-center rounded-sm border border-zinc-900 dark:border-zinc-700 bg-zinc-900 dark:bg-zinc-100 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none transition-colors"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Understood
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}

// --- Exports ---

export function PremiumBadge() {
    return <InteractiveBadge type="premium" />;
}

export function NsfwBadge() {
    return <InteractiveBadge type="nsfw" />;
}

export function SpoilerBadge() {
    return <InteractiveBadge type="spoiler" />;
}