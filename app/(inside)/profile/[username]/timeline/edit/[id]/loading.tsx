// app/timeline/edit/[id]/loading.tsx

import LoadingSpinner from '@/app/ui/loading-spinner';

// This is a basic skeleton. You can customize it to look
// more like your form if you want.
export default function Loading() {
    return (
        <div className="w-full max-w-lg mx-auto rounded-lg border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 mt-8">
            <div className="mb-4 h-4 w-32 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
            <h2 className="text-xl font-bold mb-4 h-7 w-48 rounded bg-gray-300 dark:bg-zinc-600 animate-pulse"></h2>

            <div className="space-y-6">
                {/* Movie Search Skeleton */}
                <div className="space-y-2">
                    <div className="h-4 w-16 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
                    <div className="h-10 w-full rounded-md bg-gray-100 dark:bg-zinc-800 animate-pulse"></div>
                </div>

                {/* Date & Rating Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="h-4 w-20 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
                        <div className="h-10 w-full rounded-md bg-gray-100 dark:bg-zinc-800 animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-16 rounded bg-gray-200 dark:bg-zinc-700 animate-pulse"></div>
                        <div className="flex h-10 items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse"></div>
                            <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse"></div>
                            <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse"></div>
                            <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse"></div>
                            <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Submit Button Skeleton */}
                <div className="flex h-10 w-full items-center justify-center rounded-lg bg-rose-400 animate-pulse text-white font-medium">
                    <LoadingSpinner className="mr-2" />
                    Loading Entry...
                </div>
            </div>
        </div>
    );
}