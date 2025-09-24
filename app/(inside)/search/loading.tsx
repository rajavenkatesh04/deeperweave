const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

/**
 * Skeleton for a single user search result item.
 */
function UserResultCardSkeleton() {
    return (
        <div className="flex items-center gap-4 p-3">
            <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-200 dark:bg-zinc-800" />
            <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-2/5 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="h-3 w-1/4 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

/**
 * Main skeleton for the entire search page.
 */
export default function Loading() {
    return (
        <main className={`${shimmer} relative overflow-hidden space-y-6 p-6`}>
            {/* Header Skeleton */}
            <div>
                <div className="h-8 w-40 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="mt-2 h-4 w-72 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>

            {/* Search Input Skeleton */}
            <div className="h-12 w-full rounded-lg bg-gray-200 dark:bg-zinc-800" />

            {/* Results Section Skeleton */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 min-h-[300px]">
                <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {/* Render a few placeholder cards */}
                    {[...Array(5)].map((_, i) => (
                        <li key={i}>
                            <UserResultCardSkeleton />
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
}
