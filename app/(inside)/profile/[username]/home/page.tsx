// app/dashboard/profile/page.tsx

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUserProfile } from '@/lib/data/user-data';
import {
    EnvelopeIcon,
    CakeIcon,
    SparklesIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import { ProfileFormSkeleton } from '@/app/ui/skeletons';
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
                <p className="wrap-anywhere text-base text-gray-900 dark:text-zinc-200">{value || 'Not specified'}</p>
            </div>
        </div>
    );
}

// --- PROFILE CARD  ---
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
                <Suspense fallback={<ProfileFormSkeleton />}>
                    <ProfileCard user={user} profile={profile} />
                </Suspense>
            </div>
        </main>
    );
}