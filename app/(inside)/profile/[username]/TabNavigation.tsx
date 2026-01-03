'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
    HomeIcon,
    ClockIcon,
    DocumentTextIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

const ICONS: Record<string, React.ElementType> = {
    'Home': HomeIcon,
    'Timeline': ClockIcon,
    'Posts': DocumentTextIcon,
    'More': EllipsisHorizontalIcon,
};

export default function TabNavigation({ username, isOwnProfile }: { username: string; isOwnProfile: boolean }) {
    const pathname = usePathname();
    const baseUrl = `/profile/${username}`;

    const tabs = isOwnProfile
        ? [
            { name: 'Home', href: `${baseUrl}/home` },
            { name: 'Timeline', href: `${baseUrl}/timeline` },
            { name: 'Posts', href: `${baseUrl}/posts` },
            { name: 'More', href: `${baseUrl}/more` },
        ]
        : [
            { name: 'Home', href: `${baseUrl}/home` },
            { name: 'Timeline', href: `${baseUrl}/timeline` },
            { name: 'Posts', href: `${baseUrl}/posts` },
        ];

    return (
        <div className="w-full border-b border-zinc-200 dark:border-zinc-800 mt-4 mb-8">
            <nav className="flex space-x-6 md:space-x-8 overflow-x-auto hide-scrollbar" aria-label="Tabs">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const Icon = ICONS[tab.name] || HomeIcon;

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={clsx(
                                'group flex items-center gap-2 py-4 border-b-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 whitespace-nowrap',
                                {
                                    // ACTIVE: Sharp Black/White Text + Solid Underline
                                    'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100': isActive,

                                    // INACTIVE: Gray Text + Transparent Border (Hover shows light gray border)
                                    'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700': !isActive,
                                }
                            )}
                        >
                            <Icon className={clsx(
                                "w-4 h-4 transition-colors",
                                isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                            )} />
                            <span>{tab.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}