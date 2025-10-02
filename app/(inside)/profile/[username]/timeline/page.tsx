// @/app/profile/[username]/timeline/page.tsx

import { notFound } from 'next/navigation';
import { getProfileByUsername } from '@/lib/data/user-data';
import { getTimelineEntriesByUserId } from '@/lib/data/timeline-data';
import TimelineDisplay from '@/app/ui/profile/TimelineDisplay';

export default async function ProfileTimelinePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    // --- Data Fetching ---
    const profile = await getProfileByUsername(username);
    if (!profile) {
        notFound();
    }

    const timelineEntries = await getTimelineEntriesByUserId(profile.id);

    return (
        <div className="space-y-8">
            <TimelineDisplay timelineEntries={timelineEntries}/>
        </div>
    );
}