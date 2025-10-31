// @/app/(inside)/profile/[username]/timeline/create/page.tsx

import { Suspense } from 'react';
// Using your import path
import TimeLineEntryForm from '@/app/ui/profile/TimeLineEntryForm';
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
                    {/* ✨ THE FIX IS HERE:
                      We pass the 'username' variable (which you got from params)
                      down to the TimeLineEntryForm component as a prop.
                    */}
                    <TimeLineEntryForm username={username} />
                </Suspense>
            </div>
        </main>
    );
}
