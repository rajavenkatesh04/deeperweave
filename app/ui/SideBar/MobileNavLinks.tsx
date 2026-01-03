'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { BookOpenIcon, PlusCircleIcon, HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
    BookOpenIcon as BookOpenSolid,
    PlusCircleIcon as PlusCircleSolid,
    HomeIcon as HomeSolid,
    MagnifyingGlassIcon as MagnifyingGlassSolid
} from '@heroicons/react/24/solid';

const links = [
    { name: 'Discover', href: '/discover', icon: HomeIcon, solidIcon: HomeSolid },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon, solidIcon: MagnifyingGlassSolid },
    { name: 'Create', href: '/create', icon: PlusCircleIcon, solidIcon: PlusCircleSolid },
    { name: 'Blogs', href: '/blog', icon: BookOpenIcon, solidIcon: BookOpenSolid },
];

export default function MobileNavLinks() {
    const pathname = usePathname();

    return (
        <>
            {links.map((link) => {
                const isActive = pathname === link.href;
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