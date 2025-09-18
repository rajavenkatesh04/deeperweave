// app/(inside)/profile/[username]/page.tsx

import { notFound } from 'next/navigation';
// REMOVE: getProfileByUsername, checkFollowStatus, getUserProfile
import { getProfileAndFollowStatus } from '@/lib/data'; // USE the new function
import { createClient } from '@/utils/supabase/server'; // Needed for viewer ID
import Image from 'next/image';
import FollowButton from '@/app/ui/users/FollowButton';
import { LockClosedIcon } from '@heroicons/react/24/solid';

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const supabase = await createClient();
    const { data: { user: viewer } } = await supabase.auth.getUser();

    // Await params before using its properties
    const { username } = await params;

    // 1. Fetch profile and follow status in one go
    const { profile, followStatus } = await getProfileAndFollowStatus(username);

    if (!profile) {
        notFound();
    }

    // 2. Determine state (logic is now simpler)
    const isOwnProfile = viewer?.id === profile.id;
    const isPrivate = profile.visibility === 'private';
    const isFollowing = followStatus === 'accepted';
    const canViewContent = !isPrivate || isFollowing || isOwnProfile;

    return (
        <main>
            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <Image
                        className="h-28 w-28 rounded-full object-cover ring-4 ring-white dark:ring-zinc-900 shadow-md"
                        src={profile.profile_pic_url || '/placeholder-user.jpg'}
                        alt={`${profile.display_name}'s profile picture`}
                        width={112}
                        height={112}
                    />
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">{profile.display_name}</h1>
                        <p className="text-md text-gray-500 dark:text-zinc-400">@{profile.username}</p>
                        {profile.bio && <p className="mt-2 text-base text-gray-700 dark:text-zinc-300 max-w-lg">{profile.bio}</p>}
                    </div>
                    {/* 3. Pass the new status string to the button */}
                    {!isOwnProfile && viewer && (
                        <FollowButton profileId={profile.id} isPrivate={isPrivate} initialFollowStatus={followStatus} />
                    )}
                </div>
            </div>

            {/* Content Area (no changes here) */}
            {canViewContent ? (
                <div>
                    <div className="text-center py-20 rounded-lg border-2 border-dashed">
                        <h3 className="font-semibold">Posts will be displayed here</h3>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 py-20">
                    <LockClosedIcon className="h-12 w-12 text-gray-400 dark:text-zinc-500" />
                    <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-zinc-100">This Account is Private</h2>
                    <p className="mt-1 text-base text-gray-600 dark:text-zinc-400">Follow this account to see their posts and activity.</p>
                </div>
            )}
        </main>
    );
}