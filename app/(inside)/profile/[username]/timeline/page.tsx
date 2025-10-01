// @/app/profile/[username]/timeline/page.tsx

import { notFound } from 'next/navigation';
import { getProfileByUsername } from '@/lib/data/user-data';
import { getTimelineEntriesByUserId } from '@/lib/data/timeline-data';
import TimelineDisplay from '@/app/ui/profile/TimelineDisplay';
import {TimelineDisplaySkeleton} from "@/app/ui/skeletons";
import {Suspense} from "react";

export default async function ProfileTimelinePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    // --- Data Fetching ---
    const profile = await getProfileByUsername(username);
    if (!profile) {
        notFound();
    }

    const timelineEntries = await getTimelineEntriesByUserId(profile.id);

    return (
        <Suspense fallback={<TimelineDisplaySkeleton />}>
            <TimelineDisplay timelineEntries={timelineEntries}/>
        </Suspense>
    );
}