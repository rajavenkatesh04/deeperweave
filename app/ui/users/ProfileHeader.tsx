'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { UserProfile } from '@/lib/definitions';
import FollowButton from '@/app/ui/users/FollowButton';
import {
    PencilSquareIcon,
    MapPinIcon,
    DocumentDuplicateIcon,
    CheckIcon,
    UsersIcon,
    FilmIcon,
    IdentificationIcon
} from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

// Helper Component for the Copy-ID Feature
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
            className="group flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all cursor-copy"
            title="Click to copy ID"
        >
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white">
                @{username}
            </span>
            {copied ? (
                <CheckIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
            ) : (
                <DocumentDuplicateIcon className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200" />
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
                                      }: {
    profile: UserProfile;
    isOwnProfile: boolean;
    isPrivate: boolean;
    initialFollowStatus: 'not_following' | 'pending' | 'accepted';
    followerCount: number;
    followingCount: number;
}) {
    return (
        <div className="relative w-full bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden">

            {/* --- TECHNICAL BACKGROUND --- */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                 style={{
                     backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                     backgroundSize: '24px 24px'
                 }}
            />
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                {/* --- BENTO BOX GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

                    {/* BLOCK 1: THE VISUAL (Avatar & Location) - Spans 3 columns */}
                    <div className="md:col-span-3 flex flex-col gap-4">
                        <div className="relative aspect-square w-full bg-white dark:bg-black p-1.5 shadow-sm border border-zinc-200 dark:border-zinc-800 group">
                            <div className="relative w-full h-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                                {profile.profile_pic_url ? (
                                    <Image
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0 grayscale"
                                        src={profile.profile_pic_url}
                                        alt={profile.display_name}
                                        fill
                                        priority
                                        sizes="(max-width: 768px) 100vw, 300px"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full">
                                        <FilmIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
                                    </div>
                                )}
                                {/* Frame markers */}
                                <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-zinc-400/50" />
                                <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-zinc-400/50" />
                                <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-zinc-400/50" />
                                <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-zinc-400/50" />
                            </div>
                        </div>

                        {/* Location Badge */}
                        <div className="hidden md:flex items-center justify-center gap-2 p-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-mono uppercase tracking-wider text-zinc-500">
                            <MapPinIcon className="w-4 h-4" />
                            {profile.country || "N/A"}
                        </div>
                    </div>


                    {/* BLOCK 2: THE NARRATIVE (Identity & Bio) - Spans 5 columns */}
                    <div className="md:col-span-6 flex flex-col bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm relative">
                        {/* Decorative Label */}
                        <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] uppercase tracking-widest text-zinc-300 dark:text-zinc-700 font-mono">
                            <IdentificationIcon className="w-3 h-3" />
                            ID-CARD
                        </div>

                        <div className="flex flex-col gap-4 h-full pt-2">

                            {/* Header Row: Name & ID */}
                            <div className="flex flex-col items-start gap-3">
                                <h1 className={`${PlayWriteNewZealandFont.className} text-3xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 leading-none`}>
                                    {profile.display_name}
                                </h1>
                                <CopyableId username={profile.username} />
                            </div>

                            <div className="w-full h-px bg-zinc-100 dark:bg-zinc-900 my-4" />

                            {/* Bio Area */}
                            <div className="flex-1">
                                {profile.bio ? (
                                    <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap font-light">
                                        {profile.bio}
                                    </p>
                                ) : (
                                    <p className="text-zinc-400 italic text-sm font-mono">
                                        // No biography data found.
                                    </p>
                                )}
                            </div>

                            {/* Mobile Location */}
                            <div className="md:hidden flex items-center gap-2 text-xs font-mono uppercase text-zinc-500 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                                <MapPinIcon className="w-3 h-3" />
                                <span>{profile.country || "Unknown Location"}</span>
                            </div>
                        </div>
                    </div>


                    {/* BLOCK 3: THE CONTROL PANEL (Stats & Actions) - Spans 3 columns */}
                    <div className="md:col-span-3 flex flex-col gap-4">

                        {/* Stats Card */}
                        <div className="flex-1 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-center shadow-sm">
                            <div className="space-y-6">
                                <Link href={`/profile/${profile.username}/followers`} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-zinc-50 dark:bg-zinc-900 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors border border-zinc-100 dark:border-zinc-800">
                                            <UsersIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Followers</span>
                                    </div>
                                    <span className="text-2xl font-light text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors font-mono">
                                        {followerCount}
                                    </span>
                                </Link>

                                <div className="h-px w-full bg-zinc-100 dark:bg-zinc-900" />

                                <Link href={`/profile/${profile.username}/following`} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-zinc-50 dark:bg-zinc-900 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors border border-zinc-100 dark:border-zinc-800">
                                            <UsersIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Following</span>
                                    </div>
                                    <span className="text-2xl font-light text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors font-mono">
                                        {followingCount}
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* Action Button Card */}
                        <div className="h-14">
                            {isOwnProfile ? (
                                <Link
                                    href="/profile/edit"
                                    className="h-full w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold uppercase tracking-[0.15em] transition-all shadow-sm hover:shadow-md border border-zinc-900 dark:border-white"
                                >
                                    <PencilSquareIcon className="w-4 h-4" />
                                    Edit Profile
                                </Link>
                            ) : (
                                <div className="h-full w-full">
                                    {/* Wrapping div to pass height to FollowButton if needed */}
                                    <div className="h-full [&>button]:h-full [&>button]:w-full [&>button]:rounded-none [&>button]:text-xs [&>button]:uppercase [&>button]:tracking-[0.15em] [&>button]:font-bold">
                                        <FollowButton
                                            profileId={profile.id}
                                            isPrivate={isPrivate}
                                            initialFollowStatus={initialFollowStatus}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}