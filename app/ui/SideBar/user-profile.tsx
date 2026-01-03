'use client';

import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Link from 'next/link';
import { PowerIcon, Cog6ToothIcon, UserCircleIcon, BellAlertIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { logout } from '@/lib/actions/auth-actions';
import { UserProfile as Profile } from '@/lib/definitions';

interface UserProps {
    profile: Profile | null;
    email: string | undefined;
}

export default function UserProfile({ user }: { user: UserProps }) {
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
        <Menu as="div" className="relative">
            {/* The Trigger Button - Technical ID Card Style */}
            <Menu.Button className="flex w-full items-center gap-3 p-3 text-left transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 group">
                <div className="relative h-9 w-9 shrink-0">
                    <Image
                        src={user.profile.profile_pic_url || '/placeholder-user.jpg'}
                        alt="Profile"
                        className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                        width={36}
                        height={36}
                    />
                    {/* Status Dot */}
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-black" />
                </div>

                <div className="hidden min-w-0 flex-1 md:block">
                    <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none mb-1">
                        {user.profile.display_name}
                    </p>
                    <p className="truncate text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                        @{user.profile.username}
                    </p>
                </div>

                <EllipsisVerticalIcon className="h-5 w-5 text-zinc-400 hidden md:block" />
            </Menu.Button>

            {/* The Dropdown - Sharp & Technical */}
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute bottom-full left-0 right-0 mb-2 origin-bottom rounded-sm border border-zinc-200 bg-white shadow-2xl focus:outline-none dark:border-zinc-800 dark:bg-black w-full min-w-[220px] z-50">
                    <div className="p-1 space-y-0.5">

                        <Menu.Item>
                            {({ active }) => (
                                <Link href="/profile/notifications" className={`${active ? 'bg-zinc-100 dark:bg-zinc-900' : ''} group flex w-full items-center gap-3 px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-300`}>
                                    <BellAlertIcon className="h-4 w-4" />
                                    Notifications
                                </Link>
                            )}
                        </Menu.Item>

                        <Menu.Item>
                            {({ active }) => (
                                <Link href="/profile" className={`${active ? 'bg-zinc-100 dark:bg-zinc-900' : ''} group flex w-full items-center gap-3 px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-300`}>
                                    <UserCircleIcon className="h-4 w-4" />
                                    Profile
                                </Link>
                            )}
                        </Menu.Item>

                        <Menu.Item>
                            {({ active }) => (
                                <Link href="/profile/settings" className={`${active ? 'bg-zinc-100 dark:bg-zinc-900' : ''} group flex w-full items-center gap-3 px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-300`}>
                                    <Cog6ToothIcon className="h-4 w-4" />
                                    Settings
                                </Link>
                            )}
                        </Menu.Item>

                        <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-1" />

                        <Menu.Item>
                            {({ active }) => (
                                <form action={logout} className="w-full">
                                    <button type="submit" className={`${active ? 'bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-400'} group flex w-full items-center gap-3 px-3 py-2 text-xs font-medium uppercase tracking-wider`}>
                                        <PowerIcon className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </form>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}