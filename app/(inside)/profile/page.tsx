// app/dashboard/profile/page.tsx

import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserProfile } from '@/lib/data';
import {
    PencilSquareIcon,
    EnvelopeIcon,
    CakeIcon,
    SparklesIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import { ProfileHeaderSkeleton, ProfileFormSkeleton } from '@/app/ui/skeletons';
import Image from "next/image";
import { UserProfile } from '@/lib/definitions';
import Breadcrumbs from "@/app/ui/Breadcrumbs";
import {ShareIcon} from "@heroicons/react/16/solid";

// Types for the component props
interface User {
    id: string;
    email: string;
}

interface UserProfileData {
    user: User;
    profile: UserProfile;
}

// --- Reusable Component for Profile Details ---
function ProfileDetailItem({
                               icon: Icon,
                               label,
                               value
                           }: {
    icon: React.ElementType;
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div className="flex items-center p-4 sm:p-5">
            <div className="flex-shrink-0">
                <Icon className="h-6 w-6 text-gray-500 dark:text-zinc-500" />
            </div>
            <div className="ml-4 flex-grow">
                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{label}</p>
                <p className="wrap-anywhere text-base text-gray-900 dark:text-zinc-200">{value || 'Not specified'}</p>
            </div>
        </div>
    );
}

// --- REDESIGNED PROFILE HEADER (CORRECTED) ---
function ProfileHeader({ profile }: { profile: UserProfile }) {
    return (
        <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-gray-50/50 to-white shadow-lg ring-1 ring-black/5 dark:from-zinc-900 dark:via-zinc-800/50 dark:to-zinc-900 dark:ring-white/10">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]"></div>

            {/* Content */}
            <div className="relative p-6 md:p-8 lg:p-10">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center">

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col lg:items-center">
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-sm"></div>
                            <Image
                                className="relative h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-xl dark:ring-zinc-800 lg:h-32 lg:w-32"
                                src={profile?.profile_pic_url || '/placeholder-user.jpg'}
                                alt={profile?.display_name ? `${profile.display_name}'s profile picture` : 'Profile picture'}
                                width={128}
                                height={128}
                            />
                            {/* Online indicator */}
                            {/*<div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-500 dark:border-zinc-800"></div>*/}
                        </div>

                        {/* Username badge - mobile/tablet only */}
                        <div className="lg:hidden">
                            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
                                @{profile?.username || 'no_username'}
                            </span>
                        </div>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <div className="space-y-3">
                            {/* Name */}
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 md:text-4xl lg:text-5xl">
                                {profile?.display_name || 'Anonymous User'}
                            </h1>

                            {/* Bio */}
                            {profile?.bio && (
                                <p className="text-lg text-gray-600 dark:text-zinc-400 md:text-xl">
                                    {profile.bio}
                                </p>
                            )}

                            {/* Username - desktop only */}
                            <div className="hidden lg:block">
                                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
                                    <span className="h-2 w-2 rounded-full bg-gray-400 dark:bg-zinc-500"></span>
                                    @{profile?.username || 'no_username'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                        <Link
                            href="/profile/edit"
                            className="group relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gray-900 px-6 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:bg-white dark:text-gray-900"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:from-gray-100 dark:to-white"></div>
                            <PencilSquareIcon className="relative h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                            <span className="relative">Edit Profile</span>
                        </Link>

                        <button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600">
                            <ShareIcon className="h-5 w-5" />
                            <span>Share</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


// --- PROFILE CARD (Unchanged) ---
function ProfileCard({ user, profile }: { user: User; profile: UserProfile }) {
    const formattedBirthday = profile?.date_of_birth
        ? new Date(profile.date_of_birth).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : null;

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-zinc-100">Account Information</h3>
            <div className="divide-y divide-gray-200 border-t border-gray-200 pt-4 dark:divide-zinc-800 dark:border-zinc-800">
                <ProfileDetailItem icon={EnvelopeIcon} label="Email Address" value={user.email} />
                <ProfileDetailItem icon={UserCircleIcon} label="Gender" value={profile?.gender} />
                <ProfileDetailItem icon={CakeIcon} label="Birthday" value={formattedBirthday} />
                <ProfileDetailItem icon={SparklesIcon} label="Subscription Plan" value={profile?.subscription_status || 'Free'} />
            </div>
        </div>
    );
}

// --- MAIN PAGE (Server Component) ---
export default async function ProfilePage() {
    const userData = await getUserProfile();

    if (!userData) {
        redirect("/auth/login");
    }

    const { user, profile } = userData as UserProfileData;

    return (
        <main>

            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Profile', href: '/profile' },
                    { label: 'Home', href: '/profile/', active: true },
                ]}
            />


            <div className="space-y-8 mt-6">
                <Suspense fallback={<ProfileHeaderSkeleton />}>
                    <ProfileHeader profile={profile} />
                </Suspense>

                <Suspense fallback={<ProfileFormSkeleton />}>
                    <ProfileCard user={user} profile={profile} />
                </Suspense>
            </div>
        </main>
    );
}