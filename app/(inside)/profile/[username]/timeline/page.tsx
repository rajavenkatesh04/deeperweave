// @/app/profile/[username]/timeline/page.tsx

import { notFound } from 'next/navigation';
import { getProfileByUsername } from '@/lib/data/user-data';
import { getTimelineEntriesByUserId } from '@/lib/data/timeline-data';
import TimelineDisplay from '@/app/ui/timeline/TimelineDisplay';
// ✨ FIX: Import the standard server client, not the admin client
import { createClient } from '@/utils/supabase/server';
import {Metadata} from "next";

type Props = {
    params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    return {
        title: `${username}'s Timeline`,
        description: `View the cinematic journey and movie history of ${username} on DeeperWeave.`,
        openGraph: {
            title: `${username}'s Cinematic Timeline`,
            description: `Check out what ${username} has been watching and reviewing lately.`,
        },
    };
}

export default async function ProfileTimelinePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    // ✨ FIX: Use the standard server client to get the authenticated user's session
    const supabase = await createClient();

    // --- Data Fetching ---
    // Now, `viewer` will correctly contain the logged-in user's data
    const { data: { user: viewer } } = await supabase.auth.getUser();
    const profile = await getProfileByUsername(username);

    if (!profile) {
        notFound();
    }

    // This comparison will now work as expected
    const isOwnProfile = viewer?.id === profile.id;

    const timelineEntries = await getTimelineEntriesByUserId(profile.id);

    return (
        <div className="space-y-8">
            <TimelineDisplay
                timelineEntries={timelineEntries}
                isOwnProfile={isOwnProfile}
                username={username}
            />
        </div>
    );
}