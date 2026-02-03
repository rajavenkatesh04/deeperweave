'use client';

import { useState, Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    MdEngineering,
    MdSupportAgent,
    MdVerified,
    MdRateReview,
    MdExplicit,
    MdBugReport,
    MdTerminal
} from 'react-icons/md';
import { UserRole } from '@/lib/definitions';
import { DM_Serif_Display, Inter } from 'next/font/google';

// --- Fonts ---
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });
const inter = Inter({ subsets: ['latin'] });

// --- Configuration ---
type BadgeConfigData = {
    title: string;
    description: string;
    icon: ReactNode;
    colors: {
        triggerBg: string;
        triggerText: string;
        triggerBorder: string;
        modalGlow: string;
        modalIconText: string;
        shimmer?: string;
    };
};

const BADGE_CONFIG: Record<string, BadgeConfigData> = {
    developer: {
        title: "Core Developer",
        description: "A master architect with direct access to the Deeperweave source code. They build the reality you experience.",
        icon: <MdTerminal className="w-full h-full" />,
        colors: {
            triggerBg: "bg-amber-100 dark:bg-amber-900/30",
            triggerText: "text-amber-700 dark:text-amber-400",
            triggerBorder: "border-amber-200 dark:border-amber-800",
            modalGlow: "from-amber-500/30 to-transparent",
            modalIconText: "text-amber-600 dark:text-amber-400",
            shimmer: "from-amber-400 via-amber-200 to-amber-400"
        }
    },
    staff: {
        title: "Staff Member",
        description: "An official architect of the Deeperweave platform. This user helps build, maintain, and curate the experience.",
        icon: <MdEngineering className="w-full h-full" />,
        colors: {
            triggerBg: "bg-zinc-900 dark:bg-zinc-100",
            triggerText: "text-zinc-100 dark:text-zinc-900",
            triggerBorder: "border-zinc-700",
            modalGlow: "from-zinc-500/20 to-transparent",
            modalIconText: "text-zinc-900 dark:text-white",
            shimmer: "from-zinc-400 via-zinc-200 to-zinc-400"
        }
    },
    support: {
        title: "Official Support",
        description: "A verified support specialist dedicated to resolving technical issues and ensuring account security.",
        icon: <MdSupportAgent className="w-full h-full" />,
        colors: {
            triggerBg: "bg-emerald-100 dark:bg-emerald-900/30",
            triggerText: "text-emerald-700 dark:text-emerald-400",
            triggerBorder: "border-emerald-200 dark:border-emerald-800",
            modalGlow: "from-emerald-500/30 to-transparent",
            modalIconText: "text-emerald-600 dark:text-emerald-400",
            shimmer: "from-emerald-400 via-emerald-200 to-emerald-400"
        }
    },
    verified: {
        title: "Verified Account",
        description: "The authentic presence of a notable public figure, creator, or entity within the cinematic weave.",
        icon: <MdVerified className="w-full h-full" />,
        colors: {
            triggerBg: "bg-transparent",
            triggerText: "text-blue-500 dark:text-blue-400",
            triggerBorder: "border-transparent",
            modalGlow: "from-blue-500/30 to-transparent",
            modalIconText: "text-blue-600 dark:text-blue-400",
            shimmer: "from-blue-400 via-blue-300 to-blue-400"
        }
    },
    critic: {
        title: "Verified Critic",
        description: "A recognized voice in film criticism. This user provides top-tier analysis and journalistic reviews.",
        icon: <MdRateReview className="w-full h-full" />,
        colors: {
            triggerBg: "bg-indigo-50 dark:bg-indigo-900/30",
            triggerText: "text-indigo-600 dark:text-indigo-300",
            triggerBorder: "border-indigo-200 dark:border-indigo-800",
            modalGlow: "from-indigo-500/30 to-transparent",
            modalIconText: "text-indigo-600 dark:text-indigo-400",
            shimmer: "from-indigo-400 via-indigo-200 to-indigo-400"
        }
    },
    tester: {
        title: "Beta Tester",
        description: "An elite tester who helps identify bugs, provide feedback, and shape the future of Deeperweave through early access.",
        icon: <MdBugReport className="w-full h-full" />,
        colors: {
            triggerBg: "bg-purple-50 dark:bg-purple-900/30",
            triggerText: "text-purple-600 dark:text-purple-300",
            triggerBorder: "border-purple-200 dark:border-purple-800",
            modalGlow: "from-purple-500/30 to-transparent",
            modalIconText: "text-purple-600 dark:text-purple-400",
            shimmer: "from-purple-400 via-purple-200 to-purple-400"
        }
    },
    nsfw: {
        title: "Sensitive Profile",
        description: "This profile may contain content suitable for mature audiences only. Viewer discretion is advised.",
        icon: <MdExplicit className="w-full h-full" />,
        colors: {
            triggerBg: "bg-rose-50 dark:bg-rose-950/30",
            triggerText: "text-rose-600 dark:text-rose-400",
            triggerBorder: "border-rose-200 dark:border-rose-900",
            modalGlow: "from-rose-500/30 to-transparent",
            modalIconText: "text-rose-600 dark:text-rose-500",
            shimmer: "from-rose-400 via-rose-200 to-rose-400"
        }
    }
};

