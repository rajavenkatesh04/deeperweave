'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { BookOpenIcon, PlusCircleIcon, HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const links = [
    { name: 'Discover', href: '/discover', icon: HomeIcon },
    { name: 'Blogs', href: '/blog', icon: BookOpenIcon },
    { name: 'Create', href: '/create', icon: PlusCircleIcon },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon},
];

export default function MobileNavLinks() {
    const pathname = usePathname();

    return (
        <>
            {links.map((link) => {
                const LinkIcon = link.icon;
                const isActive = pathname === link.href;

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={clsx(
                            'flex h-full w-max flex-col items-center justify-center gap-1 text-xs transition-colors',
                            {
                                'text-red-600 dark:text-red-400': isActive,
                                'text-gray-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400': !isActive,
                            },
                        )}
                    >
                        <LinkIcon className="h-7 w-7" />
                        {/* Optional: Add text label below icon if you want */}
                        {/* <span className="text-[10px]">{link.name}</span> */}
                    </Link>
                );
            })}
        </>
    );
}