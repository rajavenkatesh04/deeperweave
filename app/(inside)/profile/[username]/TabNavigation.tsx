// app/ui/users/TabNavigation.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function TabNavigation({ username, isOwnProfile }: { username: string; isOwnProfile: boolean }) {
    const pathname = usePathname();
    const baseUrl = `/profile/${username}`;

    // ✨ NEW LOGIC: Define the entire set of tabs based on isOwnProfile.
    const tabs = isOwnProfile
        ? [
            { name: 'Home', href: `${baseUrl}/home` },
            { name: 'Posts', href: `${baseUrl}/posts` },
            { name: 'More', href: `${baseUrl}/more` },
        ]
        : [
            { name: 'Home', href: `${baseUrl}/home` },
            { name: 'Posts', href: `${baseUrl}/posts` },
        ];

    return (
        <div className="border-b border-gray-200 dark:border-zinc-800 mt-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                    // A simple, exact path match determines the active tab.
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={clsx(
                                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors',
                                isActive
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300'
                            )}
                        >
                            {tab.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}