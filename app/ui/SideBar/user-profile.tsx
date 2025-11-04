'use client';

import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Link from 'next/link';
import { PowerIcon, Cog6ToothIcon, UserCircleIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { logout } from '@/lib/actions/auth-actions';
import { UserProfile as Profile } from '@/lib/definitions';

// Define the shape of the user prop this component expects
interface UserProps {
    profile: Profile | null;
    email: string | undefined;
}

export default function UserProfile({ user }: { user: UserProps }) {
    // Render a login link if the user is not signed in
    if (!user.profile) {
        return (
            <Link href="/auth/login" className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:bg-red-900/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-zinc-700">
                    <PowerIcon className="h-6 w-6 text-gray-500" />
                </div>
                <div className="hidden min-w-0 flex-1 md:block">
                    <p className="truncate font-medium text-gray-900 dark:text-zinc-100">Sign In</p>
                    <p className="truncate text-xs text-gray-500 dark:text-zinc-400">Account</p>
                </div>
            </Link>
        );
    }

    return (
        <Menu as="div" className="relative">
            {/* The button that triggers the dropdown */}
            <Menu.Button className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:hover:bg-red-900/20">
                <Image
                    src={user.profile.profile_pic_url || '/placeholder-user.jpg'}
                    alt={user.profile.display_name ? `${user.profile.display_name}'s profile picture` : 'Profile picture'}
                    className="h-10 w-10 rounded-full object-cover"
                    width={40}
                    height={40}
                />
                <div className="hidden min-w-0 flex-1 md:block">
                    <p className="truncate font-medium text-gray-900 dark:text-zinc-100">{user.profile.display_name}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-zinc-400">@{user.profile.username}</p>
                </div>
            </Menu.Button>

            {/* The dropdown menu */}
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute bottom-full mb-2 w-56 origin-bottom-left rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="p-1">

                        {/* Notifications Link */}
                        <Menu.Item>
                            {({ active }) => (
                                <Link
                                    href="/profile/notifications"
                                    className={`${
                                        active ? 'bg-red-100 dark:bg-red-900/30' : ''
                                    } group flex w-full items-center gap-3 rounded-md p-2 text-sm text-gray-900 dark:text-zinc-200`}
                                >
                                    <BellAlertIcon className="h-5 w-5" />
                                    Notifications
                                </Link>
                            )}
                        </Menu.Item>

                        {/* Profile Link */}
                        <Menu.Item>
                            {({ active }) => (
                                <Link
                                    href="/profile"
                                    className={`${
                                        active ? 'bg-red-100 dark:bg-red-900/30' : ''
                                    } group flex w-full items-center gap-3 rounded-md p-2 text-sm text-gray-900 dark:text-zinc-200`}
                                >
                                    <UserCircleIcon className="h-5 w-5" />
                                    Profile
                                </Link>
                            )}
                        </Menu.Item>

                        {/* Profile Settings Link */}
                        <Menu.Item>
                            {({ active }) => (
                                <Link
                                    href="/profile/settings"
                                    className={`${
                                        active ? 'bg-red-100 dark:bg-red-900/30' : ''
                                    } group flex w-full items-center gap-3 rounded-md p-2 text-sm text-gray-900 dark:text-zinc-200`}
                                >
                                    <Cog6ToothIcon className="h-5 w-5" />
                                    Profile Settings
                                </Link>
                            )}
                        </Menu.Item>



                        {/* Sign Out Button */}
                        <Menu.Item>
                            {({ active }) => (
                                <form action={logout} className="w-full">
                                    <button
                                        type="submit"
                                        className={`${
                                            active ? 'bg-red-600 text-white' : 'text-gray-900 dark:text-zinc-200'
                                        } group flex w-full items-center gap-3 rounded-md p-2 text-sm`}
                                    >
                                        <PowerIcon className="h-5 w-5" />
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