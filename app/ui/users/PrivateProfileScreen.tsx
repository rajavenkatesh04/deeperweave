import { LockClosedIcon } from '@heroicons/react/24/solid';

// Props are no longer needed as the FollowButton has been removed.
export default function PrivateProfileScreen() {
    return (
        // Added a subtle background gradient and pinkish dashed border
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-500/20 py-20 text-center dark:border-rose-500/10 dark:from-zinc-900 dark:to-rose-950/20">

            {/* Icon is now pink */}
            <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-pink-200 opacity-50 blur-lg dark:bg-pink-500/20"></div>
                <LockClosedIcon className="relative h-12 w-12 text-pink-500" />
            </div>

            {/* Heading is now a larger, bolder gradient text */}
            <h2 className="mt-4 bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-2xl font-bold text-transparent">
                This Account is Private
            </h2>

            {/* Slightly reworded the descriptive text for better clarity */}
            <p className="mt-2 max-w-sm text-base text-gray-600 dark:text-zinc-400">
                Follow this account to see their posts and activity. Once your request is accepted, you&apos;ll have full access.
            </p>
        </div>
    );
}