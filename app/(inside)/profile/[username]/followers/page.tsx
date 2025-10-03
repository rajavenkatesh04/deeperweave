// @/app/profile/[username]/followers/page.tsx

import { getFollowers, getProfileByUsername } from '@/lib/data/user-data';
import UserCard from '@/app/ui/users/UserCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

// ✨ FIX: Update the type for `params` to be a Promise
export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
    // ✨ FIX: Await the params promise to get the username
    const { username } = await params;

    // The rest of your logic is already correct
    const profile = await getProfileByUsername(username);

    if (!profile) {
        notFound();
    }

    const followers = await getFollowers(profile.id);

    return (
        <div id="followers-section" className="mx-auto min-h-screen">
            <Link
                href={`/profile/${username}`}
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to @{username}&apos;s Profile
            </Link>
            <h1 className="mb-6 text-3xl font-bold">
                Followers
            </h1>

            {followers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {followers.map((follower) => (
                        <UserCard key={follower.id} profile={follower} />
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-zinc-700">
                    <p className="text-gray-500 dark:text-zinc-400">
                        @{username} doesn&apos;t have any followers yet.
                    </p>
                </div>
            )}
        </div>
    );
}