import { createClient } from '@/utils/supabase/server';
import ListsDisplay from "@/app/ui/profileLists/ListsDisplay";

export default async function ProfileListsPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const supabase = await createClient();

    // ⚡️ OPTIMIZED
    const { data: { user } } = await supabase.auth.getUser();
    const isOwnProfile = user?.user_metadata?.username === username;

    return (
        <ListsDisplay
            username={username}
            isOwnProfile={isOwnProfile}
        />
    );
}