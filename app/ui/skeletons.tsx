const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

// =================================================================================
// --- PROFILE HEADER SKELETON ---
// =================================================================================

export function ProfileHeaderSkeleton() {
    return (
        <div className="w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
            <div className={`max-w-4xl mx-auto px-4 pt-4 pb-8 md:py-10 ${shimmer} relative overflow-hidden`}>
                <div className="flex flex-col md:flex-row md:gap-10">

                    {/* Top Section: Avatar & Mobile Stats */}
                    <div className="grid grid-cols-[auto_1fr] md:flex md:items-start gap-6 md:gap-10 items-center">
                        {/* Avatar */}
                        <div className="relative w-20 h-20 md:w-40 md:h-40 shrink-0">
                            <div className="w-full h-full rounded-full bg-gray-200 dark:bg-zinc-900 ring-2 ring-white dark:ring-black" />
                        </div>

                        {/* Mobile Stats Placeholder */}
                        <div className="flex md:hidden justify-around w-full pr-2">
                            <div className="h-8 w-12 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                            <div className="h-8 w-12 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                            <div className="h-8 w-12 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 mt-4 md:mt-0 flex flex-col gap-3">

                        {/* Name & Actions */}
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <div className="h-8 w-48 md:w-64 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                            {/* Desktop Action Button */}
                            <div className="hidden md:block h-9 w-28 bg-gray-200 dark:bg-zinc-900 rounded-lg ml-auto" />
                        </div>

                        {/* Handle */}
                        <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-900 rounded-sm" />

                        {/* Desktop Stats */}
                        <div className="hidden md:flex gap-8 py-3">
                            <div className="h-5 w-20 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                            <div className="h-5 w-20 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                            <div className="h-5 w-20 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                        </div>

                        {/* Bio */}
                        <div className="space-y-2 max-w-lg pt-1">
                            <div className="h-4 w-full bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                            <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                        </div>

                        {/* Meta (Location/Date) */}
                        <div className="flex gap-4 mt-1">
                            <div className="h-3 w-24 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                            <div className="h-3 w-24 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                        </div>

                        {/* Mobile Action Button */}
                        <div className="md:hidden mt-2 h-9 w-full bg-gray-200 dark:bg-zinc-900 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// =================================================================================
// --- TAB NAVIGATION SKELETON ---
// =================================================================================

export function TabNavigationSkeleton() {
    return (
        <div className={`sticky top-0 z-40 w-full bg-white/75 dark:bg-zinc-950/75 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 ${shimmer}`}>
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center h-14 w-full justify-between md:justify-center md:gap-12 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-zinc-900" />
                            <div className="hidden md:block h-3 w-16 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// =================================================================================
// --- PODIUM (PROFILE SECTIONS) SKELETON ---
// =================================================================================

function ProfileItemCardSkeleton() {
    return (
        <div className="w-full">
            {/* Aspect 2:3 Poster */}
            <div className="relative aspect-[2/3] w-full rounded-sm overflow-hidden bg-gray-200 dark:bg-zinc-900 shadow-sm mb-3">
                {/* Rank Badge Placeholder */}
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/50 dark:bg-black/50" />
            </div>

            {/* Info */}
            <div className="space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
            </div>
        </div>
    );
}

export function PodiumSkeleton() {
    return (
        <div className={`flex flex-col gap-24 ${shimmer}`}>
            {/* Simulate 2 Sections */}
            {[...Array(2)].map((_, idx) => (
                <section key={idx} className="max-w-5xl mx-auto md:px-8 w-full px-4">

                    {/* Header: Title + Line + Number */}
                    <div className="mb-10 md:mb-12">
                        <div className="flex items-baseline gap-4 md:gap-8">
                            <div className="flex flex-col w-full">
                                <div className="flex items-center gap-6 w-full">
                                    <div className="h-10 md:h-14 w-48 md:w-80 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                                    <div className="flex-grow border-t-2 border-dotted border-gray-200 dark:border-zinc-800" />
                                </div>
                            </div>
                            <div className="h-12 md:h-16 w-16 md:w-20 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-3 gap-4 md:gap-8 lg:gap-10 justify-items-center">
                        <ProfileItemCardSkeleton />
                        <ProfileItemCardSkeleton />
                        <ProfileItemCardSkeleton />
                    </div>
                </section>
            ))}
        </div>
    );
}

// =================================================================================
// --- BLOG CARD SKELETON ---
// =================================================================================

export function PostCardSkeleton() {
    return (
        <div className={`flex flex-col h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 overflow-hidden ${shimmer}`}>
            {/* 16:9 Banner */}
            <div className="relative w-full aspect-[16/9] bg-gray-200 dark:bg-zinc-900" />

            {/* Content */}
            <div className="flex flex-1 flex-col p-5">
                {/* Meta */}
                <div className="flex items-center justify-between mb-3">
                    <div className="h-3 w-20 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-zinc-900" />
                        <div className="h-3 w-24 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                    </div>
                </div>

                {/* Title */}
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-zinc-900 rounded-sm mb-2" />

                {/* Excerpt */}
                <div className="space-y-2 mb-6">
                    <div className="h-3 w-full bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                    <div className="h-3 w-full bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                    <div className="h-3 w-2/3 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                </div>

                {/* Metrics Footer (Heart, Comment, Eye) */}
                <div className="pt-4 mt-auto border-t border-zinc-100 dark:border-zinc-900 flex items-center gap-4">
                    <div className="h-4 w-8 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                    <div className="h-4 w-8 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                    <div className="ml-auto h-4 w-8 bg-gray-200 dark:bg-zinc-900 rounded-sm" />
                </div>
            </div>
        </div>
    );
}

// =================================================================================
// --- TIMELINE SKELETON (Date Anchor Layout) ---
// =================================================================================

function TimelineEntryCardSkeleton() {
    return (
        <div className="relative mb-6">
            {/* Connector Line */}
            <div className="absolute left-[2.5rem] top-0 bottom-0 -z-10 w-px border-l border-dashed border-zinc-300 dark:border-zinc-700 md:left-[3.5rem]" />

            <div className="flex items-start gap-4 md:gap-6">
                {/* 1. Date Anchor */}
                <div className="flex w-10 shrink-0 flex-col items-center gap-1 border border-zinc-900 bg-zinc-900 py-2 dark:border-zinc-100 dark:bg-zinc-100 md:w-14">
                    <div className="h-2 w-6 bg-zinc-700 dark:bg-zinc-300" />
                    <div className="h-6 w-6 bg-zinc-700 dark:bg-zinc-300" />
                    <div className="h-2 w-8 bg-zinc-700 dark:bg-zinc-300" />
                </div>

                {/* 2. Main Card */}
                <div className="relative flex-1 border border-zinc-300 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-black md:p-4">
                    <div className="flex gap-3 md:gap-5">
                        {/* Poster */}
                        <div className="aspect-[2/3] w-[75px] shrink-0 bg-gray-200 dark:bg-zinc-900 md:w-[90px]" />

                        {/* Info */}
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-gray-200 dark:bg-zinc-800" />
                                <div className="h-6 w-3/4 bg-gray-200 dark:bg-zinc-800" />
                            </div>
                            {/* Rating Row */}
                            <div className="mt-1 flex items-center gap-2 border border-zinc-200 bg-zinc-100 p-2 dark:border-zinc-800 dark:bg-zinc-900">
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
        <section className={`${shimmer} relative max-w-4xl mx-auto overflow-hidden`}>
            {/* Header */}
            <div className="mb-8 md:mb-10 px-6 pt-6">
                <div className="h-10 w-48 rounded-md bg-gray-200 dark:bg-zinc-800 mb-2" />
                <div className="h-4 w-32 rounded-md bg-gray-200 dark:bg-zinc-800" />
            </div>

            {/* Entries */}
            <div className="px-6">
                <TimelineEntryCardSkeleton />
                <TimelineEntryCardSkeleton />
                <TimelineEntryCardSkeleton />
            </div>
        </section>
    );
}