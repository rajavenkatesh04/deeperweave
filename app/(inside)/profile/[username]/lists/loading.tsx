import { ProfileListsSkeletonGrid } from '@/app/ui/skeletons';

export default function Loading() {
    return (
        <div className="w-full max-w-4xl mx-auto pt-8 px-4 md:px-3 pb-20">
            {/* --- Header Skeleton --- */}
            <div className="flex items-center justify-between mb-6">
                {/* Title Skeleton (e.g. "Lists (4)") */}
                <div className="h-7 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />

                {/* Button Skeleton (e.g. "New List") */}
                <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            </div>

            {/* --- Grid Skeleton --- */}
            <ProfileListsSkeletonGrid />
        </div>
    );
}