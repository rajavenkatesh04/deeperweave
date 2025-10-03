import Link from 'next/link';
import Image from 'next/image';
import { UserProfile } from '@/lib/definitions';
import FollowButton from '@/app/ui/users/FollowButton';
import { PencilSquareIcon } from '@heroicons/react/24/solid';

export default function ProfileHeader({
                                          profile,
                                          isOwnProfile,
                                          isPrivate,
                                          initialFollowStatus,
                                          followerCount,
                                          followingCount,
                                      }: {
    profile: UserProfile;
    isOwnProfile: boolean;
    isPrivate: boolean;
    initialFollowStatus: 'not_following' | 'pending' | 'accepted';
    followerCount: number;
    followingCount: number;
}) {
    return (
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-gray-50/50 to-white shadow-lg ring-1 ring-black/5 dark:from-zinc-900 dark:via-zinc-800/50 dark:to-zinc-900 dark:ring-white/10">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]"></div>
            <div className="relative p-6 md:p-8 lg:p-10">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                    <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col lg:items-center">
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-sm"></div>
                            <Image className="relative h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-xl dark:ring-zinc-800 lg:h-32 lg:w-32" src={profile.profile_pic_url || '/placeholder-user.jpg'} alt={`${profile.display_name}'s profile picture`} width={128} height={128} />
                        </div>
                        <div className="lg:hidden"><span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">@{profile.username}</span></div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 md:text-4xl lg:text-5xl">{profile.display_name}</h1>
                        <div className="hidden pt-3 lg:block"><span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700"><span className="h-2 w-2 rounded-full bg-gray-400 dark:bg-zinc-500"></span>@{profile.username}</span></div>
                        {profile.bio && <p className="mt-4 text-lg text-gray-600 dark:text-zinc-400 md:text-xl">{profile.bio}</p>}
                        <div className="mt-4 flex items-center justify-center sm:justify-start gap-6 text-sm">
                            {/* ✨ FIX: Update link to scroll to the followers ID */}
                            <Link href={`/profile/${profile.username}/followers#followers-section`} className="transition-opacity hover:opacity-80">
                                <div>
                                    <span className="font-bold text-gray-800 dark:text-zinc-200">{followerCount}</span>
                                    <span className="text-gray-500 dark:text-zinc-400"> Followers</span>
                                </div>
                            </Link>

                            {/* ✨ FIX: Update link to scroll to the following ID */}
                            <Link href={`/profile/${profile.username}/following#following-section`} className="transition-opacity hover:opacity-80">
                                <div>
                                    <span className="font-bold text-gray-800 dark:text-zinc-200">{followingCount}</span>
                                    <span className="text-gray-500 dark:text-zinc-400"> Following</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:w-auto lg:flex-col">
                        {isOwnProfile ? (
                            <Link href="/profile/edit" className="group relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gray-900 px-6 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:bg-white dark:text-gray-900">
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:from-gray-100 dark:to-white"></div>
                                <PencilSquareIcon className="relative h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                                <span className="relative">Edit Profile</span>
                            </Link>
                        ) : (
                            <FollowButton profileId={profile.id} isPrivate={isPrivate} initialFollowStatus={initialFollowStatus} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}