'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserProfile } from '@/lib/definitions';
import FollowButton from '@/app/ui/users/FollowButton';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

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
        <div className="relative w-full mb-12 animate-in fade-in duration-700">

            {/* 1. Ambient Background Banner */}
            {/* Increased height slightly to ensure the banner feels substantial */}
            <div className="relative h-52 md:h-72 w-full overflow-hidden rounded-b-[2.5rem]">
                <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-900" />
                {profile.profile_pic_url && (
                    <Image
                        src={profile.profile_pic_url}
                        alt="Background"
                        fill
                        className="object-cover opacity-50 blur-3xl scale-125 saturate-150"
                        priority
                    />
                )}
                {/* Gradient fade for smooth text readability if needed */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-50/60 dark:to-zinc-950/60" />
            </div>

            {/* 2. Main Profile Content */}
            {/* UPDATED: Changed -mt-20 to -mt-12 (mobile) / -mt-16 (desktop) to push content down away from banner edge */}
            <div className="relative px-6 md:px-12 -mt-12 md:-mt-16 z-10">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-8">

                    {/* Avatar */}
                    <div className="relative group shrink-0">
                        {/* Glow effect behind avatar */}
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-white/50 to-white/0 rounded-full blur opacity-50 dark:opacity-20" />

                        <div className="relative h-32 w-32 md:h-44 md:w-44 rounded-full p-1.5 bg-white dark:bg-zinc-950 shadow-2xl">
                            <div className="relative h-full w-full rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                                <Image
                                    className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                                    src={profile.profile_pic_url || '/placeholder-user.jpg'}
                                    alt={profile.display_name}
                                    fill
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Identity & Actions */}
                    {/* UPDATED: Added mt-4 for mobile spacing. Removed md:mb-4 to let text settle lower. */}
                    <div className="flex-1 w-full md:w-auto mt-4 md:mt-0 md:pb-2 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">

                        {/* Name Block */}
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
                                {profile.display_name}
                            </h1>
                            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">
                                @{profile.username}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {isOwnProfile ? (
                                <Link
                                    href="/profile/edit"
                                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
                                >
                                    <PencilSquareIcon className="w-4 h-4" />
                                    <span>Edit Profile</span>
                                </Link>
                            ) : (
                                <div className="flex-1 md:flex-none w-full md:w-auto">
                                    <FollowButton
                                        profileId={profile.id}
                                        isPrivate={isPrivate}
                                        initialFollowStatus={initialFollowStatus}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Bio & Stats Section */}
                <div className="mt-8 md:mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Bio Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {profile.bio ? (
                            <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed font-light whitespace-pre-wrap">
                                {profile.bio}
                            </p>
                        ) : (
                            <p className="text-zinc-400 italic">No bio yet.</p>
                        )}
                    </div>

                    {/* Stats Column */}
                    <div className="flex items-center lg:justify-end gap-10 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800 pt-8 lg:pt-0">
                        <Link
                            href={`/profile/${profile.username}/followers`}
                            className="group flex flex-col items-start lg:items-end cursor-pointer"
                        >
                            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                {followerCount}
                            </span>
                            <span className="text-xs uppercase tracking-widest font-semibold text-zinc-500 mt-1">
                                Followers
                            </span>
                        </Link>

                        {/* Divider */}
                        <div className="h-12 w-px bg-zinc-200 dark:bg-zinc-800" />

                        <Link
                            href={`/profile/${profile.username}/following`}
                            className="group flex flex-col items-start lg:items-end cursor-pointer"
                        >
                            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                {followingCount}
                            </span>
                            <span className="text-xs uppercase tracking-widest font-semibold text-zinc-500 mt-1">
                                Following
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}