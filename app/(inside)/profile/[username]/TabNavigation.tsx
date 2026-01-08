'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
    HomeIcon,
    ClockIcon,
    DocumentTextIcon,
    EllipsisHorizontalIcon,
    RectangleStackIcon, ListBulletIcon
} from '@heroicons/react/24/outline';

const ICONS: Record<string, React.ElementType> = {
    'Home': HomeIcon,
    'Timeline': ClockIcon,
    'Lists': ListBulletIcon,
    'Posts': DocumentTextIcon,
    'More': EllipsisHorizontalIcon,
};

export default function TabNavigation({ username, isOwnProfile }: { username: string; isOwnProfile: boolean }) {
    const pathname = usePathname();
    const baseUrl = `/profile/${username}`;

    const tabs = [
        { name: 'Home', href: `${baseUrl}/home` },
        { name: 'Timeline', href: `${baseUrl}/timeline` },
        { name: 'Lists', href: `${baseUrl}/lists` },
        { name: 'Posts', href: `${baseUrl}/posts` },
    ];

    if (isOwnProfile) {
        tabs.push({ name: 'More', href: `${baseUrl}/more` });
    }

    return (
        <div className="sticky top-0 z-40 w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
                <nav className="flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        const Icon = ICONS[tab.name] || RectangleStackIcon;

                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={clsx(
                                    'group relative flex items-center gap-2 py-5 text-xs font-bold uppercase tracking-widest transition-colors duration-200 whitespace-nowrap outline-none select-none',
                                    {
                                        // Active State: High Contrast
                                        'text-zinc-900 dark:text-zinc-100': isActive,
                                        // Inactive State: Muted
                                        'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200': !isActive,
                                    }
                                )}
                            >
                                <Icon className={clsx(
                                    "w-4 h-4 transition-transform duration-300",
                                    isActive ? "stroke-2" : "group-hover:-translate-y-0.5"
                                )} />

                                <span>{tab.name}</span>

                                {/* Active Indicator: Sharp Black Line */}
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 dark:bg-zinc-100 animate-in zoom-in-x duration-300" />
                                )}

                                {/* Hover Indicator: Ghost Line */}
                                {!isActive && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-200 dark:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}