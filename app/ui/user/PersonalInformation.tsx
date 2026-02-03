'use client';

import { useState } from 'react';
import {
    EnvelopeIcon,
    CakeIcon,
    SparklesIcon,
    UserCircleIcon,
    FingerPrintIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

// --- Helper Component ---
function InfoRow({
                     icon: Icon,
                     label,
                     value,
                     isVisible
                 }: {
    icon: any;
    label: string;
    value: string | null | undefined;
    isVisible: boolean;
}) {
    return (
        <div className="flex items-start gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0">
            <div className="shrink-0 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-sm">
                <Icon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-1">
                    {label}
                </p>
                <div className="h-5 flex items-center">
                    {isVisible ? (
                        <p className="text-sm text-zinc-900 dark:text-zinc-100 break-all animate-in fade-in duration-300">
                            {value || 'Not set'}
                        </p>
                    ) : (
                        // Masked State
                        <div className="flex gap-1.5 py-1.5 animate-in fade-in duration-300 select-none">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Main Client Component ---
export default function PersonalInformation({
                                                email,
                                                gender,
                                                birthday,
                                                plan
                                            }: {
    email: string;
    gender?: string | null;
    birthday?: string | null;
    plan: string;
}) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <section className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden rounded-sm transition-all">
            {/* Header with Toggle Button */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FingerPrintIcon className="w-4 h-4 text-zinc-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                        Personal Information
                    </h3>
                </div>

                <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                    title={isVisible ? "Hide details" : "Show details"}
                >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                        {isVisible ? 'Hide' : 'View'}
                    </span>
                    {isVisible ? (
                        <EyeSlashIcon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                    ) : (
                        <EyeIcon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                    )}
                </button>
            </div>

            {/* Content Rows */}
            <div className="flex flex-col">
                <InfoRow icon={EnvelopeIcon} label="Email Address" value={email} isVisible={isVisible} />
                <InfoRow icon={UserCircleIcon} label="Gender" value={gender} isVisible={isVisible} />
                <InfoRow icon={CakeIcon} label="Birthday" value={birthday} isVisible={isVisible} />
                <InfoRow icon={SparklesIcon} label="Plan" value={plan} isVisible={isVisible} />
            </div>
        </section>
    );
}