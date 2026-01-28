'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
// Importing Material Design icons (Outline vs Filled versions)
import {
    MdOutlineHome, MdHome,                  // Discover
    MdOutlineSearch, MdSearch,              // Search
    MdOutlineAddCircle, MdAddCircle,        // Create
    MdOutlineMenuBook, MdMenuBook           // Blogs (Open Book)
} from 'react-icons/md';

const links = [
    {
        name: 'Discover',
        href: '/discover',
        icon: MdOutlineHome,
        solidIcon: MdHome
    },
    {
        name: 'Search',
        href: '/search',
        icon: MdOutlineSearch,
        solidIcon: MdSearch
    },
    {
        name: 'Create',
        href: '/create',
        icon: MdOutlineAddCircle,
        solidIcon: MdAddCircle
    },
    {
        name: 'Blogs',
        href: '/blog',
        icon: MdOutlineMenuBook,
        solidIcon: MdMenuBook
    },
];

export default function MobileNavLinks() {
    const pathname = usePathname();

    return (
        <>
            {links.map((link) => {
                const isActive = pathname === link.href;
                // Dynamically select the Solid or Outline icon based on state
                const LinkIcon = isActive ? link.solidIcon : link.icon;

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={clsx(
                            'relative flex h-full w-16 flex-col items-center justify-center gap-1 transition-colors',
                            {
                                'text-zinc-900 dark:text-zinc-100': isActive,
                                'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300': !isActive,
                            },
                        )}
                    >
                        {/* Indicator Line at Top */}
                        {isActive && (
                            <div className="absolute top-0 w-8 h-0.5 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                        )}

                        <LinkIcon className="h-6 w-6" />
                    </Link>
                );
            })}
        </>
    );
}