import { clsx } from 'clsx';
import Link from 'next/link';

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
        <nav aria-label="Breadcrumb" className="mb-6 block">
            <ol className="flex items-center flex-wrap">
                {breadcrumbs.map((breadcrumb, index) => (
                    <li
                        key={breadcrumb.href}
                        aria-current={breadcrumb.active ? 'page' : undefined}
                        className="flex items-center"
                    >
                        <Link
                            href={breadcrumb.href}
                            className={clsx(
                                'font-mono text-[10px] md:text-xs uppercase tracking-[0.15em] transition-all duration-200',
                                breadcrumb.active
                                    // Active: Sharp contrast, bold, with a technical underline
                                    ? 'text-zinc-900 dark:text-zinc-100 font-bold border-b-2 border-zinc-900 dark:border-zinc-100'
                                    // Inactive: Dimmed, fades in on hover
                                    : 'text-zinc-400 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300 no-underline'
                            )}
                        >
                            {breadcrumb.label}
                        </Link>

                        {/* Separator: A simple technical slash instead of an icon */}
                        {index < breadcrumbs.length - 1 ? (
                            <span className="mx-3 text-zinc-300 dark:text-zinc-800 font-mono text-[10px] select-none">
                                /
                            </span>
                        ) : null}
                    </li>
                ))}
            </ol>
        </nav>
    );
}