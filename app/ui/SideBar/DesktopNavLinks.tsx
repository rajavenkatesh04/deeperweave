'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { BookOpenIcon, PlusCircleIcon, HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const links = [
    { name: 'Feed', href: '/feed', icon: HomeIcon },
    { name: 'Blogs', href: '/blog', icon: BookOpenIcon },
    { name: 'Create', href: '/create', icon: PlusCircleIcon },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon},
];

export default function DesktopNavLinks() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col space-y-2">
            {links.map((link) => {
                const LinkIcon = link.icon;
                const isActive = pathname === link.href;

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={clsx(
                            'flex items-center gap-3 rounded-md p-3 text-sm font-medium transition-colors hover:bg-red-50 dark:hover:bg-red-900/20',
                            {
                                'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400': isActive,
                                'text-gray-700 dark:text-zinc-300': !isActive,
                            },
                        )}
                    >
                        <LinkIcon className="h-6 w-6" />
                        <p className="hidden lg:block">{link.name}</p>
                    </Link>
                );
            })}
        </nav>
    );
}