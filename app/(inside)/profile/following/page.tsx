// FILE: app/profile/following/page.tsx

import { getFollowing } from '@/lib/data/user-data';
import UserCard from '@/app/ui/users/UserCard';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default async function FollowingPage() {
    // 1. Get the currently logged-in user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 2. If no user, redirect to login page
    if (!user) {
        redirect('/auth/login');
    }

    // 3. Fetch followed users using the logged-in user's ID
    const followingList = await getFollowing(user.id);

    return (
        <div className="mx-auto min-h-screen max-w-4xl p-6">
            <Link
                href={`/profile`} // Note: You might need to fetch the username or have it available
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Profile
            </Link>
            <h1 className="mb-6 text-3xl font-bold">Following</h1>
            {followingList.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {followingList.map((followedUser) => (
                        <UserCard key={followedUser.id} profile={followedUser} />
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-zinc-700">
                    <p className="text-gray-500 dark:text-zinc-400">You aren&apos;t following anyone yet.</p>
                </div>
            )}
        </div>
    );
}