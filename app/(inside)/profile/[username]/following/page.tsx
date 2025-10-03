// @/app/profile/[username]/following/page.tsx

import { getFollowing, getProfileByUsername } from '@/lib/data/user-data';
import UserCard from '@/app/ui/users/UserCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

// ✨ FIX: Update the type for `params` to be a Promise
export default async function FollowingPage({ params }: { params: Promise<{ username:string }> }) {
    // ✨ FIX: Await the params promise to get the username
    const { username } = await params;

    // The rest of your logic is already correct
    const profile = await getProfileByUsername(username);

    if (!profile) {
        notFound();
    }

    const followingList = await getFollowing(profile.id);

    return (
        <div id="following-section" className="mx-auto min-h-screen ">
            <Link
                href={`/profile/${username}`}
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to @{username}&apos;s Profile
            </Link>
            <h1 className="mb-6 text-3xl font-bold">
                Following
            </h1>

            {followingList.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {followingList.map((followedUser) => (
                        <UserCard key={followedUser.id} profile={followedUser} />
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-zinc-700">
                    <p className="text-gray-500 dark:text-zinc-400">
                        @{username} isn&apos;t following anyone yet.
                    </p>
                </div>
            )}
        </div>
    );
}