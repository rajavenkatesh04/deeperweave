'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { motion, LayoutGroup } from 'framer-motion';
import {
    MdOutlineLeaderboard,
    MdOutlineTimeline,
    MdOutlineFormatListBulleted,
    MdOutlineArticle,
    MdOutlineMoreHoriz,
    MdOutlineViewStream,
    MdHistory
} from 'react-icons/md';

// --- Configuration ---
const ICONS: Record<string, React.ElementType> = {
    Podium: MdOutlineLeaderboard,
    Timeline: MdHistory,
    Lists: MdOutlineFormatListBulleted,
    Posts: MdOutlineArticle,
    Analytics: MdOutlineTimeline,
    More: MdOutlineMoreHoriz,
};

const ACCENT_COLORS: Record<string, string> = {
    Podium: 'text-orange-600 dark:text-orange-400',
    Timeline: 'text-blue-600 dark:text-blue-400',
    Lists: 'text-pink-600 dark:text-pink-400',
    Posts: 'text-teal-600 dark:text-teal-400',
    Analytics: 'text-emerald-600 dark:text-emerald-400',
    More: 'text-purple-600 dark:text-purple-400',
};

export default function TabNavigation({
                                          username,
                                          isOwnProfile,
                                      }: {
    username: string;
    isOwnProfile: boolean;
}) {
    const pathname = usePathname();
    const baseUrl = `/profile/${username}`;

    const tabs = [
        { name: 'Podium', href: `${baseUrl}/podium` },
        { name: 'Timeline', href: `${baseUrl}/timeline` },
        { name: 'Lists', href: `${baseUrl}/lists` },
        { name: 'Posts', href: `${baseUrl}/posts` },
        { name: 'Analytics', href: `${baseUrl}/analytics` },
    ];

    if (isOwnProfile) {
        tabs.push({ name: 'More', href: `${baseUrl}/more` });
    }

    return (
        // FIX: Lowered to z-10 so it stays below modals (which should be z-50 or z-100)
        <div className="sticky top-0 z-10 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
            <div className="max-w-4xl mx-auto px-2 md:px-4">
                <LayoutGroup id="profile-tabs">
                    <nav
                        className="flex items-center h-14 w-full overflow-x-auto scrollbar-hide gap-1 md:gap-2"
                        aria-label="Profile Sections"
                    >
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.href;
                            const Icon = ICONS[tab.name] || MdOutlineViewStream;
                            const activeColorClass = ACCENT_COLORS[tab.name] || 'text-zinc-900 dark:text-zinc-100';

                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className="relative flex-1 min-w-[60px] h-10 group outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded-full"
                                >
                                    <motion.div
                                        whileTap={{ scale: 0.95 }}
                                        className={clsx(
                                            "relative w-full h-full flex items-center justify-center gap-2 rounded-full px-3 py-1.5 transition-colors duration-300 z-10",
                                            isActive
                                                ? activeColorClass
                                                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                                        )}
                                    >
                                        <Icon className={clsx("w-5 h-5 md:w-4 md:h-4 relative z-10")} />
                                        <span className={clsx(
                                            "hidden md:block text-xs md:text-sm font-bold tracking-wide uppercase relative z-10",
                                        )}>
                                            {tab.name}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-tab-pill"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 30
                                                }}
                                                className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800/80 rounded-full shadow-sm"
                                            />
                                        )}
                                        {!isActive && (
                                            <div className="absolute inset-0 rounded-full bg-zinc-100/50 dark:bg-zinc-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </nav>
                </LayoutGroup>
            </div>
        </div>
    );
}