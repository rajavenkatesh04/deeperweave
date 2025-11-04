import { getTrendingAll } from '@/lib/actions/cinematic-actions';
import PosterCard from '@/app/ui/discover/PosterCard';
import LoadingSpinner from '@/app/ui/loading-spinner'; // Assuming this path
import { Suspense } from 'react';

// This is a Server Component, so it can be async
export default async function TrendingPage() {

    // 1. Fetch the data directly on the server
    const items = await getTrendingAll();

    return (
        <main className="min-h-screen bg-white dark:bg-black p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-black dark:text-white">
                    Trending This Week
                </h1>

                <Suspense fallback={<LoadingSpinner />}>
                    {items.length > 0 ? (
                        // 2. Display the items in a responsive grid
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                            {items.map((item) => (
                                // 3. Reuse your existing PosterCard component
                                <PosterCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-zinc-400">
                            Could not load trending items at this time. Please try again later.
                        </p>
                    )}
                </Suspense>
            </div>
        </main>
    );
}