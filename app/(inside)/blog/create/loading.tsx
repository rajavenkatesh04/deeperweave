const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

/**
 * A reusable skeleton component for the cards in the top section of the form.
 */
function FormCardSkeleton({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`rounded-lg border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
            {children}
        </div>
    );
}

/**
 * The main skeleton component for the entire "Create Blog Post" page.
 */
export default function Loading() {
    return (
        <main className="max-w-5xl mx-auto px-4">
            <div className={`${shimmer} relative overflow-hidden`}>
                {/* Breadcrumbs Placeholder */}
                <div className="h-5 w-48 rounded-md bg-gray-200 dark:bg-zinc-800" />

                <div className="mt-6 space-y-8">
                    {/* Top Section Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Movie Link Card */}
                        <FormCardSkeleton>
                            <div className="h-6 w-32 rounded-md bg-gray-200 dark:bg-zinc-800 mb-4" />
                            <div className="h-9 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                        </FormCardSkeleton>

                        {/* Banner Image Card */}
                        <FormCardSkeleton>
                            <div className="h-6 w-36 rounded-md bg-gray-200 dark:bg-zinc-800 mb-4" />
                            <div className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg bg-gray-100 dark:bg-zinc-800/50" />
                        </FormCardSkeleton>

                        {/* Rating & Options Card */}
                        <FormCardSkeleton className="md:col-span-2 xl:col-span-1">
                            <div className="h-6 w-20 rounded-md bg-gray-200 dark:bg-zinc-800 mb-3" />
                            <div className="flex gap-1">
                                <div className="h-7 w-7 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                                <div className="h-7 w-7 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                                <div className="h-7 w-7 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                                <div className="h-7 w-7 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                                <div className="h-7 w-7 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                            </div>
                            <div className="border-t border-gray-200 dark:border-zinc-700 my-6" />
                            <div className="h-6 w-24 rounded-md bg-gray-200 dark:bg-zinc-800 mb-4" />
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="h-4 w-28 rounded-md bg-gray-200 dark:bg-zinc-800" />
                                    <div className="h-6 w-10 rounded-full bg-gray-200 dark:bg-zinc-800" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="h-4 w-20 rounded-md bg-gray-200 dark:bg-zinc-800" />
                                    <div className="h-6 w-10 rounded-full bg-gray-200 dark:bg-zinc-800" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="h-4 w-32 rounded-md bg-gray-200 dark:bg-zinc-800" />
                                    <div className="h-6 w-10 rounded-full bg-gray-200 dark:bg-zinc-800" />
                                </div>
                            </div>
                        </FormCardSkeleton>
                    </div>

                    {/* Post Title Input */}
                    <div className="space-y-2">
                        <div className="h-4 w-24 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-12 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                    </div>

                    {/* Content Editor */}
                    <div className="space-y-2">
                        <div className="h-4 w-20 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-72 w-full rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-900" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-zinc-700">
                        <div className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-zinc-800" />
                    </div>
                </div>
            </div>
        </main>
    );
}
