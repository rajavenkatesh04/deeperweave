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
    const supabase = await createClient();
    const { data: { user: viewer } } = await supabase.auth.getUser();

    const { username } = await params;

    const { profile, followStatus, followerCount, followingCount, timelineCount } = await getProfileData(username);
    if (!profile) notFound();

    const isOwnProfile = viewer?.id === profile.id;
    const isPrivate = profile.visibility === 'private';
    const isFollowing = followStatus === 'accepted';
    const canViewContent = !isPrivate || isFollowing || isOwnProfile;

    return (
        <main className="sm:p-3">

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
                <div className={`z-40`}>
                    <TabNavigation username={profile.username} isOwnProfile={isOwnProfile} />
                    <div className="">{children}</div>
                </div>
            ) : (
                <PrivateProfileScreen />
            )}
        </main>
    );
}