import { notFound } from 'next/navigation';
import { getProfileByUsername } from '@/lib/data/user-data';
import { createClient } from '@/utils/supabase/server';
import ListsDisplay from '@/app/ui/profileLists/ListsDisplay'; // Import new component
import { Metadata } from "next";

type Props = {
    params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    return {
        title: `${username}'s Lists`,
        description: `Curated collections and movie lists by ${username}.`,
    };
}

export default async function ProfileListsPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const supabase = await createClient();

    // 1. Check User Existence (Fast)
    const profile = await getProfileByUsername(username);
    if (!profile) notFound();

    // 2. Check Ownership
    const { data: { user: viewer } } = await supabase.auth.getUser();
    const isOwnProfile = viewer?.id === profile.id;

    // 3. RENDER IMMEDIATELY (No blocking data fetch)
    return (
        <ListsDisplay
            username={username}
            isOwnProfile={isOwnProfile}
        />
    );
}