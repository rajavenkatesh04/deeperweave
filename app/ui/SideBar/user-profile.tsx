'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import { PowerIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { logout } from '@/lib/actions/auth-actions';
import { UserProfile as Profile } from '@/lib/definitions';

interface UserProps {
    profile: Profile | null;
    email: string | undefined;
}

export default function UserProfile({ user }: { user: UserProps }) {
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    // Fallback if no user profile is present
    if (!user.profile) {
        return (
            <Link href="/auth/login" className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all group">
                <div className="flex h-8 w-8 items-center justify-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
                    <PowerIcon className="h-4 w-4 text-zinc-500 group-hover:text-black dark:group-hover:text-white" />
                </div>
                <div className="hidden min-w-0 flex-1 md:block">
                    <p className="truncate text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Sign In</p>
                </div>
            </Link>
        );
    }

    return (
        <>
            {/* 3D Cuboid Container */}
            <div className="group relative w-full h-[64px] [perspective:1000px]">
                <div className="relative w-full h-full duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateX(90deg)]">

                    {/* FRONT FACE: User Profile */}
                    <div className="absolute inset-0 flex items-center gap-3 p-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 [backface-visibility:hidden] [transform:translateZ(32px)]">
                        <div className="relative h-9 w-9 shrink-0">
                            <Image
                                src={user.profile.profile_pic_url || '/placeholder-user.jpg'}
                                alt="Profile"
                                className="h-full w-full object-cover transition-all duration-300"
                                width={36}
                                height={36}
                            />
                            {/* Tech Deco Corner */}
                            <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t border-l border-zinc-900 dark:border-zinc-100" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b border-r border-zinc-900 dark:border-zinc-100" />
                        </div>

                        <div className="hidden min-w-0 flex-1 md:block">
                            <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none mb-1">
                                {user.profile.display_name}
                            </p>
                            <p className="truncate text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                                @{user.profile.username}
                            </p>
                        </div>
                    </div>

                    {/* BOTTOM FACE: Logout Button (Rotated -90deg to sit at the bottom) */}
                    <button
                        onClick={() => setIsLogoutOpen(true)}
                        className="absolute inset-0 w-full h-full flex items-center justify-center gap-2 bg-red-600 dark:bg-red-700 border border-red-700 dark:border-red-900 text-white cursor-pointer [backface-visibility:hidden] [transform:rotateX(-90deg)_translateZ(32px)] hover:bg-red-500 transition-colors"
                    >
                        <PowerIcon className="h-5 w-5" />
                        <span className="font-mono text-sm font-bold tracking-widest uppercase">LOG OUT</span>
                    </button>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog
                open={isLogoutOpen}
                onClose={() => setIsLogoutOpen(false)}
                className="relative z-[100]"
            >
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

                {/* Modal Position */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-sm bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 relative">
                        {/* Decorative Corners */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-zinc-900 dark:border-zinc-100" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zinc-900 dark:border-zinc-100" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-zinc-900 dark:border-zinc-100" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-900 dark:border-zinc-100" />

                        <div className="text-center space-y-4">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500">
                                <PowerIcon className="h-6 w-6" />
                            </div>

                            <Dialog.Title className="text-lg font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                                Terminate Session?
                            </Dialog.Title>

                            <Dialog.Description className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                                Are you sure you want to log out of your account? This action cannot be undone locally.
                            </Dialog.Description>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setIsLogoutOpen(false)}
                                    className="flex-1 py-2 px-4 border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-900 dark:text-zinc-100"
                                >
                                    Cancel
                                </button>
                                <form action={logout} className="flex-1">
                                    <button
                                        type="submit"
                                        className="w-full py-2 px-4 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-500 transition-colors"
                                    >
                                        Confirm
                                    </button>
                                </form>
                            </div>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </>
    );
}