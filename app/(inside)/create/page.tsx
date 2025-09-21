'use client';

import Link from 'next/link';
import { ArrowRightIcon, DocumentPlusIcon, CalendarDaysIcon, RectangleStackIcon } from '@heroicons/react/24/outline';

// Type for the creation options and CreateCard props
interface CreationOption {
    title: string;
    description: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    iconBgColor: string;
    iconTextColor: string;
}

// Data for the different creation options. This makes it easy to add more in the future.
const creationOptions: CreationOption[] = [
    {
        title: 'Blog Post',
        description: 'Share your thoughts and ideas in a long-form article with rich content.',
        href: '/blog/create',
        icon: DocumentPlusIcon,
        iconBgColor: 'bg-sky-100 dark:bg-sky-900/50',
        iconTextColor: 'text-sky-600 dark:text-sky-400',
    },
    {
        title: 'Timeline Event',
        description: 'Add a new milestone, memory, or significant event to your personal timeline.',
        href: '/timeline/create',
        icon: CalendarDaysIcon,
        iconBgColor: 'bg-purple-100 dark:bg-purple-900/50',
        iconTextColor: 'text-purple-600 dark:text-purple-400',
    },
];

function CreateCard({
                        title,
                        description,
                        href,
                        icon: Icon,
                        iconBgColor,
                        iconTextColor
                    }: CreationOption) {
    return (
        <Link href={href} className="group relative block overflow-hidden rounded-2xl transition-all duration-300 ease-in-out hover:-translate-y-1">
            {/* --- Background and Border Elements --- */}
            <div className="absolute inset-0 bg-white dark:bg-zinc-900/50 ring-1 ring-inset ring-gray-200/80 dark:ring-white/10 group-hover:ring-gray-300 dark:group-hover:ring-white/20 transition-all duration-300 ease-in-out"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-zinc-900 dark:via-zinc-800/50 dark:to-zinc-900"></div>
            <div className="relative p-6 sm:p-8">
                <div className="flex items-start gap-4">
                    {/* --- Icon --- */}
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${iconBgColor} transition-colors duration-300`}>
                        <Icon className={`h-7 w-7 ${iconTextColor}`} aria-hidden="true" />
                    </div>
                    {/* --- Text Content --- */}
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                            {title}
                        </h3>
                        <p className="mt-1 text-base text-gray-600 dark:text-zinc-400">
                            {description}
                        </p>
                    </div>
                </div>
                {/* --- Action Indicator --- */}
                <div className="mt-6 flex items-center justify-end gap-2 text-sm font-medium text-gray-500 dark:text-zinc-500 group-hover:text-gray-800 dark:group-hover:text-zinc-200 transition-colors duration-300">
                    <span>Create</span>
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}

export default function Page() {
    return (
        <div className="relative min-h-screen w-full bg-gray-50 text-gray-800 dark:bg-zinc-900 dark:text-zinc-200">
            {/* Grid background pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.06]"></div>

            <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-4xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-5xl">
                        What will you create today?
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-zinc-400">
                        Choose a content type to get started.
                    </p>
                </div>

                <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                    {creationOptions.map((option) => (
                        <CreateCard key={option.title} {...option} />
                    ))}
                </div>
            </main>
        </div>
    );
}