// --- Single Interactive Badge Component ---
function InteractiveBadge({ type, config }: { type: string, config: BadgeConfigData }) {
    const [isOpen, setIsOpen] = useState(false);
    const isBoxyStyle = type === 'nsfw';
    const isVerified = type === 'verified';
    const isDeveloper = type === 'developer';

    // Helper to determine shimmer color based on the config string
    const getShimmerColor = () => {
        if (!config.colors.shimmer) return 'transparent';
        if (config.colors.shimmer.includes('zinc')) return 'rgba(161, 161, 170, 0.2)';
        if (config.colors.shimmer.includes('emerald')) return 'rgba(52, 211, 153, 0.2)';
        if (config.colors.shimmer.includes('indigo')) return 'rgba(129, 140, 248, 0.2)';
        if (config.colors.shimmer.includes('purple')) return 'rgba(168, 85, 247, 0.2)';
        if (config.colors.shimmer.includes('amber')) return 'rgba(251, 191, 36, 0.2)';
        return 'rgba(251, 113, 133, 0.2)';
    };

    return (
        <>
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className={`
                    group relative flex items-center justify-center focus:outline-none transition-transform active:scale-95 overflow-hidden
                    ${isVerified
                    ? ''
                    : isBoxyStyle
                        ? `px-1.5 py-0.5 rounded-[2px] border ${config.colors.triggerBg} ${config.colors.triggerBorder}`
                        : `gap-1.5 px-2.5 py-0.5 rounded-full border ${config.colors.triggerBg} ${config.colors.triggerBorder}`
                }
                `}
            >
                {/* Continuous Background Shimmer Effect */}
                {!isVerified && config.colors.shimmer && (
                    <>
                        <div
                            className={`absolute inset-0`}
                            style={{
                                background: `linear-gradient(90deg, transparent, ${getShimmerColor()}, transparent)`,
                                animation: 'shimmer 3s linear infinite'
                            }}
                        />
                        <style jsx>{`
                            @keyframes shimmer {
                                0% { transform: translateX(-100%); }
                                100% { transform: translateX(200%); }
                            }
                        `}</style>
                    </>
                )}

                {/* Pulse Effect for Verified */}
                {isVerified && (
                    <>
                        <div className="absolute inset-0 rounded-full bg-blue-400/20 dark:bg-blue-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/0 via-blue-400/30 to-blue-400/0 animate-pulse" style={{ animationDuration: '2s' }} />
                    </>
                )}

                {isVerified ? (
                    <div className={`relative ${config.colors.triggerText} hover:brightness-110 transition-all hover:scale-110 duration-300`}>
                        <div className="w-5 h-5">{config.icon}</div>
                    </div>
                ) : isBoxyStyle ? (
                    <span className={`relative text-[9px] font-bold uppercase tracking-widest leading-none select-none ${config.colors.triggerText}`}>
                        NSFW
                    </span>
                ) : (
                    <>
                        <div className={`relative w-3.5 h-3.5 ${config.colors.triggerText} group-hover:scale-110 transition-transform duration-300`}>
                            {config.icon}
                        </div>
                        <span className={`relative text-[10px] font-bold uppercase tracking-widest ${config.colors.triggerText} ${isDeveloper ? 'font-mono' : ''}`}>
                            {type === 'staff' ? 'Staff' : type === 'developer' ? 'Dev' : type}
                        </span>
                    </>
                )}
            </button>

            {/* --- Sleek Modal --- */}
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className={`relative z-[100] ${inter.className}`} onClose={() => setIsOpen(false)}>
                    {/* Backdrop with heavy blur for focus */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-500"
                        enterFrom="opacity-0 backdrop-blur-none"
                        enterTo="opacity-100 backdrop-blur-xl"
                        leave="ease-in duration-300"
                        leaveFrom="opacity-100 backdrop-blur-xl"
                        leaveTo="opacity-0 backdrop-blur-none"
                    >
                        <div className="fixed inset-0 bg-zinc-900/40 dark:bg-black/80 transition-all" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
                                enterFrom="opacity-0 scale-95 translate-y-4"
                                enterTo="opacity-100 scale-100 translate-y-0"
                                leave="ease-in duration-300"
                                leaveFrom="opacity-100 scale-100 translate-y-0"
                                leaveTo="opacity-0 scale-95 translate-y-4"
                            >
                                <Dialog.Panel className="w-full max-w-sm relative transform overflow-hidden rounded-3xl bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl p-8 text-left align-middle shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-black/50 transition-all border border-white/50 dark:border-white/10 ring-1 ring-black/5">
                                    <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${config.colors.modalGlow} opacity-40 pointer-events-none`} />

                                    {/* Close Button Removed as per request (Redundant) */}

                                    <div className="relative flex flex-col items-center text-center pt-4">
                                        <div className="relative mb-6">
                                            <div className={`absolute inset-0 blur-2xl opacity-50 ${config.colors.modalIconText.replace('text-', 'bg-')} animate-pulse`} style={{ animationDuration: '3s' }} />
                                            <div className={`relative z-10 w-16 h-16 ${config.colors.modalIconText} drop-shadow-sm`}>
                                                {config.icon}
                                            </div>
                                        </div>

                                        <Dialog.Title
                                            as="h3"
                                            className={`${dmSerif.className} text-3xl text-zinc-900 dark:text-white mb-3`}
                                        >
                                            {config.title}
                                        </Dialog.Title>

                                        <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-[260px] mx-auto">
                                            {config.description}
                                        </p>

                                        <div className="mt-8 w-full">
                                            <button
                                                type="button"
                                                className="group w-full relative overflow-hidden rounded-full bg-zinc-900 dark:bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white dark:text-black transition-transform active:scale-[0.98] shadow-lg hover:shadow-xl hover:bg-zinc-800 dark:hover:bg-zinc-200"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <span className="relative z-10">Understood</span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
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

// --- Main Export ---
export default function UserBadge({ role, isNsfw }: { role: UserRole, isNsfw?: boolean }) {
    const activeBadges = [];

    // Prioritize developer if that is the role, but always allow NSFW
    if (isNsfw && BADGE_CONFIG.nsfw) {
        activeBadges.push({ type: 'nsfw', config: BADGE_CONFIG.nsfw });
    }

    if (role && role !== 'user' && BADGE_CONFIG[role]) {
        activeBadges.push({ type: role, config: BADGE_CONFIG[role] });
    }

    if (activeBadges.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            {activeBadges.map((badge) => (
                <InteractiveBadge key={badge.type} type={badge.type} config={badge.config} />
            ))}
        </div>
    );
}