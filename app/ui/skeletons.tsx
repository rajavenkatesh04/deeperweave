const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

// =================================================================================
// --- PROFILE SKELETONS ---
// =================================================================================

export function ProfileHeaderSkeleton() {
    return (
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-gray-50/50 to-white shadow-lg ring-1 ring-black/5 dark:from-zinc-900 dark:via-zinc-800/50 dark:to-zinc-900 dark:ring-white/10">
            <div className={`${shimmer} relative p-6 md:p-8 lg:p-10`}>
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                    {/* Profile Picture & Mobile Username */}
                    <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col lg:items-center">
                        <div className="h-28 w-28 flex-shrink-0 rounded-full bg-gray-200 dark:bg-zinc-800 lg:h-32 lg:w-32"></div>
                        <div className="h-8 w-32 rounded-full bg-gray-200 dark:bg-zinc-800 lg:hidden"></div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 space-y-4">
                        <div className="mx-auto h-8 w-3/5 rounded-md bg-gray-200 dark:bg-zinc-800 sm:mx-0"></div>
                        <div className="hidden pt-2 lg:block">
                            <div className="h-6 w-40 rounded-full bg-gray-200 dark:bg-zinc-800"></div>
                        </div>
                        <div className="space-y-2 pt-2">
                            <div className="mx-auto h-4 w-full rounded-md bg-gray-200 dark:bg-zinc-800 sm:mx-0"></div>
                            <div className="mx-auto h-4 w-4/5 rounded-md bg-gray-200 dark:bg-zinc-800 sm:mx-0"></div>
                        </div>
                        <div className="flex items-center justify-center gap-6 pt-2 sm:justify-start">
                            <div className="h-5 w-24 rounded-md bg-gray-200 dark:bg-zinc-800"></div>
                            <div className="h-5 w-24 rounded-md bg-gray-200 dark:bg-zinc-800"></div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex w-full flex-col sm:w-auto lg:w-auto">
                        <div className="h-11 w-full rounded-xl bg-gray-200 dark:bg-zinc-800 sm:w-36 lg:w-36"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TabNavigationSkeleton() {
    return (
        <div className={`${shimmer} relative overflow-hidden border-b border-gray-200 dark:border-zinc-800 mt-6`}>
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <div className="border-b-2 border-transparent py-4 px-1">
                    <div className="h-5 w-12 rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
                <div className="border-b-2 border-transparent py-4 px-1">
                    <div className="h-5 w-12 rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
                <div className="border-b-2 border-transparent py-4 px-1">
                    <div className="h-5 w-12 rounded-md bg-gray-200 dark:bg-zinc-800" />
                </div>
            </nav>
        </div>
    );
}


// =================================================================================
// --- FAVORITE FILMS SKELETON (NEW) ---
// =================================================================================

function FilmCardSkeleton() {
    return <div className="aspect-[2/3] w-full rounded-lg bg-gray-200 dark:bg-zinc-800" />;
}

export function FavoriteFilmsSkeleton() {
    return (
        <section className={`${shimmer} relative overflow-hidden`}>
            {/* Title Skeleton */}
            <div className="h-6 w-40 rounded-md bg-gray-200 dark:bg-zinc-800"></div>

            {/* Grid Skeleton */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <FilmCardSkeleton />
                <FilmCardSkeleton />
                <FilmCardSkeleton />
            </div>
        </section>
    );
}


/**
 * A detailed skeleton for a single blog post card.
 * It matches the dimensions and layout of the real PostCard component.
 */
export function PostCardSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {/* Banner Image Placeholder */}
            <div className="h-48 w-full bg-gray-200 dark:bg-zinc-800" />

            <div className="flex flex-1 flex-col p-6">
                <div className="flex-1">
                    {/* Title Placeholder */}
                    <div className="h-6 w-3/4 rounded-md bg-gray-200 dark:bg-zinc-800" />

                    {/* Content Placeholder */}
                    <div className="mt-4 space-y-2">
                        <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-4 w-5/6 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    </div>
                </div>

                {/* Author Info Placeholder */}
                <div className="mt-6 flex items-center gap-3 border-t border-gray-200 pt-4 dark:border-zinc-800">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 dark:bg-zinc-800" />
                    <div className="w-full space-y-2">
                        <div className="h-4 w-24 rounded-md bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-3 w-16 rounded-md bg-gray-200 dark:bg-zinc-800" />
                    </div>
                </div>
            </div>
        </div>
    );
}


