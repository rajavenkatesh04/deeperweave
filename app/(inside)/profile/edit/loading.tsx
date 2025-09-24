const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export default function Loading() {
    return (
        <main className="p-6">
            <div className={`${shimmer} relative overflow-hidden`}>
                {/* Breadcrumbs Skeleton */}
                <div className="h-5 w-48 rounded-md bg-gray-200 dark:bg-zinc-800" />

                <div className="mt-6 space-y-8">
                    {/* --- Profile Picture Section Skeleton --- */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="h-6 w-40 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="mt-4 flex items-center gap-6">
                            <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-zinc-800" />
                            <div className="h-10 w-36 rounded-lg bg-gray-200 dark:bg-zinc-800" />
                        </div>
                    </div>

                    {/* --- User Details Section Skeleton --- */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="h-6 w-32 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                            {/* Display Name Input */}
                            <div>
                                <div className="h-4 w-24 rounded-md bg-gray-200 dark:bg-zinc-800" />
                                <div className="mt-1 h-9 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                            </div>
                            {/* Username Input */}
                            <div>
                                <div className="h-4 w-20 rounded-md bg-gray-200 dark:bg-zinc-800" />
                                <div className="mt-1 h-9 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                            </div>
                            {/* Bio Textarea */}
                            <div className="sm:col-span-2">
                                <div className="h-4 w-12 rounded-md bg-gray-200 dark:bg-zinc-800" />
                                <div className="mt-1 h-20 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                            </div>
                        </div>
                    </div>

                    {/* --- Favorite Films Section Skeleton --- */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="h-6 w-36 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="mt-1 h-4 w-72 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="mt-4 h-9 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="h-[108px] rounded-lg border-2 border-gray-200 dark:border-zinc-800" />
                            <div className="h-[108px] rounded-lg border-2 border-gray-200 dark:border-zinc-800" />
                            <div className="h-[108px] rounded-lg border-2 border-gray-200 dark:border-zinc-800" />
                        </div>
                    </div>

                    {/* --- Action Buttons Skeleton --- */}
                    <div className="flex justify-end gap-4">
                        <div className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-zinc-800" />
                    </div>
                </div>
            </div>
        </main>
    );
}