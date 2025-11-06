'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-24 text-center dark:bg-[#09090b]">
            <div className="max-w-3xl space-y-8">
                {/* Subtle technical digest for developers/support if needed, keeps it formal */}
                {error.digest && (
                    <p className="font-mono text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                        Error Digest: {error.digest}
                    </p>
                )}

                <h1 className="text-5xl font-semibold tracking-tighter text-zinc-900 sm:text-7xl dark:text-white">
                    Something went wrong.
                </h1>

                <p className="mx-auto max-w-lg text-lg text-zinc-500 dark:text-zinc-400">
                    We apologize for the inconvenience. An unexpected error has occurred while processing your request.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-8">
                    <button
                        onClick={() => reset()}
                        className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-md bg-zinc-900 px-8 text-sm font-medium text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        <ArrowPathIcon className="h-4 w-4 transition-transform group-hover:rotate-180" />
                        <span>Try Again</span>
                    </button>
                    <Link
                        href="/"
                        className="inline-flex h-12 items-center justify-center rounded-md border border-zinc-200 px-8 text-sm font-medium text-zinc-900 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </main>
    );
}