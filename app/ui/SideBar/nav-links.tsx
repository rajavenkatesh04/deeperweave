'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { BookOpenIcon, PlusCircleIcon, HomeIcon } from '@heroicons/react/24/outline';

const links = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Blogs', href: '/blog', icon: BookOpenIcon },
    { name: 'Create', href: '/blog/create', icon: PlusCircleIcon },
];

export default function NavLinks() {
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
                            'relative flex h-12 w-full items-center justify-start gap-2 rounded-md px-3 text-sm font-medium transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
                            {
                                'border border-pink-200 bg-pink-100 text-pink-600 dark:border-pink-800/50 dark:bg-pink-900/20 dark:text-pink-300 md:bg-gray-100 md:text-gray-900 md:dark:bg-zinc-800 md:dark:text-zinc-100': isActive,
                                'text-gray-700 dark:text-zinc-300': !isActive,
                            },
                        )}
                        title={link.name}
                    >
                        <LinkIcon className="h-6 w-6" />
                        <p className="hidden md:block">{link.name}</p>
                    </Link>
                );
            })}
        </nav>
    );
}