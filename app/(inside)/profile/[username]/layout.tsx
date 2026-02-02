// app/(inside)/profile/[username]/layout.tsx
import { notFound } from 'next/navigation';
import { getProfileData } from '@/lib/data/user-data';
import { createClient } from '@/utils/supabase/server';
import ProfileHeader from '@/app/ui/user/ProfileHeader';
import TabNavigation from './TabNavigation';
import PrivateProfileScreen from '@/app/ui/user/PrivateProfileScreen';

export default async function ProfileLayout({
                                                children,
                                                params
                                            }: {
    children: React.ReactNode;
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;

    // 1. 🔍 Necessary DB Call: We need the full profile data (Bio, Stats)
    // There is no way around this, and that is okay. It happens ONCE per full page load.
    const { profile, followStatus, followerCount, followingCount, timelineCount } = await getProfileData(username);
    if (!profile) notFound();

    // 2. ⚡️ Fast Auth Check (Cached from request)
    const supabase = await createClient();
    const { data: { user: viewer } } = await supabase.auth.getUser();

    // Logic Checks
    const isOwnProfile = viewer?.id === profile.id; // Safe to compare IDs here since we fetched profile anyway
    const isPrivate = profile.visibility === 'private';
    const isFollowing = followStatus === 'accepted';
    const canViewContent = !isPrivate || isFollowing || isOwnProfile;

    return (
        <main className="w-full">
            <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                isPrivate={isPrivate}
                initialFollowStatus={followStatus as 'not_following' | 'accepted' | 'pending'}
                followerCount={followerCount}
                followingCount={followingCount}
                timelineCount={timelineCount}
            />

            {canViewContent ? (
                <div className="relative">
                    {/* Notice we pass 'isOwnProfile' to TabNavigation.
                        This prevents TabNavigation from fetching anything.
                    */}
                    <TabNavigation username={profile.username} isOwnProfile={isOwnProfile} />
                    <div className="">{children}</div>
                </div>
            ) : (
                <PrivateProfileScreen />
            )}
        </main>
    );
}