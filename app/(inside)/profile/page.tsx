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
import { LogoutButton } from './LogoutButton';
import { ProfileHeaderSkeleton, ProfileFormSkeleton } from '@/app/ui/skeletons';
import Image from "next/image";
import { UserProfile } from '@/lib/definitions';

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
                <p className="text-base text-gray-900 dark:text-zinc-200">{value || 'Not specified'}</p>
            </div>
        </div>
    );
}

// --- REDESIGNED PROFILE HEADER (CORRECTED) ---
function ProfileHeader({ profile }: { profile: UserProfile }) {
    const usernameStyle = 'bg-zinc-500/10 text-zinc-600 border border-zinc-500/20 dark:text-zinc-400';

    return (
        <div className="mb-10 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row">

                {/* === FIX APPLIED HERE === */}
                <div className="flex-shrink-0">
                    <Image
                        className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-zinc-900 shadow-md"
                        src={profile?.profile_pic_url || '/placeholder-user.jpg'}
                        alt={profile?.display_name ? `${profile.display_name}'s profile picture` : 'Profile picture'}
                        width={96}
                        height={96}
                    />
                </div>
                {/* === END OF FIX === */}

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">
                        {profile?.display_name || 'Anonymous User'}
                    </h1>
                    <span
                        className={`mt-2 inline-flex items-center rounded-lg px-4 py-1.5 text-sm font-medium tracking-wide transition-colors ${usernameStyle}`}
                    >
                        @{profile?.username || 'no_username'}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Link
                        href="/profile/edit"
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 md:w-auto"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                        Edit Profile
                    </Link>
                    <LogoutButton />
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