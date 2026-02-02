import { createClient } from '@/utils/supabase/server';
import TimelineDisplay from "@/app/ui/timeline/TimelineDisplay";

export default async function ProfileTimelinePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const supabase = await createClient();

    // ⚡️ OPTIMIZED
    const { data: { user } } = await supabase.auth.getUser();
    const isOwnProfile = user?.user_metadata?.username === username;

    return (
        <TimelineDisplay
            username={username}
            isOwnProfile={isOwnProfile}
        />
    );
}