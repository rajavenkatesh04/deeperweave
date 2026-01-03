// app/profile/[username]/followers/page.tsx
import { getFollowers, getProfileByUsername } from '@/lib/data/user-data';
import UserCard from '@/app/ui/users/UserCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, UsersIcon } from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    const profile = await getProfileByUsername(username);

    if (!profile) {
        notFound();
    }

    const followers = await getFollowers(profile.id);

    return (
        <div className="min-h-screen bg-black text-zinc-100 relative font-sans">

            {/* Nav Back */}
            <div className=" top-6 left-6 z-50 mix-blend-difference">
                <Link
                    href={`/profile/${username}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md border border-zinc-800 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
                >
                    <ArrowLeftIcon className="w-3 h-3" />
                    <span>Back</span>
                </Link>
            </div>

            <div className="max-w-5xl mx-auto pt-20 pb-12 px-0 md:px-12">
                {/* Header Section */}
                <div className="mb-8 px-6 md:px-0 border-b border-zinc-900 pb-8">
                    <h1 className={`${PlayWriteNewZealandFont.className} text-3xl md:text-5xl font-bold mb-3`}>
                        The Audience
                    </h1>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                        <span>@{username}</span>
                        <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                        <span>{followers.length} {followers.length === 1 ? 'Follower' : 'Followers'}</span>
                    </div>
                </div>

                {followers.length > 0 ? (
                    /* LAYOUT LOGIC:
                       1. Mobile: Flex column with dividers (divide-y), bordered top/bottom for container.
                       2. Desktop (md:): Grid layout, 2/3 columns, gaps, no dividers (borders handled by card itself).
                    */
                    <div className="flex flex-col divide-y divide-zinc-900 border-t border-b border-zinc-900 md:border-none md:divide-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
                        {followers.map((follower) => (
                            <UserCard key={follower.id} profile={follower} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 mx-6 md:mx-0 bg-zinc-950 border border-zinc-900">
                        <UsersIcon className="w-8 h-8 text-zinc-700 mb-4" />
                        <p className="text-zinc-500 text-sm font-medium">No Signal</p>
                        <p className="text-zinc-700 text-xs uppercase tracking-widest mt-1">
                            @{username} has no followers yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}