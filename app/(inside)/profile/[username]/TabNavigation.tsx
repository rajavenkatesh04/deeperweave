'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { motion, LayoutGroup } from 'framer-motion';
import {
    HomeIcon,
    ClockIcon,
    DocumentTextIcon,
    EllipsisHorizontalIcon,
    RectangleStackIcon,
    ListBulletIcon,
} from '@heroicons/react/24/outline';

const ICONS: Record<string, React.ElementType> = {
    Podium: HomeIcon,
    Timeline: ClockIcon,
    Lists: ListBulletIcon,
    Posts: DocumentTextIcon,
    More: EllipsisHorizontalIcon,
};

// Kept your colors but applied them more subtly
const TAB_ACCENTS: Record<string, string> = {
    Podium: 'bg-orange-500',
    Timeline: 'bg-blue-500',
    Lists: 'bg-pink-500',
    Posts: 'bg-teal-500',
    More: 'bg-purple-500',
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
        { name: 'Lists', href: `/lists` },
        { name: 'Posts', href: `${baseUrl}/posts` },
    ];

    if (isOwnProfile) {
        tabs.push({ name: 'More', href: `${baseUrl}/more` });
    }

    return (
        <div className="sticky top-0 z-40 w-full bg-white/75 dark:bg-zinc-950/75 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4">
                <LayoutGroup>
                    <nav
                        className="
                            relative flex items-center h-14 gap-8
                            overflow-x-auto scrollbar-hide
                            md:justify-center md:gap-12
                        "
                        aria-label="Tabs"
                    >
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.href;
                            const Icon = ICONS[tab.name] || RectangleStackIcon;
                            const accentColor = TAB_ACCENTS[tab.name] || 'bg-zinc-900 dark:bg-zinc-100';

                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className={clsx(
                                        'group relative flex items-center gap-2 h-full px-1',
                                        'text-xs font-bold uppercase tracking-widest whitespace-nowrap select-none transition-colors duration-200',
                                        isActive
                                            ? 'text-zinc-900 dark:text-zinc-100'
                                            : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                                    )}
                                >
                                    <Icon
                                        className={clsx(
                                            'w-4 h-4 transition-all duration-300',
                                            isActive ? 'scale-110 stroke-[2.5px]' : 'group-hover:scale-105'
                                        )}
                                    />
                                    <span>{tab.name}</span>

                                    {/* ACTIVE INDICATOR */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-tab-line"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 400,
                                                damping: 30,
                                            }}
                                            className={clsx(
                                                'absolute bottom-0 left-0 right-0 h-[2px]',
                                                accentColor
                                            )}
                                        />
                                    )}

                                    {/* HOVER GLOW (Subtle user feedback) */}
                                    {!isActive && (
                                        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-zinc-200 dark:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </LayoutGroup>
            </div>
        </div>
    );
}