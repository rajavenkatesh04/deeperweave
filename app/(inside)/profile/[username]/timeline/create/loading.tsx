export default function Loading() {
    const shimmer =
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent dark:before:via-black/40';

    return (
        <div className={`${shimmer} relative w-full max-w-lg mx-auto rounded-lg border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden`}>
            {/* Title Skeleton */}
            <div className="h-7 w-32 rounded-md bg-gray-200 dark:bg-zinc-800 mb-6" />

            <div className="space-y-6">
                {/* Movie Search Skeleton */}
                <div className="space-y-2">
                    <div className="h-4 w-16 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-10 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>

                {/* Watched On & Rating Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="h-4 w-24 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-10 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-20 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="flex items-center gap-1">
                            <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-zinc-800" />
                            <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-zinc-800" />
                            <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-zinc-800" />
                            <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-zinc-800" />
                            <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-zinc-800" />
                        </div>
                    </div>
                </div>

                {/* Notes Textarea Skeleton */}
                <div className="space-y-2">
                    <div className="h-4 w-32 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-20 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>

                {/* Submit Button Skeleton */}
                <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}