import LoadingSpinner from "@/app/ui/loading-spinner";

export default function Loading() {
    return (
        <div className="min-h-screen flex mt-10 justify-center">
            Loading lists...
            <LoadingSpinner />
        </div>
    );
}