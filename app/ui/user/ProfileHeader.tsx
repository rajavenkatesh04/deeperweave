'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { UserProfile } from '@/lib/definitions';
import FollowButton from '@/app/ui/user/FollowButton';
import {
    PencilSquareIcon,
    MapPinIcon,
    DocumentDuplicateIcon,
    CheckIcon,
    UsersIcon,
    FilmIcon
} from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

// Compact Copy ID Component
function CopyableId({ username }: { username: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`@${username}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="group flex items-center gap-1.5 text-xs font-mono text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            title="Copy ID"
        >
            <span>@{username}</span>
            {copied ? (
                <CheckIcon className="w-3 h-3 text-green-600" />
            ) : (
                <DocumentDuplicateIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
        </button>
    );
}

export default function ProfileHeader({
                                          profile,
                                          isOwnProfile,
                                          isPrivate,
                                          initialFollowStatus,
                                          followerCount,
                                          followingCount,
                                          timelineCount,
                                      }: {
    profile: UserProfile;
    isOwnProfile: boolean;
    isPrivate: boolean;
    initialFollowStatus: 'not_following' | 'pending' | 'accepted';
    followerCount: number;
    followingCount: number;
    timelineCount: number;
}) {
    return (
        <div className="w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
            <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">

                {/* --- FLEX CONTAINER --- */}
                <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">

                    {/* 1. VISUAL IDENTIFIER (Avatar) */}
                    {/* Fixed Size, sharply distinct */}
                    <div className="shrink-0 relative">
                        <div className="w-20 h-20 md:w-24 md:h-24 relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            {profile.profile_pic_url ? (
                                <Image
                                    className="object-cover"
                                    src={profile.profile_pic_url}
                                    alt={profile.display_name}
                                    fill
                                    priority
                                    sizes="96px"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-zinc-300">
                                    <FilmIcon className="w-8 h-8" />
                                </div>
                            )}
                            {/* Technical Frame Markers */}
                            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-zinc-900 dark:border-zinc-100" />
                            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-zinc-900 dark:border-zinc-100" />
                        </div>
                    </div>

                    {/* 2. DATA BLOCK (Identity & Stats) */}
                    <div className="flex-1 min-w-0 flex flex-col gap-4">

                        {/* Top Row: Name & Actions */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                            {/* Identity */}
                            <div>
                                <h1 className={`${PlayWriteNewZealandFont.className} text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-none`}>
                                    {profile.display_name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                    <CopyableId username={profile.username} />
                                    {profile.country && (
                                        <>
                                            <span className="text-zinc-300 dark:text-zinc-700">|</span>
                                            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono text-zinc-500">
                                                <MapPinIcon className="w-3 h-3" />
                                                {profile.country}
                                            </div>
                                        </>
                                    )}
                                </div>
                                {/* Optional: A truncated bio line if you really want it, otherwise leave blank for pure conciseness */}
                                {profile.bio && (
                                    <p className="mt-3 text-xs md:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 max-w-2xl font-light">
                                        {profile.bio}
                                    </p>
                                )}
                            </div>

                            {/* Action Button Area */}
                            <div className="shrink-0 flex items-center gap-3">
                                {isOwnProfile ? (
                                    <Link
                                        href="/profile/edit"
                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-100 text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                        <span>Edit</span>
                                    </Link>
                                ) : (
                                    <div className="w-full md:w-32">
                                        <FollowButton
                                            profileId={profile.id}
                                            isPrivate={isPrivate}
                                            initialFollowStatus={initialFollowStatus}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Row: Technical Stats Strip */}
                        <div className="flex items-center gap-6 md:gap-10 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 mt-auto">
                            <Link href={`/profile/${profile.username}/followers`} className="group flex items-baseline gap-2 hover:opacity-80 transition-opacity">
                                <span className="text-sm md:text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                                    {followerCount}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-300">
                                    Followers
                                </span>
                            </Link>

                            <Link href={`/profile/${profile.username}/following`} className="group flex items-baseline gap-2 hover:opacity-80 transition-opacity">
                                <span className="text-sm md:text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                                    {followingCount}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-300">
                                    Following
                                </span>
                            </Link>

                            <Link href={`/profile/${profile.username}/timeline`} className="group flex items-baseline gap-2 hover:opacity-80 transition-opacity">
                                <span className="text-sm md:text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                                    {timelineCount}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-300">
                                    Logs
                                </span>
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}