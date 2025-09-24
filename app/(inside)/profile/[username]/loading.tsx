import {ProfileHeaderSkeleton, TabNavigationSkeleton} from "@/app/ui/skeletons";


export default function Loading() {
    return (
        <main className="p-6">
            <ProfileHeaderSkeleton />
            <div>
                <TabNavigationSkeleton />
            </div>
        </main>
    );
}
