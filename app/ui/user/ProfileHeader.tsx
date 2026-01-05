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
    FilmIcon,
    IdentificationIcon,
    BellIcon
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
            className="group flex items-center gap-2 px-2 py-0.5 md:px-3 md:py-1 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-all cursor-copy"
            title="Click to copy ID"
        >
            <span className="text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white">
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

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-12">

                {/* --- BENTO BOX GRID --- */}
                {/* Mobile: 2 Cols | Desktop: 12 Cols */}
                <div className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-6">

                    {/* BLOCK 1: VISUAL (Avatar & Location) */}
                    <div className="col-span-1 md:col-span-3 order-1 md:order-1 flex flex-col gap-2 md:gap-4 h-full">
                        <div className="relative w-full aspect-square bg-white dark:bg-black p-1 shadow-sm border border-zinc-200 dark:border-zinc-800 group h-full">

                            <div className="relative w-full h-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                                {profile.profile_pic_url ? (
                                    <Image
                                        className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
                                        src={profile.profile_pic_url}
                                        alt={profile.display_name}
                                        fill
                                        priority
                                        sizes="(max-width: 768px) 50vw, 300px"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full">
                                        <FilmIcon className="w-8 h-8 md:w-12 md:h-12 text-zinc-300 dark:text-zinc-700" />
                                    </div>
                                )}

                                {/* Frame markers */}
                                <div className="absolute top-1 left-1 md:top-2 md:left-2 w-2 h-2 border-t border-l border-zinc-400/50" />
                                <div className="absolute top-1 right-1 md:top-2 md:right-2 w-2 h-2 border-t border-r border-zinc-400/50" />
                                <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 w-2 h-2 border-b border-l border-zinc-400/50" />
                                <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-2 h-2 border-b border-r border-zinc-400/50" />
                            </div>
                        </div>

                        {/* Location Badge: Hidden on mobile to save space, visible desktop */}
                        <div className="hidden md:flex items-center justify-center gap-2 p-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-xs font-mono uppercase tracking-wider text-zinc-500 mt-auto">
                            <MapPinIcon className="w-4 h-4" />
                            {profile.country || "N/A"}
                        </div>
                    </div>

                    {/* BLOCK 2: NARRATIVE (Identity & Bio) */}
                    <div className="col-span-2 md:col-span-6 order-3 md:order-2 flex flex-col bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 md:p-8 shadow-sm relative h-full">
                        {/* Decorative Label */}
                        <div className="absolute top-3 right-3 md:top-4 md:right-4 flex items-center gap-1 text-[9px] uppercase tracking-widest text-zinc-300 dark:text-zinc-700 font-mono">
                            <IdentificationIcon className="w-3 h-3" />
                            <span className="hidden md:inline">ID-CARD</span>
                        </div>

                        <div className="flex flex-col gap-3 md:gap-4 h-full">
                            {/* Header Row: Name & ID */}
                            <div className="flex flex-col items-start gap-2 md:gap-3">
                                <h1 className={`${PlayWriteNewZealandFont.className} text-2xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 leading-none pt-2 md:pt-0`}>
                                    {profile.display_name}
                                </h1>
                                <CopyableId username={profile.username} />
                            </div>

                            <div className="w-full h-px bg-zinc-100 dark:bg-zinc-900 my-1 md:my-4" />

                            {/* Bio Area */}
                            <div className="flex-1">
                                {profile.bio ? (
                                    <p className="text-xs md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap font-light">
                                        {profile.bio}
                                    </p>
                                ) : (
                                    <p className="text-zinc-400 italic text-xs md:text-sm font-mono">
                                        // No biography data.
                                    </p>
                                )}
                            </div>

                            {/* Mobile Only Location (Compact footer for bio) */}
                            <div className="md:hidden flex items-center gap-1 text-[10px] font-mono uppercase text-zinc-400 pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-900">
                                <MapPinIcon className="w-3 h-3" />
                                {profile.country || "N/A"}
                            </div>
                        </div>
                    </div>

                    {/* BLOCK 3: CONTROL PANEL (Stats & Actions) */}
                    <div className="col-span-1 md:col-span-3 order-2 md:order-3 flex flex-col gap-2 md:gap-4 h-full">

                        {/* Stats Card */}
                        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-2 md:p-6 flex flex-col justify-center shadow-sm h-full md:h-auto flex-1">

                            <div className="flex flex-col h-full justify-between md:justify-start md:space-y-6">

                                {/* 1. Followers */}
                                <Link href={`/profile/${profile.username}/followers`} className="flex flex-col md:flex-row items-center md:justify-between group gap-1 md:gap-0">
                                    <div className="flex items-center gap-3">
                                        <div className="hidden md:block p-2 bg-zinc-50 dark:bg-zinc-900 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors border border-zinc-100 dark:border-zinc-800">
                                            <UsersIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                                        </div>
                                        <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-zinc-400 md:text-zinc-500">Followers</span>
                                    </div>
                                    <span className="text-lg md:text-2xl font-light text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors font-mono">
                                        {followerCount}
                                    </span>
                                </Link>

                                {/* Divider */}
                                <div className="h-px w-full bg-zinc-100 dark:bg-zinc-900" />

                                {/* 2. Following */}
                                <Link href={`/profile/${profile.username}/following`} className="flex flex-col md:flex-row items-center md:justify-between group gap-1 md:gap-0">
                                    <div className="flex items-center gap-3">
                                        <div className="hidden md:block p-2 bg-zinc-50 dark:bg-zinc-900 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors border border-zinc-100 dark:border-zinc-800">
                                            <UsersIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                                        </div>
                                        <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-zinc-400 md:text-zinc-500">Following</span>
                                    </div>
                                    <span className="text-lg md:text-2xl font-light text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors font-mono">
                                        {followingCount}
                                    </span>
                                </Link>

                                {/* Divider */}
                                <div className="h-px w-full bg-zinc-100 dark:bg-zinc-900" />

                                {/* 3. Watched */}
                                <Link href={`/profile/${profile.username}/timeline`}>
                                    <div className="flex flex-col md:flex-row items-center md:justify-between group gap-1 md:gap-0">
                                        <div className="flex items-center gap-3">
                                            <div className="hidden md:block p-2 bg-zinc-50 dark:bg-zinc-900 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors border border-zinc-100 dark:border-zinc-800">
                                                <FilmIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400"/>
                                            </div>
                                            <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-zinc-400 md:text-zinc-500">Watched</span>
                                        </div>
                                        <span className="text-lg md:text-2xl font-light text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors font-mono">
                                        {timelineCount}
                                    </span>
                                    </div>
                                </Link>

                                {/* --- DESKTOP ACTIONS (MOVED HERE) --- */}
                                {/* Visible only on Desktop (md:flex). Hidden on mobile. */}
                                <div className="hidden md:flex flex-col mt-auto pt-4">
                                    <div className="h-px w-full bg-zinc-100 dark:bg-zinc-900 mb-4" />

                                    {isOwnProfile ? (
                                        // Edit Button (Exact copy of mobile styles)
                                        <Link
                                            href="/profile/edit"
                                            className="flex w-full items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold uppercase tracking-[0.15em] transition-all shadow-sm hover:shadow-md border border-zinc-900 dark:border-white py-3"
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />
                                            <span>Edit</span>
                                        </Link>
                                    ) : (
                                        // Follow Button
                                        // I have removed the color overrides.
                                        // Only kept: w-full, uppercase, bold, tracking (to match font style) and py-3 for height.
                                        <div className="w-full [&>button]:w-full [&>button]:py-3 [&>button]:rounded-none [&>button]:text-xs [&>button]:uppercase [&>button]:tracking-[0.15em] [&>button]:font-bold">
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
                    </div>

                    {/* BLOCK 4: ACTION BUTTONS (MOBILE ONLY) */}
                    {/* --- CHANGE: Added 'md:hidden' to hide this block on desktop --- */}
                    <div className="col-span-2 md:hidden h-12 mt-auto order-4">
                        {isOwnProfile ? (
                            <div className="flex w-full h-full gap-2">
                                {/* Edit Button */}
                                <Link
                                    href="/profile/edit"
                                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold uppercase tracking-[0.15em] transition-all shadow-sm hover:shadow-md border border-zinc-900 dark:border-white"
                                >
                                    <PencilSquareIcon className="w-4 h-4" />
                                    <span>Edit</span>
                                </Link>

                                {/* Notification Button */}
                                <Link
                                    href="/profile/notifications"
                                    className="aspect-square h-full flex items-center justify-center bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all shadow-sm"
                                    aria-label="Notifications"
                                >
                                    <BellIcon className="w-5 h-5" />
                                </Link>
                            </div>
                        ) : (
                            <div className="h-full w-full">
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
    );
}