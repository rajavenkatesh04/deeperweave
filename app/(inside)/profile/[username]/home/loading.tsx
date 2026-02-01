import { PodiumSkeleton } from "@/app/ui/skeletons";

export default function Loading() {
    // This UI will be shown ONLY in the content area of the "Podium" tab while it loads.
    return (
        <div className="w-full">
            <PodiumSkeleton />
        </div>
    );
}