'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Best practice: Log the error to an error reporting service like Sentry
        console.error(error);
    }, [error]);

    return (
        <main className="flex min-h-full flex-col items-center justify-center bg-gray-50 p-8 dark:bg-zinc-950">
            <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-white p-8 text-center shadow-2xl shadow-red-500/10 dark:border-red-500/30 dark:bg-zinc-900 dark:shadow-red-500/20">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-500" aria-hidden="true" />
                </div>

                <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
                    Oops, Something Went Wrong
                </h1>

                <p className="mt-4 text-base text-gray-600 dark:text-zinc-400">
                    We encountered an unexpected issue. Please try again.
                </p>

                <div className="mt-10 flex items-center justify-center gap-4">
                    <button
                        onClick={() => reset()}
                        className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:bg-white dark:text-gray-900 dark:focus:ring-white"
                    >
                        <ArrowPathIcon className="h-5 w-5 transition-transform duration-200 group-hover:rotate-180" />
                        <span>Try Again</span>
                    </button>
                    <Link
                        href="/"
                        className="text-sm font-semibold text-gray-700 hover:underline dark:text-zinc-300"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </main>
    );
}