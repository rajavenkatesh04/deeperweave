import { notFound } from 'next/navigation';
import { getProfileData } from '@/lib/data/user-data';
import { createClient } from '@/utils/supabase/server';
import ProfileHeader from '@/app/ui/users/ProfileHeader';
import TabNavigation from './TabNavigation';
import PrivateProfileScreen from '@/app/ui/users/PrivateProfileScreen';

export default async function ProfileLayout({
                                                children,
                                                params
                                            }: {
    children: React.ReactNode;
    params: Promise<{ username: string }>; // Updated type to reflect Promise
}) {
    const supabase = await createClient();
    const { data: { user: viewer } } = await supabase.auth.getUser();

    // Await params before accessing its properties
    const { username } = await params;

    // Use the new, powerful data fetching function
    const { profile, followStatus, followerCount, followingCount } = await getProfileData(username);
    if (!profile) notFound();

    const isOwnProfile = viewer?.id === profile.id;
    const isPrivate = profile.visibility === 'private';
    const isFollowing = followStatus === 'accepted';
    const canViewContent = !isPrivate || isFollowing || isOwnProfile;

    return (
        <main>
            <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                isPrivate={isPrivate}
                initialFollowStatus={followStatus}
                followerCount={followerCount}
                followingCount={followingCount}
            />

            {canViewContent ? (
                <div>
                    <TabNavigation username={profile.username} isOwnProfile={isOwnProfile} />
                    <div className="py-8">{children}</div>
                </div>
            ) : (
                <PrivateProfileScreen profileId={profile.id} isPrivate={isPrivate} initialFollowStatus={followStatus} />
            )}
        </main>
    );
}