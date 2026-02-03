import LoadingSpinner from "@/app/ui/loading-spinner";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
}