// @/app/(inside)/profile/[username]/timeline/create/page.tsx

import { Suspense } from 'react';
import LogMovieForm from '@/app/ui/profile/LogMovieForm';

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
                <Suspense fallback={<div>Loading ...</div>}>
                    <LogMovieForm />
                </Suspense>
            </div>
        </main>
    );
}