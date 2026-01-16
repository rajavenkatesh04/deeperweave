import { redirect } from "next/navigation";
import Link from 'next/link';
import { getUserProfile } from '@/lib/data/user-data';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import SignOutButton from "@/app/ui/auth/SignOutButton";

import {
    PowerIcon,
    TrashIcon,
    ShieldCheckIcon,
    PencilSquareIcon,
    BookmarkIcon,
    ChartBarIcon, // Imported for Analytics
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import PersonalInformation from "@/app/ui/user/PersonalInformation";

// --- Helper Component for consistent look ---
function SettingsItem({
                          href,
                          icon: Icon,
                          title,
                          subtitle
                      }: {
    href: string,
    icon: any,
    title: string,
    subtitle: string
}) {
    return (
        <Link
            href={href}
            className="w-full group flex items-center justify-between px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-sm"
        >
            <div className="flex items-center gap-4">
                <Icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                        {title}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium">
                        {subtitle}
                    </span>
                </div>
            </div>
            {/* Subtle chevron for affordance */}
            <ChevronRightIcon className="w-4 h-4 text-zinc-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
        </Link>
    );
}

export default async function SettingsPage() {
    // 1. Fetch Data
    const userData = await getUserProfile();

    if (!userData || !userData.user) {
        redirect("/auth/login");
    }

    const { user, profile } = userData;

    // 2. Format Birthday
    const formattedBirthday = profile?.date_of_birth
        ? new Date(profile.date_of_birth).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : null;

    return (
        <main className="w-full bg-zinc-50 dark:bg-zinc-950 min-h-screen pb-20">
            {/* Header */}
            <div className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black py-10 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className={`${PlayWriteNewZealandFont.className} text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-3`}>
                        Settings
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Manage your account details and preferences.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">

                {/* 1. ACCOUNT ACTIONS */}
                <section className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden rounded-sm shadow-sm">
                    <div className="p-2 flex flex-col gap-1">

                        <SettingsItem
                            href="/profile/settings"
                            icon={PencilSquareIcon}
                            title="Edit Profile"
                            subtitle="Change your visibility, bio & preferences."
                        />

                        <SettingsItem
                            href="/profile/saved"
                            icon={BookmarkIcon}
                            title="Saved Collection"
                            subtitle="View your bookmarked movies and shows."
                        />


                        <div className="my-2 border-t border-zinc-100 dark:border-zinc-800 mx-4" />

                        <SignOutButton className="w-full group flex items-center gap-4 px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 text-left rounded-sm">
                            <PowerIcon className="w-5 h-5 text-zinc-400 group-hover:text-red-600 transition-colors" />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-red-600 transition-colors">
                                    Log Out
                                </span>
                                <span className="text-[11px] text-zinc-400 font-medium">
                                    Sign out of your session securely.
                                </span>
                            </div>
                        </SignOutButton>
                    </div>
                </section>

                {/* 2. PERSONAL INFORMATION */}
                <PersonalInformation
                    email={user.email || ''}
                    gender={profile?.gender}
                    birthday={formattedBirthday}
                    plan={profile?.subscription_status || 'Free'}
                />

                {/* 3. DANGER ZONE */}
                <section className="border border-red-100 dark:border-red-900/30 bg-white dark:bg-black overflow-hidden rounded-sm shadow-sm">
                    <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 flex items-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4 text-red-600" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                            Danger Zone
                        </h3>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Delete Account</h4>
                                <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                                    This will permanently remove your profile, posts, and all associated data. You cannot undo this action.
                                </p>
                            </div>
                            <Link
                                href="/profile/delete-account"
                                className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-black border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-sm"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Delete Account
                            </Link>
                        </div>
                    </div>
                </section>

            </div>
        </main>
    );
}