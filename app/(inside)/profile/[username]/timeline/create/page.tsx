// @/app/profile/[username]/timeline/create/page.tsx (Final Code)

import { Suspense } from 'react';
import LogMovieForm from '@/app/ui/profile/LogMovieForm';
import Breadcrumbs from '@/app/ui/Breadcrumbs'; // Assuming you have this component

export default function CreateTimelineEntryPage({ params }: { params: { username: string } }) {
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