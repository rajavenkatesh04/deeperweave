const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export default function Loading() {
    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <div className="p-3 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">

                {/* --- Breadcrumbs Skeleton --- */}
                <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-sm opacity-50" />

                {/* --- Header / Action Bar Skeleton --- */}
                <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 shadow-sm relative overflow-hidden">
                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                    <div className="flex gap-3">
                        <div className="h-8 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-sm hidden sm:block" />
                        <div className={`h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-sm ${shimmer} relative overflow-hidden`} />
                    </div>
                </div>

                {/* --- Main Profile Info Grid --- */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 sm:p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-8">

                        {/* Avatar Column */}
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <div className={`relative w-32 h-32 md:w-48 md:h-48 rounded-lg bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 ${shimmer} overflow-hidden`} />
                            <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-sm mx-auto md:mx-0" />
                        </div>

                        {/* Inputs Column */}
                        <div className="space-y-5 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Display Name */}
                                <div className="space-y-2">
                                    <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                                    <div className={`h-10 w-full bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-sm ${shimmer} overflow-hidden`} />
                                </div>
                                {/* Username */}
                                <div className="space-y-2">
                                    <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                                    <div className={`h-10 w-full bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-sm ${shimmer} overflow-hidden`} />
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                                <div className={`h-24 w-full bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-sm ${shimmer} overflow-hidden`} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

                {/* --- Sections Area --- */}
                <div className="space-y-4">

                    {/* Section Controls Title */}
                    <div className="flex justify-between items-center px-1">
                        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-9 h-9 rounded-sm bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700" />
                            ))}
                        </div>
                    </div>

                    {/* Section Skeletons */}
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden">
                            {/* Section Header */}
                            <div className="flex items-center gap-3 p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                                <div className="flex-1 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-sm opacity-60" />
                                <div className="flex gap-1">
                                    <div className="w-7 h-7 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                                    <div className="w-7 h-7 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                                </div>
                            </div>

                            {/* Items Grid */}
                            <div className="p-3 grid grid-cols-1 gap-2">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="flex items-center gap-3 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                                        <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-sm" /> {/* Handle */}
                                        <div className={`w-10 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-sm ${shimmer} relative overflow-hidden`} /> {/* Poster */}
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                                            <div className="h-2 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded-sm opacity-60" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}