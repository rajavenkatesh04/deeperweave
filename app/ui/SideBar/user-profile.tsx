'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PowerIcon } from '@heroicons/react/24/outline';
import { UserProfile as ProfileDefinition } from '@/lib/definitions';
import SignOutButton from '@/app/ui/auth/SignOutButton';

export default function UserProfile({ profile }: { profile: ProfileDefinition | null }) {

    // Guest State (Not Logged In)
    if (!profile) {
        return (
            <Link href="/auth/login" className="flex items-center h-14 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group">
                <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 rounded-full mr-3">
                    <PowerIcon className="h-5 w-5 text-zinc-500" />
                </div>
                <span className="opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 transition-all duration-300 delay-200 whitespace-nowrap text-sm font-bold">
                    Sign IN
                </span>
            </Link>
        );
    }

    // Logged In State
    return (
        <div className="relative w-full h-14 group/user">

            {/* --- LAYER 1: Default View (Avatar + Name) --- */}
            <div className="absolute inset-0 flex items-center px-2 transition-all duration-300 group-hover/user:opacity-0 group-hover/user:scale-95">
                {/* Avatar */}
                <div className="shrink-0 relative h-10 w-10 mr-3">
                    <Image
                        src={profile.profile_pic_url || '/placeholder-user.jpg'}
                        alt="Profile"
                        className="rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                        fill
                    />
                </div>
                {/* Text Details */}
                <div className="flex flex-col opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 transition-all duration-300 delay-200">
                    <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {profile.display_name}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                        @{profile.username}
                    </p>
                </div>
            </div>

            {/* --- LAYER 2: Hover Split View (The Pill) --- */}
            <div className="absolute inset-0 flex items-center opacity-0 scale-95 group-hover/user:opacity-100 group-hover/user:scale-100 transition-all duration-300 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg overflow-hidden">

                {/* LEFT HALF: Profile Link */}
                <Link
                    href={`/profile/${profile.username}`}
                    className="flex-1 h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group/left"
                    title="View Profile"
                >
                    <div className="relative w-6 h-6">
                        <Image
                            src={profile.profile_pic_url || '/placeholder-user.jpg'}
                            alt="Profile"
                            className="rounded-full object-cover opacity-80 group-hover/left:opacity-100"
                            fill
                        />
                    </div>
                </Link>

                {/* CENTER DIVIDER */}
                <div className="w-px h-full bg-zinc-200 dark:bg-zinc-800" />

                {/* RIGHT HALF: Logout Button Wrapper */}
                <SignOutButton
                    className="flex-1 h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors group/right"
                >
                    <PowerIcon className="w-5 h-5 text-zinc-400 group-hover/right:text-red-500 transition-colors" />
                </SignOutButton>
            </div>
        </div>
    );
}