import { notFound } from 'next/navigation';
import { getProfileByUsername } from '@/lib/data/user-data';
import { createClient } from '@/utils/supabase/server';
import { Metadata } from "next";
import PostsDisplay from "@/app/ui/profileBlogs/PostsDisplay";

type Props = {
    params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    return {
        title: `${username}'s Posts`,
        description: `Read reviews, essays, and thoughts by ${username}.`,
    };
}

export default async function ProfilePostsPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const supabase = await createClient();

    // 1. Check User Existence (Fast)
    const profile = await getProfileByUsername(username);
    if (!profile) notFound();

    // 2. Check Ownership
    const { data: { user: viewer } } = await supabase.auth.getUser();
    const isOwnProfile = viewer?.id === profile.id;

    // 3. RENDER IMMEDIATELY
    return (
        <PostsDisplay
            username={username}
            isOwnProfile={isOwnProfile}
        />
    );
}