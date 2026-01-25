const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export default function Loading() {
    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20 relative">

            {/* --- Sticky Header Skeleton --- */}
            <div className="fixed top-0 inset-x-0 z-50 h-16 bg-white/80 dark:bg-black/80 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-md flex items-center justify-between px-4 max-w-5xl mx-auto">
                <div className={`h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800 ${shimmer} relative overflow-hidden`} />
                <div className={`h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800 hidden md:block ${shimmer} relative overflow-hidden`} />
            </div>

            <div className="pt-16">
                {/* --- Hero Banner Skeleton --- */}
                <div className={`relative h-64 w-full bg-zinc-200 dark:bg-zinc-900 ${shimmer} overflow-hidden`}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div className="h-10 w-48 bg-zinc-300 dark:bg-zinc-800 rounded-md opacity-50" />
                        <div className="h-3 w-32 bg-zinc-300 dark:bg-zinc-800 rounded-md opacity-50" />
                    </div>
                </div>

                {/* --- Main Content Container --- */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-12 relative z-20 space-y-12">

                    {/* 1. Avatar Skeleton (Overlapping) */}
                    <div className="flex justify-center">
                        <div className={`w-32 h-32 rounded-full border-4 border-white dark:border-zinc-900 bg-zinc-300 dark:bg-zinc-800 shadow-xl ${shimmer} relative overflow-hidden`} />
                    </div>

                    {/* 2. Text Fields Skeleton */}
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Display Name */}
                            <div className="space-y-2">
                                <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                <div className={`h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded ${shimmer} relative overflow-hidden`} />
                            </div>
                            {/* Username */}
                            <div className="space-y-2">
                                <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                <div className={`h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded ${shimmer} relative overflow-hidden`} />
                            </div>
                        </div>
                        {/* Bio */}
                        <div className="space-y-2">
                            <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            <div className={`h-24 w-full bg-zinc-200 dark:bg-zinc-800 rounded ${shimmer} relative overflow-hidden`} />
                        </div>
                    </div>

                    {/* 3. Section Editor Skeleton */}
                    <div className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">

                        {/* Section Header Controls */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="h-8 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            <div className="flex gap-2">
                                <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                            </div>
                        </div>

                        {/* Fake "Top 3 Favorites" Card */}
                        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 relative">
                            {/* Card Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3 w-full">
                                    <div className="h-9 w-9 rounded bg-zinc-200 dark:bg-zinc-800" />
                                    <div className={`h-8 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded ${shimmer} relative overflow-hidden`} />
                                </div>
                            </div>

                            {/* Card Grid (3 Posters) */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className={`aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 rounded-lg ${shimmer} relative overflow-hidden`} />
                                <div className={`aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 rounded-lg ${shimmer} relative overflow-hidden`} />
                                <div className={`aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 rounded-lg ${shimmer} relative overflow-hidden`} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- Sticky Footer Skeleton --- */}
            <div className="fixed bottom-4 left-0 right-0 px-4 max-w-4xl mx-auto z-40">
                <div className="bg-zinc-900 dark:bg-zinc-100 p-4 rounded-xl flex justify-between items-center shadow-2xl">
                    <div className="h-4 w-24 bg-white/20 dark:bg-black/20 rounded" />
                    <div className="flex gap-4">
                        <div className="h-9 w-24 bg-white/20 dark:bg-black/20 rounded-lg" />
                        <div className="h-9 w-32 bg-white/20 dark:bg-black/20 rounded-lg" />
                    </div>
                </div>
            </div>
        </main>
    );
}