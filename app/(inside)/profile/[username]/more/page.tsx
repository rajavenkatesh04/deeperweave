import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { getUserProfile } from '@/lib/data/user-data';
import { logout } from '@/lib/actions/auth-actions';
import {
    EnvelopeIcon,
    CakeIcon,
    SparklesIcon,
    UserCircleIcon,
    BellAlertIcon,
    Cog6ToothIcon,
    PowerIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { UserProfile } from '@/lib/definitions';

// --- TYPE DEFINITIONS ---
interface User {
    id: string;
    email: string;
}

// This interface helps ensure the data from getUserProfile has the expected shape.
interface UserProfileData {
    user: User;
    profile: UserProfile;
}


// --- REUSABLE UI COMPONENTS ---

/**
 * A reusable component to display a single detail item with an icon, label, and value.
 */
function ProfileDetailItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined; }) {
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

/**
 * CARD 1: Displays the user's account information.
 */
function AccountInfoCard({ user, profile }: { user: User; profile: UserProfile }) {
    const formattedBirthday = profile?.date_of_birth
        ? new Date(profile.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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

/**
 * CARD 2: Provides navigation links and a sign-out button.
 */
function OptionsCard() {
    const navLinks = [
        { href: '/profile/notifications', icon: BellAlertIcon, label: 'Notifications' },
        { href: '/profile/settings', icon: Cog6ToothIcon, label: 'Settings' },
    ];
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
            {navLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="group flex w-full items-center gap-4 rounded-lg p-3 text-left text-sm font-semibold text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                    <link.icon className="h-6 w-6 text-zinc-400 transition-colors group-hover:text-indigo-400" />
                    <span>{link.label}</span>
                </Link>
            ))}
            <form action={logout} className="w-full">
                <button
                    type="submit"
                    className="group flex w-full items-center gap-4 rounded-lg p-3 text-left text-sm font-semibold text-zinc-600 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-500 dark:text-zinc-300 dark:hover:bg-red-900/50 dark:hover:text-red-400"
                >
                    <PowerIcon className="h-6 w-6 text-zinc-400 transition-colors group-hover:text-red-400" />
                    <span>Sign Out</span>
                </button>
            </form>
        </div>
    );
}

/**
 * CARD 3: Contains dangerous, irreversible actions like account deletion.
 */
function DangerZoneCard() {
    return (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
            <h3 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-500">Danger Zone</h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-zinc-400">
                This action is irreversible. Please be certain before proceeding.
            </p>
            <div className="border-t border-red-500/30 pt-4 dark:border-red-500/20">
                <button
                    type="button" // This button does not have functionality yet
                    className="group flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500 hover:text-white dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                >
                    <TrashIcon className="h-5 w-5" />
                    Delete My Account
                </button>
            </div>
        </div>
    );
}


// --- MAIN PAGE COMPONENT (Server Component) ---
export default async function ProfileAndSettingsPage() {
    // Fetches user data on the server.
    const userData = await getUserProfile();

    // If no user is found, redirect to the login page.
    if (!userData) {
        redirect("/auth/login");
    }

    // Destructure user and profile from the fetched data.
    const { user, profile } = userData as UserProfileData;

    return (
        <main>
            <div className="mx-auto space-y-8 py-6">
                <OptionsCard />

                {/* The AccountInfoCard depends on fetched data, so it's wrapped in Suspense. */}
                <Suspense fallback="loading...">
                    <AccountInfoCard user={user} profile={profile} />
                </Suspense>

                {/* These cards contain static links and actions, so they can be rendered directly. */}

                <DangerZoneCard />
            </div>
        </main>
    );
}
