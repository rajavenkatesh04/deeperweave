'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import {
    BookOpenIcon,
    PlusCircleIcon,
    HomeIcon,
    MagnifyingGlassIcon,
    BellIcon,
    BookmarkIcon
} from '@heroicons/react/24/outline';

const links = [
    { name: 'Discover', href: '/discover', icon: HomeIcon },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon},
    { name: 'Create', href: '/create', icon: PlusCircleIcon },
    { name: 'Blogs', href: '/blog', icon: BookOpenIcon },
    { name: 'Saved', href: '/profile/saved', icon: BookmarkIcon },
    { name: 'Notifications', href: '/profile/notifications', icon: BellIcon },
];

export default function DesktopNavLinks() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col space-y-1">
            {links.map((link) => {
                const LinkIcon = link.icon;
                const isActive = pathname === link.href;

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={clsx(
                            'group relative flex items-center gap-4 px-4 py-3 text-sm font-medium transition-all duration-200 border-l-2',
                            {
                                // Active State: Black/White bar, bold text
                                'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100': isActive,
                                // Inactive State: Transparent border, gray text
                                'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/50': !isActive,
                            },
                        )}
                    >
                        <LinkIcon className={clsx("h-5 w-5 transition-colors", {
                            "text-zinc-900 dark:text-zinc-100": isActive,
                            "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300": !isActive
                        })} />

                        <span className="uppercase tracking-widest text-xs font-bold">
                            {link.name}
                        </span>

                        {/* Hover Chevron */}
                        {!isActive && (
                            <span className="ml-auto opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all text-xs text-zinc-400">
                                →
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}