'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import { PowerIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { logout } from '@/lib/actions/auth-actions';
import { UserProfile as Profile } from '@/lib/definitions';
import clsx from 'clsx';

interface UserProps {
    profile: Profile | null;
    email: string | undefined;
}

export default function UserProfile({ user }: { user: UserProps }) {
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    // Guest State
    if (!user.profile) {
        return (
            <Link href="/auth/login" className="flex items-center h-14 px-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group">
                <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 rounded-full mr-3">
                    <PowerIcon className="h-5 w-5 text-zinc-500" />
                </div>
                <span className="opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 transition-all duration-300 delay-200 whitespace-nowrap text-sm font-bold">
                    SIGN IN
                </span>
            </Link>
        );
    }

    return (
        <>
            {/* User State Container
               group/user allows us to detect hover on this specific element
               separate from the parent sidebar hover
            */}
            <div className="relative w-full h-14 group/user">

                {/* --- LAYER 1: Default View (Avatar + Name) --- */}
                {/* Fades out when hovering this specific element to reveal the split controls */}
                <div className="absolute inset-0 flex items-center px-2 transition-all duration-300 group-hover/user:opacity-0 group-hover/user:scale-95">
                    {/* Avatar */}
                    <div className="shrink-0 relative h-10 w-10 mr-3">
                        <Image
                            src={user.profile.profile_pic_url || '/placeholder-user.jpg'}
                            alt="Profile"
                            className="rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                            fill
                        />
                    </div>
                    {/* Text Details */}
                    <div className="flex flex-col opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 transition-all duration-300 delay-200">
                        <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {user.profile.display_name}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                            @{user.profile.username}
                        </p>
                    </div>
                </div>

                {/* --- LAYER 2: Hover Split View (The Pill) --- */}
                {/* Hidden by default, appears on hover */}
                <div className="absolute inset-0 flex items-center opacity-0 scale-95 group-hover/user:opacity-100 group-hover/user:scale-100 transition-all duration-300 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg overflow-hidden">

                    {/* LEFT HALF: Profile Link */}
                    <Link
                        href="/profile"
                        className="flex-1 h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group/left"
                        title="View Profile"
                    >
                        {/* Use Avatar again here for continuity, or a UserIcon */}
                        <div className="relative w-6 h-6">
                            <Image
                                src={user.profile.profile_pic_url || '/placeholder-user.jpg'}
                                alt="Profile"
                                className="rounded-full object-cover opacity-80 group-hover/left:opacity-100"
                                fill
                            />
                        </div>
                    </Link>

                    {/* CENTER DIVIDER */}
                    <div className="w-px h-full bg-zinc-200 dark:bg-zinc-800" />

                    {/* RIGHT HALF: Logout Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsLogoutOpen(true); }}
                        className="flex-1 h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors group/right"
                        title="Log Out"
                    >
                        <PowerIcon className="w-5 h-5 text-zinc-400 group-hover/right:text-red-500 transition-colors" />
                    </button>
                </div>
            </div>

            {/* Dialog Component */}
            <Dialog
                open={isLogoutOpen}
                onClose={() => setIsLogoutOpen(false)}
                className="relative z-[100]"
            >
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 rounded-2xl">
                        <Dialog.Title className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            Log out?
                        </Dialog.Title>
                        <Dialog.Description className="mt-2 text-sm text-zinc-500">
                            Are you sure you want to sign out now?
                        </Dialog.Description>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsLogoutOpen(false)}
                                className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <form action={logout} className="flex-1">
                                <button
                                    type="submit"
                                    className="w-full py-2.5 px-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity text-sm font-bold"
                                >
                                    Log Out
                                </button>
                            </form>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </>
    );
}