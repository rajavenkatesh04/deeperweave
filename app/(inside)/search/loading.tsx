const shimmer =
    'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-zinc-100/50 dark:before:via-zinc-800/50 before:to-transparent';

export default function Loading() {
    return (
        <div className="w-full max-w-2xl mx-auto pt-8 px-4 md:px-6 space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <div className={`h-6 w-32 bg-zinc-100 dark:bg-zinc-900 rounded-md ${shimmer}`} />
                <div className={`h-4 w-48 bg-zinc-50 dark:bg-zinc-900/50 rounded-md ${shimmer}`} />
            </div>

            {/* Search Input Skeleton */}
            <div className={`h-14 w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl ${shimmer}`} />

            {/* Results Skeleton */}
            <div className="space-y-6 pt-4">
                {/* Section Header */}
                <div className="flex justify-between items-center px-1">
                    <div className={`h-3 w-16 bg-zinc-100 dark:bg-zinc-900 rounded ${shimmer}`} />
                    <div className={`h-3 w-8 bg-zinc-100 dark:bg-zinc-900 rounded ${shimmer}`} />
                </div>

                {/* List Skeleton */}
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`h-16 w-full bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 ${shimmer}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}