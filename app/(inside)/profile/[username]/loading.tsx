import { ProfileHeaderSkeleton, TabNavigationSkeleton, PodiumSkeleton } from '@/app/ui/skeletons';

export default function Loading() {
    return (
        <div className="w-full bg-white dark:bg-black min-h-screen">
            {/* 1. Profile Header */}
            <ProfileHeaderSkeleton />

            {/* 2. Tab Navigation */}
            <TabNavigationSkeleton />

            {/* 3. Main Content (Podium Area) */}
            <div className="bg-zinc-50 dark:bg-zinc-950 pt-8 pb-32">
                <PodiumSkeleton />
            </div>
        </div>
    );
}