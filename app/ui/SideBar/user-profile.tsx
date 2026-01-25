'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import { PowerIcon } from '@heroicons/react/24/outline';
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
            <Link href="/auth/login" className="flex items-center h-12 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group">
                <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 rounded-full mr-3">
                    <PowerIcon className="h-4 w-4 text-zinc-500" />
                </div>
                <span className="opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 transition-all duration-300 whitespace-nowrap text-sm font-bold">
                    SIGN IN
                </span>
            </Link>
        );
    }

    return (
        <>
            {/* Profile Cuboid - Hover logic handled by sidebar group */}
            <div className="group relative w-full h-14 [perspective:1000px]">
                <div className={clsx(
                    "relative w-full h-full duration-500 [transform-style:preserve-3d]",
                    // Only rotate nicely if we have room, otherwise specific mobile behavior or just stay flat
                    "group-hover:[transform:rotateX(90deg)]"
                )}>

                    {/* FRONT FACE: User Profile */}
                    <div className="absolute inset-0 flex items-center px-2 bg-transparent [backface-visibility:hidden] [transform:translateZ(28px)]">
                        {/* Avatar - Pinned */}
                        <div className="shrink-0 relative h-10 w-10 mr-3">
                            <Image
                                src={user.profile.profile_pic_url || '/placeholder-user.jpg'}
                                alt="Profile"
                                className="rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                                fill
                            />
                        </div>
                        {/* Text */}
                        <div className="flex flex-col opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 transition-all duration-300">
                            <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                {user.profile.display_name}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                                @{user.profile.username}
                            </p>
                        </div>
                    </div>

                    {/* BOTTOM FACE: Logout Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsLogoutOpen(true); }}
                        className="absolute inset-0 flex items-center px-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-md [backface-visibility:hidden] [transform:rotateX(-90deg)_translateZ(28px)]"
                    >
                        <div className="shrink-0 w-10 h-10 flex items-center justify-center mr-3">
                            <PowerIcon className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-sm tracking-wide opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 transition-all duration-300">
                            LOG OUT
                        </span>
                    </button>
                </div>
            </div>

            {/* Dialog Component (Unchanged) */}
            <Dialog
                open={isLogoutOpen}
                onClose={() => setIsLogoutOpen(false)}
                className="relative z-[100]"
            >
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-sm bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 rounded-lg">
                        <Dialog.Title className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            Log out?
                        </Dialog.Title>
                        <Dialog.Description className="mt-2 text-sm text-zinc-500">
                            Are you sure you want to sign out now?
                        </Dialog.Description>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsLogoutOpen(false)}
                                className="flex-1 py-2 px-4 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <form action={logout} className="flex-1">
                                <button
                                    type="submit"
                                    className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-500 text-sm font-medium"
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