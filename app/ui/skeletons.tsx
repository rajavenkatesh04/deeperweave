const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

// =================================================================================
// --- PROFILE SKELETONS (Updated to Bento Grid) ---
// =================================================================================

export function ProfileHeaderSkeleton() {
    return (
        <div className="w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
            <div className={`max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8 ${shimmer} relative overflow-hidden`}>
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Avatar Skeleton */}
                    <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 bg-gray-200 dark:bg-zinc-900" />

                    {/* Info Skeleton */}
                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2 w-full">
                                <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-900" />
                                <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-900" />
                            </div>
                            {/* Button Skeleton */}
                            <div className="h-9 w-24 bg-gray-200 dark:bg-zinc-900 shrink-0" />
                        </div>

                        {/* Stats Line Skeleton */}
                        <div className="pt-4 border-t border-dashed border-gray-100 dark:border-zinc-800 flex gap-8">
                            <div className="h-4 w-20 bg-gray-200 dark:bg-zinc-900" />
                            <div className="h-4 w-20 bg-gray-200 dark:bg-zinc-900" />
                            <div className="h-4 w-20 bg-gray-200 dark:bg-zinc-900" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TabNavigationSkeleton() {
    return (
        <div className={`${shimmer} relative mt-6 overflow-hidden border-b border-gray-200 dark:border-zinc-800`}>
            <div className="flex space-x-8 px-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="py-4">
                        <div className="h-5 w-20 rounded-md bg-gray-200 dark:bg-zinc-900" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// =================================================================================
// --- FAVORITE FILMS SKELETON (Updated for Podium Layout) ---
// =================================================================================

function FilmCardSkeleton() {
    return (
        <div className="flex h-full flex-col border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            {/* Header Strip */}
            <div className="flex h-12 items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="h-4 w-8 bg-gray-200 dark:bg-zinc-800" />
                <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-zinc-800" />
            </div>

            {/* Poster Area */}
            <div className="flex flex-1 items-center justify-center bg-zinc-100/50 p-6 dark:bg-zinc-900/20">
                <div className="aspect-[2/3] w-full max-w-[150px] bg-gray-200 shadow-sm dark:bg-zinc-800" />
            </div>

            {/* Footer Info */}
            <div className="border-t border-zinc-100 p-5 dark:border-zinc-800">
                <div className="mb-2 h-3 w-24 bg-gray-200 dark:bg-zinc-800" />
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-zinc-800" />
            </div>
        </div>
    );
}

export function FavoriteFilmsSkeleton() {
    return (
        <section className={`${shimmer} relative w-full overflow-hidden py-12`}>
            {/* Title */}
            <div className="mb-12 px-2">
                <div className="h-10 w-64 rounded-md bg-gray-200 dark:bg-zinc-800" />
                <div className="mt-2 h-4 w-48 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                <FilmCardSkeleton />
                <FilmCardSkeleton />
                <FilmCardSkeleton />
            </div>
        </section>
    );
}

// =================================================================================
// --- BLOG CARD SKELETON (Updated for Image + Data Layout) ---
// =================================================================================

export function PostCardSkeleton() {
    return (
        <div className={`${shimmer} relative flex h-full flex-col overflow-hidden border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black`}>
            {/* Visual Record (Image) */}
            <div className="relative aspect-[16/9] w-full border-b border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />

            {/* Data Entry (Content) */}
            <div className="flex flex-1 flex-col p-5 md:p-6">
                {/* Date Line */}
                <div className="mb-4 h-3 w-24 rounded-sm bg-gray-200 dark:bg-zinc-800" />

                {/* Title */}
                <div className="mb-3 h-7 w-3/4 rounded-sm bg-gray-200 dark:bg-zinc-800" />

                {/* Excerpt */}
                <div className="mb-6 space-y-2">
                    <div className="h-3 w-full rounded-sm bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-3 w-full rounded-sm bg-gray-200 dark:bg-zinc-800" />
                    <div className="h-3 w-2/3 rounded-sm bg-gray-200 dark:bg-zinc-800" />
                </div>

                {/* Footer (Author) */}
                <div className="mt-auto flex items-center gap-3">
                    <div className="h-8 w-8 rounded-sm bg-gray-200 dark:bg-zinc-800" />
                    <div className="space-y-1">
                        <div className="h-3 w-20 bg-gray-200 dark:bg-zinc-800" />
                        <div className="h-2 w-16 bg-gray-200 dark:bg-zinc-800" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// =================================================================================
// --- TIMELINE SKELETON (Updated for Date Anchor Layout) ---
// =================================================================================

function TimelineEntryCardSkeleton() {
    return (
        <div className="relative mb-6">
            {/* Connector Line */}
            <div className="absolute left-[2.5rem] top-0 bottom-0 -z-10 w-px border-l border-dashed border-zinc-300 dark:border-zinc-700 md:left-[3.5rem]" />

            <div className="flex items-start gap-4 md:gap-6">

                {/* 1. Date Anchor (Vertical Block) */}
                <div className="flex w-10 shrink-0 flex-col items-center gap-1 border border-zinc-900 bg-zinc-900 py-2 dark:border-zinc-100 dark:bg-zinc-100 md:w-14">
                    <div className="h-2 w-6 bg-zinc-700 dark:bg-zinc-300" />
                    <div className="h-6 w-6 bg-zinc-700 dark:bg-zinc-300" />
                    <div className="h-2 w-8 bg-zinc-700 dark:bg-zinc-300" />
                </div>

                {/* 2. Main Data Slate (Card) */}
                <div className="relative flex-1 border border-zinc-300 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-black md:p-4">
                    <div className="flex gap-3 md:gap-5">
                        {/* Poster */}
                        <div className="aspect-[2/3] w-[75px] shrink-0 bg-gray-200 dark:bg-zinc-900 md:w-[90px]" />

                        {/* Info Console */}
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-gray-200 dark:bg-zinc-800" />
                                <div className="h-6 w-3/4 bg-gray-200 dark:bg-zinc-800" />
                            </div>

                            {/* Rating Row */}
                            <div className="mt-1 flex items-center gap-2 border border-zinc-200 bg-zinc-100 p-2 dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="h-3 w-24 bg-gray-300 dark:bg-zinc-800" />
                                <div className="h-3 w-24 bg-gray-300 dark:bg-zinc-800" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TimelineDisplaySkeleton() {
    return (
        <section className={`${shimmer} relative max-w-4xl overflow-hidden`}>
            {/* Header */}
            <div className="mb-6 space-y-2 md:mb-8">
                <div className="h-8 w-48 rounded-md bg-gray-200 dark:bg-zinc-800 md:h-9" />
                <div className="h-4 w-32 rounded-md bg-gray-200 dark:bg-zinc-800 md:h-5" />
            </div>

            {/* Entries */}
            <TimelineEntryCardSkeleton />
            <TimelineEntryCardSkeleton />
            <TimelineEntryCardSkeleton />
        </section>
    );
}