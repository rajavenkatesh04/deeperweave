// FILE: app/profile/followers/page.tsx

import { getFollowers } from '@/lib/data/user-data';
import UserCard from '@/app/ui/users/UserCard';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default async function FollowersPage() {
    // 1. Get the currently logged-in user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 2. If no user, redirect to login page
    if (!user) {
        redirect('/auth/login');
    }

    // 3. Fetch followers using the logged-in user's ID
    const followers = await getFollowers(user.id);

    return (
        <div className="mx-auto min-h-screen max-w-4xl p-6">
            <Link
                href={`/profile`} // Note: You might need to fetch the username or have it available
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Profile
            </Link>
            <h1 className="mb-6 text-3xl font-bold">Your Followers</h1>
            {followers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {followers.map((follower) => (
                        <UserCard key={follower.id} profile={follower} />
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-zinc-700">
                    <p className="text-gray-500 dark:text-zinc-400">You don&apos;t have any followers yet.</p>
                </div>
            )}
        </div>
    );
}