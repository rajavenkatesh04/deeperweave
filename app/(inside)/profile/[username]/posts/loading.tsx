import { PostCardSkeleton } from "@/app/ui/skeletons";

export default function Loading() {
    return (
        // Matches the container in ProfilePostsPage: max-w-7xl, pt-8, px-4 md:px-6
        <div className="w-full max-w-4xl mx-auto pt-8 px-4 md:px-3 pb-20">

            {/* --- Header Skeleton --- */}
            <div className="flex items-center justify-between mb-6">
                {/* Title Skeleton: "Posts (X)" */}
                <div className="h-7 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />

                {/* Button Skeleton: "New Post" */}
                <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            </div>

            {/* --- Grid Skeleton --- */}
            {/* Matches: grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <PostCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}