'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    ShieldCheckIcon,
    SparklesIcon,
    LifebuoyIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { UserRole } from '@/lib/definitions';

// --- Configuration: Badge Details ---
const BADGE_INFO: Partial<Record<UserRole, { title: string; description: string }>> = {
    staff: {
        title: "Staff Member",
        description: "This user is an official member of the Deeperweave team, helping build and maintain the platform."
    },
    support: {
        title: "Official Support",
        description: "This is a verified support specialist dedicated to helping you with account and technical issues."
    },
    verified: {
        title: "Verified Account",
        description: "This account has been verified as the authentic presence of the public figure, actor, or creator it represents."
    },
    critic: {
        title: "Verified Critic",
        description: "This user is a recognized film critic, journalist, or top-tier reviewer in the cinematic community."
    }
};

export default function UserBadge({ role }: { role: UserRole }) {
    const [isOpen, setIsOpen] = useState(false);

    // If regular user, return nothing
    if (role === 'user' || !BADGE_INFO[role]) return null;

    const info = BADGE_INFO[role]!;

    // Helper to render the specific icon
    const renderIcon = (className: string) => {
        switch (role) {
            case 'staff': return <ShieldCheckIcon className={className} />;
            case 'support': return <LifebuoyIcon className={className} />;
            case 'verified': return <CheckBadgeIcon className={className} />;
            case 'critic': return <SparklesIcon className={className} />;
            default: return null;
        }
    };

    return (
        <>
            {/* --- The Badge Trigger (Unchanged) --- */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className="group relative flex items-center justify-center focus:outline-none"
            >
                {role === 'staff' && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 border border-zinc-700 cursor-pointer hover:opacity-80 transition-opacity">
                        <ShieldCheckIcon className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Staff</span>
                    </div>
                )}
                {role === 'support' && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-pointer hover:opacity-80 transition-opacity">
                        <LifebuoyIcon className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Support</span>
                    </div>
                )}
                {role === 'verified' && (
                    <div className="text-blue-500 dark:text-blue-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
                        <CheckBadgeIcon className="w-5 h-5" />
                    </div>
                )}
                {role === 'critic' && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 cursor-pointer hover:opacity-80 transition-opacity">
                        <SparklesIcon className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Critic</span>
                    </div>
                )}
            </button>

            {/* --- The Trust Modal (Boxy Redesign) --- */}
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>

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
                                {/* ✨ CHANGED: rounded-2xl -> rounded-sm (Boxy) */}
                                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-sm bg-white dark:bg-zinc-950 p-6 text-left align-middle shadow-2xl transition-all border-2 border-zinc-100 dark:border-zinc-800">

                                    {/* Close Button */}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>

                                    <div className="flex flex-col items-center text-center pt-2">
                                        {/* ✨ CHANGED: rounded-full -> rounded-sm (Boxy Icon) */}
                                        <div className={`p-4 rounded-sm mb-5 border ${
                                            role === 'staff' ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100' :
                                                role === 'support' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-600' :
                                                    role === 'verified' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-500' :
                                                        'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30 text-indigo-600'
                                        }`}>
                                            {renderIcon("w-8 h-8")}
                                        </div>

                                        <Dialog.Title
                                            as="h3"
                                            className="text-xl font-bold uppercase tracking-tight text-zinc-900 dark:text-zinc-100"
                                        >
                                            {info.title}
                                        </Dialog.Title>

                                        <div className="mt-3">
                                            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                                {info.description}
                                            </p>
                                        </div>

                                        <div className="mt-8 w-full">
                                            {/* ✨ CHANGED: rounded-lg -> rounded-sm (Boxy Button) */}
                                            <button
                                                type="button"
                                                className="w-full inline-flex justify-center rounded-sm border border-zinc-900 dark:border-zinc-700 bg-zinc-900 dark:bg-zinc-100 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none transition-colors"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Close
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