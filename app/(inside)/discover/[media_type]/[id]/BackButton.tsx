// app/components/BackButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-md text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-white transition-colors border border-gray-200/50 dark:border-white/10 shadow-sm"
        >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
        </button>
    );
}