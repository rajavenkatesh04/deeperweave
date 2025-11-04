// app/profile/settings/page.tsx (or the correct path)
'use client'; // <-- MUST be at the top

// --- React/Next.js Imports ---
import {Suspense, useState, useEffect, useActionState} from "react"; // <-- Added useState, useEffect
import { redirect } from "next/navigation";
import Link from 'next/link';
import { useFormStatus } from 'react-dom';

// --- Action Imports ---
import { logout } from '@/lib/actions/auth-actions';
import { deleteMyAccount, type DeleteAccountState } from '@/lib/actions/profile-actions'; // <-- Import delete action

// --- Data/Definition Imports ---
import { UserProfile } from '@/lib/definitions';
import { createClient } from '@/utils/supabase/client'; // <-- Import CLIENT Supabase

// --- UI Imports ---
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
import LoadingSpinner from "@/app/ui/loading-spinner"; // <-- Import loading spinner

// --- TYPE DEFINITIONS ---
interface User {
    id: string;
    email: string;
}

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
        { href: '/profile/notifications', icon: BellAlertIcon, label: 'Follow requests' },
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
 * A helper component for the delete button's pending state.
 */
function DeleteButtonContent() {
    const { pending } = useFormStatus();
    return (
        <>
            {pending ? <LoadingSpinner className="mx-auto" /> : 'I understand, delete my account'}
        </>
    );
}

/**
 * CARD 3: Contains dangerous, irreversible actions like account deletion.
 * This is now a stateful component.
 */
function DangerZoneCard() {
    return (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
            <h3 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-500">Danger Zone</h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-zinc-400">
                Permanently delete your account and all of your content.
            </p>
            <div className="border-t border-red-500/30 pt-4 dark:border-red-500/20">
                <Link
                    href="/profile/delete-account" // <-- Links to the new page
                    className="group flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500 hover:text-white dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                >
                    <TrashIcon className="h-5 w-5" />
                    Delete My Account
                </Link>
            </div>
        </div>
    );
}


// --- MAIN PAGE COMPONENT (Client Component) ---
export default function ProfileAndSettingsPage() {
    const [userData, setUserData] = useState<UserProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- Client-side data fetching ---
    useEffect(() => {
        async function loadUserProfile() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                redirect("/auth/login");
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error || !profile) {
                console.error("Error fetching profile:", error);
                // Handle error, maybe redirect
                redirect("/auth/login");
                return;
            }

            setUserData({
                user: { id: user.id, email: user.email! }, // Make sure to handle null email if possible
                profile
            });
            setIsLoading(false);
        }

        loadUserProfile();
    }, []);

    // --- Loading State ---
    if (isLoading || !userData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner className="w-10 h-10" />
            </div>
        );
    }

    // --- Loaded State ---
    const { user, profile } = userData;

    return (
        <main>
            <div className="mx-auto space-y-8 py-6">
                <OptionsCard />

                {/* We no longer need Suspense because we wait for the fetch */}
                <AccountInfoCard user={user} profile={profile} />

                <DangerZoneCard />
            </div>
        </main>
    );
}