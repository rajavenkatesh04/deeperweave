// @/app/(inside)/profile/[username]/timeline/create/page.tsx
import { Suspense } from 'react';
import TimeLineEntryForm from '@/app/ui/timeline/TimeLineEntryForm';
import LoadingSpinner from "@/app/ui/loading-spinner";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'New Entry',
    description: 'Log a new movie or TV show to your cinematic timeline.',
};

export default async function CreateTimelineEntryPage({
                                                          params,
                                                          searchParams // 1. Add searchParams prop
                                                      }: {
    params: Promise<{ username: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { username } = await params;

    // 2. Await and extract the query parameters
    const { item, type } = await searchParams;

    // Ensure they are strings (handle array case if needed, though simple params are usually strings)
    const initialId = typeof item === 'string' ? item : undefined;
    const initialType = typeof type === 'string' ? type : undefined;

    return (
        <main>
            <div className="mt-6">
                <Suspense fallback={<LoadingSpinner />}>
                    {/* 3. Pass them to the form */}
                    <TimeLineEntryForm
                        username={username}
                        initialId={initialId}
                        initialType={initialType}
                    />
                </Suspense>
            </div>
        </main>
    );
}