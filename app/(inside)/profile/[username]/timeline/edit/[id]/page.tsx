// app/(inside)/profile/[username]/timeline/edit/[id]/page.tsx

import { getTimelineEntryById } from '@/lib/data/timeline-data';
import { getUserProfile } from '@/lib/data/user-data';
import { redirect, notFound } from 'next/navigation';
import TimeLineEditForm from '@/app/ui/timeline/TimeLineEditForm';
import {Metadata} from "next";
export const metadata: Metadata = {
    title: 'New Entry',
    description: 'Log a new movie or TV show to your cinematic timeline.',
};

export default async function EditTimelineEntryPage({
                                                        params
                                                    }: {
    params: Promise<{ id: string; username: string }>
}) {
    // Await the params Promise
    const { id, username } = await params;

    // 1. Fetch the entry data and user data in parallel
    const [entry, userData] = await Promise.all([
        getTimelineEntryById(id),
        getUserProfile()
    ]);

    // 2. Auth & Data Validation
    if (!userData?.profile) {
        redirect('/login');
    }

    if (!entry) {
        notFound();
    }

    if (entry.user_id !== userData.user.id) {
        notFound();
    }

    // 3. Render the form
    return (
        <div className="py-8 px-4">
            <TimeLineEditForm
                username={userData.profile.username}
                entryToEdit={entry}
            />
        </div>
    );
}