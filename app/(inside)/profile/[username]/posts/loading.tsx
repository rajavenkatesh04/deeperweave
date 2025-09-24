import { PostCardSkeleton } from "@/app/ui/skeletons";

export default function Loading() {

    const shimmer =
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';


    return (
        <main className={`${shimmer} relative overflow-hidden p-6`}>

            {/* Post Card Grid Placeholder */}
            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Render multiple card skeletons to represent a list loading */}
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
            </div>
        </main>
    );
}