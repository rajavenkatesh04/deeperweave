import { createClient } from '@/utils/supabase/server';
import PostsDisplay from "@/app/ui/profileBlogs/PostsDisplay";

export default async function ProfilePostsPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const supabase = await createClient();

    // ⚡️ OPTIMIZED
    const { data: { user } } = await supabase.auth.getUser();
    const isOwnProfile = user?.user_metadata?.username === username;

    return (
        <PostsDisplay
            username={username}
            isOwnProfile={isOwnProfile}
        />
    );
}