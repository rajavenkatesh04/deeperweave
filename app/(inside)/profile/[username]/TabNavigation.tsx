'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function TabNavigation({ username, isOwnProfile }: { username: string; isOwnProfile: boolean }) {
    const pathname = usePathname();
    const baseUrl = `/profile/${username}`;

    // Base tabs visible to everyone
    const baseTabs = [
        { name: 'Posts', href: baseUrl },
        { name: 'More', href: `${baseUrl}/more` },
    ];

    // Conditionally add the 'Home' tab for the profile owner
    const tabs = isOwnProfile
        ? [{ name: 'Home', href: `${baseUrl}/home` }, ...baseTabs]
        : baseTabs;

    return (
        <div className="border-b border-gray-200 dark:border-zinc-800">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                    // Make the 'Posts' tab active even if we are on the base URL (e.g., /profile/god)
                    const isActive = pathname === tab.href || (tab.href === baseUrl && pathname === `${baseUrl}/`);
                    return (
                        <Link key={tab.name} href={tab.href} className={clsx('whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium', isActive ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-zinc-400 dark:hover:border-zinc-700')}>
                            {tab.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}