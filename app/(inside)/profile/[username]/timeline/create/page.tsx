// @/app/(inside)/profile/[username]/timeline/create/page.tsx

import { Suspense } from 'react';
import LogMovieForm from '@/app/ui/profile/LogMovieForm';
import LoadingSpinner from "@/app/ui/loading-spinner";

export default async function CreateTimelineEntryPage({
                                                          params
                                                      }: {
    params: Promise<{ username: string }>
}) {
    // Await the params Promise
    const { username } = await params;

    return (
        <main>
            <div className="mt-6">
                <Suspense fallback={<LoadingSpinner />}>
                    <LogMovieForm />
                </Suspense>
            </div>
        </main>
    );
}