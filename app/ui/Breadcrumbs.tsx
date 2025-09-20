import { clsx } from 'clsx';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface Breadcrumb {
    label: string;
    href: string;
    active?: boolean;
}

export default function Breadcrumbs({
                                        breadcrumbs,
                                    }: {
    breadcrumbs: Breadcrumb[];
}) {
    return (
        <nav aria-label="Breadcrumb" className="mb-4 block">
            <ol className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((breadcrumb, index) => (
                    <li
                        key={breadcrumb.href}
                        aria-current={breadcrumb.active ? 'page' : undefined} // Improved accessibility
                        className="flex items-center"
                    >
                        <Link
                            href={breadcrumb.href}
                            className={clsx(
                                'transition-colors duration-200',
                                breadcrumb.active
                                    ? 'font-semibold text-pink-600 dark:text-pink-400' // Active link in pink
                                    : 'text-gray-600 hover:text-pink-600 dark:text-zinc-400 dark:hover:text-pink-400', // Inactive link, pink on hover
                            )}
                        >
                            {breadcrumb.label}
                        </Link>

                        {index < breadcrumbs.length - 1 ? (
                            <ChevronRightIcon className="ml-2 h-4 w-4 text-gray-400 dark:text-zinc-600" />
                        ) : null}
                    </li>
                ))}
            </ol>
        </nav>
    );
}