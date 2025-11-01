// @/app/(inside)/profile/[username]/timeline/create/page.tsx

import { Suspense } from 'react';
// Using your import path
import TimeLineEntryForm from '@/app/ui/timeline/TimeLineEntryForm';
import LoadingSpinner from "@/app/ui/loading-spinner";

export default async function CreateTimelineEntryPage({
                                                          params
                                                      }: {
    // This is your page's structure for getting params
    params: Promise<{ username: string }>
}) {
    // You are correctly awaiting the params Promise here
    const { username } = await params;

    return (
        <main>
            <div className="mt-6">
                <Suspense fallback={<LoadingSpinner />}>
                    <TimeLineEntryForm username={username} />
                </Suspense>
            </div>
        </main>
    );
}
