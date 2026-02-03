'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CalendarIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { getProfileCardData } from '@/lib/actions/profile-actions';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { UserProfile } from '@/lib/definitions';

type ProfileData = {
    profile: UserProfile;
    followerCount: number;
    followingCount: number;
};

type BaseUser = {
    id: string;
    username: string;
    profile_pic_url?: string | null;
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
        async function fetchData() {
            setIsLoading(true);
            try {
                const result = await getProfileCardData(user.username);
                if (result.profile) {
                    setData(result as ProfileData);
                }
            } catch (error) {
                console.error("Failed to fetch profile card data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [user.username]);

    const memberSince = data?.profile
        ? new Date(data.profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        : null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl max-w-sm w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>

                    {/* Banner Image */}
                    <div className="relative h-24 w-full bg-zinc-100 dark:bg-zinc-900">
                        {user.profile_pic_url && (
                            <Image
                                src={user.profile_pic_url}
                                alt="Banner"
                                fill
                                className="object-cover opacity-60 blur-xl scale-110"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-zinc-950/80" />
                    </div>

                    <div className="px-6 pb-6 -mt-10 relative z-10">
                        {/* Avatar */}
                        <div className="relative inline-block">
                            <div className="h-20 w-20 rounded-full p-1 bg-white dark:bg-zinc-950 shadow-lg">
                                <Image
                                    src={user.profile_pic_url || '/default-avatar.png'}
                                    alt={user.username}
                                    width={72}
                                    height={72}
                                    className="rounded-full object-cover w-full h-full bg-zinc-100 dark:bg-zinc-900"
                                />
                            </div>
                        </div>

                        {/* Name & Bio */}
                        <div className="mt-3">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white truncate">
                                {data?.profile.display_name || user.username}
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                @{user.username}
                            </p>

                            {isLoading ? (
                                <div className="py-6 flex justify-center"><LoadingSpinner /></div>
                            ) : data ? (
                                <div className="mt-4 space-y-5">
                                    {/* Bio */}
                                    {data.profile.bio ? (
                                        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                            {data.profile.bio}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-zinc-400 italic">No bio available.</p>
                                    )}

                                    {/* Stats Row */}
                                    <div className="flex items-center gap-6 border-y border-zinc-100 dark:border-zinc-800 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg text-zinc-900 dark:text-white leading-none">
                                                {data.followerCount}
                                            </span>
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mt-1">
                                                Followers
                                            </span>
                                        </div>
                                        <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg text-zinc-900 dark:text-white leading-none">
                                                {data.followingCount}
                                            </span>
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mt-1">
                                                Following
                                            </span>
                                        </div>
                                    </div>

                                    {/* Metadata Footer */}
                                    <div className="flex items-center justify-between pt-1">
                                        <div className="space-y-1.5">
                                            {data.profile.country && (
                                                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                    <MapPinIcon className="w-3.5 h-3.5" />
                                                    {data.profile.country}
                                                </div>
                                            )}
                                            {memberSince && (
                                                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                    <CalendarIcon className="w-3.5 h-3.5" />
                                                    Joined {memberSince}
                                                </div>
                                            )}
                                        </div>

                                        <Link
                                            href={`/profile/${user.username}`}
                                            onClick={onClose}
                                            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                                        >
                                            View Profile <ArrowRightIcon className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-4 text-sm text-zinc-500">Failed to load details.</p>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}