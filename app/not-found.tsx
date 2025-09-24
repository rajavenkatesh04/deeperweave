import Link from 'next/link';
import { ArrowLeftIcon, FaceFrownIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-8 dark:bg-zinc-950">
            <div className="w-full max-w-lg text-center">

                <FaceFrownIcon className="mx-auto h-24 w-24 text-gray-400 dark:text-zinc-600" aria-hidden="true" />

                <h1 className="mt-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-6xl">
                    404
                </h1>

                <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-zinc-200">
                    Page Not Found
                </h2>

                <p className="mt-4 text-base text-gray-600 dark:text-zinc-400">
                    Oops! It seems you&apos;ve ventured into uncharted territory. The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <div className="mt-10">
                    <Link
                        href="/"
                        className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:bg-white dark:text-gray-900 dark:focus:ring-white"
                    >
                        <ArrowLeftIcon className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
                        <span>Go Back Home</span>
                    </Link>
                </div>

            </div>
        </main>
    );
}