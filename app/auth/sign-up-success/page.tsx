// @/app/auth/confirm/page.tsx (or your relevant path)
import Link from 'next/link';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Page() {
    // In a real application, you might get the user's email from search params
    const userEmail = "your registered email";

    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4 dark:bg-zinc-950">
            <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                {/* Icon */}
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/50">
                    <EnvelopeIcon className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                </div>

                {/* Content */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                        Confirm your email 😋
                    </h1>
                    <p className="mt-2 text-base text-gray-600 dark:text-zinc-400">
                        We sent a confirmation link to{' '}
                        <span className="font-medium text-gray-800 dark:text-zinc-200">{userEmail}</span>.
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-zinc-500">
                        If you don&apos;t see it, be sure to check your spam folder.
                    </p>
                </div>
            </div>
        </main>
    );
}