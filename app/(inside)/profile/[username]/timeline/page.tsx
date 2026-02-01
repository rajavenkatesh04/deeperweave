import { notFound } from 'next/navigation';
import { getProfileByUsername } from '@/lib/data/user-data';
// REMOVED: import { getTimelineEntriesByUserId } ...
import TimelineDisplay from '@/app/ui/timeline/TimelineDisplay';
import { createClient } from '@/utils/supabase/server';
import { Metadata } from "next";

type Props = {
    params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    return {
        title: `${username}'s Timeline`,
        description: `View the cinematic journey and movie history of ${username} on DeeperWeave.`,
    };
}

export default async function ProfileTimelinePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const supabase = await createClient();

    // 1. Light Check (Fast)
    const { data: { user: viewer } } = await supabase.auth.getUser();
    const profile = await getProfileByUsername(username);

    if (!profile) notFound();

    const isOwnProfile = viewer?.id === profile.id;

    // 2. RENDER IMMEDIATELY
    // We removed the 'await getTimelineEntries' blocking call.
    return (
        <div className="space-y-8">
            <TimelineDisplay
                isOwnProfile={isOwnProfile}
                username={username}
            />
        </div>
    );
}