'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { getProfileCardData } from '@/lib/actions/profile-actions';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { UserProfile } from '@/lib/definitions';

// This is the data we FETCH
type ProfileData = {
    profile: UserProfile; // UserProfile already contains created_at
    followerCount: number;
    followingCount: number;
};

// This is the basic info PASSED IN from the card
// This is the basic info PASSED IN from the card
type BaseUser = {
    id: string;
    username: string;
    profile_pic_url?: string | null; // Optional, accepts null or undefined
};

export default function UserProfilePopover({
                                               user,
                                               onClose
                                           }: {
    user: BaseUser;
    onClose: () => void;
}) {
    const [data, setData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch the full profile data when the popover opens
        async function fetchData() {
            setIsLoading(true);
            try {
                // getProfileCardData returns { profile, followerCount, followingCount }
                const result = await getProfileCardData(user.username);
                if (result.profile) {
                    setData(result as ProfileData); // The 'profile' object inside has created_at
                }
            } catch (error) {
                console.error("Failed to fetch profile card data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [user.username]);

    // This logic is correct. It accesses created_at from the fetched data.
    // const memberSince = data?.profil
    //     ? new Date(data.profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    //     : null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full border dark:border-zinc-800"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 z-10 p-1 rounded-full text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    {/* Header with PFP and Names */}
                    <div className="p-6 flex items-center gap-4 border-b dark:border-zinc-800">
                        <Image
                            src={user.profile_pic_url || '/default-avatar.png'}
                            alt={user.username}
                            width={64}
                            height={64}
                            className="rounded-full h-16 w-16 object-cover ring-2 ring-white dark:ring-zinc-900"
                        />
                        <div className="min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                                {data?.profile.display_name || user.username}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">
                                @{user.username}
                            </p>
                        </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-6">
                        {isLoading ? (
                            <div className="h-24 flex items-center justify-center">
                                <LoadingSpinner />
                            </div>
                        ) : data ? (
                            <div className="space-y-4">
                                {/* Bio */}
                                {data.profile.bio && (
                                    <p className="text-sm text-gray-700 dark:text-zinc-300 italic">
                                        &ldquo;{data.profile.bio}&rdquo;
                                    </p>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-6">
                                    <div className="text-sm">
                                        <span className="font-bold text-gray-900 dark:text-white">{data.followerCount}</span>
                                        <span className="text-gray-500 dark:text-zinc-400"> Followers</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-bold text-gray-900 dark:text-white">{data.followingCount}</span>
                                        <span className="text-gray-500 dark:text-zinc-400"> Following</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
                                    {data.profile.country && (
                                        <div className="text-sm text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                                            <MapPinIcon className="w-4 h-4" />
                                            {data.profile.country}
                                        </div>
                                    )}
                                    {/*{memberSince && (*/}
                                    {/*    <div className="text-sm text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">*/}
                                    {/*        <CalendarIcon className="w-4 h-4" />*/}
                                    {/*        Joined {memberSince}*/}
                                    {/*    </div>*/}
                                    {/*)}*/}
                                </div>

                                {/* View Profile Button */}
                                <Link
                                    href={`/profile/${user.username}`}
                                    onClick={onClose}
                                    className="block w-full text-center px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold shadow-sm hover:bg-rose-700 transition-all"
                                >
                                    View Profile
                                </Link>
                            </div>
                        ) : (
                            <p className="text-sm text-center text-gray-500 dark:text-zinc-400">
                                Could not load profile information.
                            </p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}