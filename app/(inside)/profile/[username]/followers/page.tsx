import { getFollowers, getProfileByUsername } from '@/lib/data/user-data';
import UserCard from '@/app/ui/user/UserCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MdArrowBack, MdOutlinePeople } from 'react-icons/md';

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    const profile = await getProfileByUsername(username);

    if (!profile) {
        notFound();
    }

    const followers = await getFollowers(profile.id);

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">

            {/* --- Sticky Header (Instagram Style) --- */}
            <div className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
                <Link
                    href={`/profile/${username}`}
                    className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                    <MdArrowBack className="w-6 h-6" />
                </Link>

                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold leading-none">Followers</span>
                    <span className="text-[10px] text-zinc-500 font-medium">@{username}</span>
                </div>

                {/* Empty div to balance the flex centering */}
                <div className="w-8" />
            </div>

            {/* --- Content List --- */}
            <main className="max-w-md mx-auto">
                {followers.length > 0 ? (
                    <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
                        {followers.map((follower) => (
                            <div key={follower.id} className="w-full">
                                {/* Ensure UserCard takes full width and looks flat */}
                                <UserCard profile={follower} />
                            </div>
                        ))}
                    </div>
                ) : (
                    // --- Empty State ---
                    <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-4">
                            <MdOutlinePeople className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">No Followers Yet</h3>
                        <p className="text-sm text-zinc-500 max-w-[200px]">
                            It looks like {username} doesn't have any followers yet.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}