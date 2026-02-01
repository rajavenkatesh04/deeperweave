'use client';

import { MdOutlineLock } from 'react-icons/md';

export default function PrivateProfileScreen() {
    return (
        <div className="w-full py-32 flex flex-col items-center justify-center text-center bg-zinc-50 dark:bg-zinc-950 border-y border-zinc-200 dark:border-zinc-800 px-4">

            {/* Icon - Matches the "Sensitive Content" gray styling */}
            <MdOutlineLock className="w-10 h-10 mb-4 text-zinc-400" />

            {/* Title - Matches text-lg font-bold */}
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                Private Account
            </h2>

            {/* Description - Matches text-sm text-zinc-600 */}
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
                This timeline is currently private. <br className="hidden sm:block" />
                Follow this user to view their weave.
            </p>

        </div>
    );
}