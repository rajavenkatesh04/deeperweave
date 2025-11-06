import Link from 'next/link';
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-24 text-center dark:bg-[#09090b]">
            <div className="max-w-3xl space-y-8">
                <h1 className="text-5xl font-semibold tracking-tighter text-zinc-900 sm:text-7xl dark:text-white">
                    Page Not Found
                </h1>

                <p className="mx-auto max-w-lg text-lg text-zinc-500 dark:text-zinc-400">
                    We&apos;re sorry, but the page you are looking for does not exist. It may have been moved, deleted, or you may have mistyped the address.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-8">
                    <Link
                        href="/"
                        className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-md bg-zinc-900 px-8 text-sm font-medium text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span>Return Home</span>
                    </Link>
                    <Link
                        href="/discover"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-zinc-200 px-8 text-sm font-medium text-zinc-900 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
                    >
                        <MagnifyingGlassIcon className="h-4 w-4" />
                        <span>Discover Content</span>
                    </Link>
                </div>
            </div>
        </main>
    );
}