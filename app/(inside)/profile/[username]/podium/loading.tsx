import {FavoriteFilmsSkeleton} from "@/app/ui/skeletons";


export default function Loading() {
    // This UI will be shown ONLY in the content area of the "Home" tab while it loads.
    return (
        <div className="space-y-8">
            <FavoriteFilmsSkeleton />
        </div>
    );
}