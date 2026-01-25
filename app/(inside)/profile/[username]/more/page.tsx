import { redirect } from "next/navigation";
import Link from 'next/link';
import { getUserProfile } from '@/lib/data/user-data';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import SignOutButton from "@/app/ui/auth/SignOutButton";

import {
    PowerIcon,
    TrashIcon,
    PencilSquareIcon,
    BookmarkIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import PersonalInformation from "@/app/ui/user/PersonalInformation";

// --- Minimal Sharp Settings Item ---
function SettingsItem({
                          href,
                          icon: Icon,
                          title
                      }: {
    href: string,
    icon: any,
    title: string
}) {
    return (
        <Link
            href={href}
            className="group flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-200"
        >
            <div className="flex items-center gap-4">
                <Icon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" strokeWidth={1.5} />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tracking-wide">
                    {title}
                </span>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
        </Link>
    );
}

export default async function SettingsPage() {
    const userData = await getUserProfile();

    if (!userData || !userData.user) {
        redirect("/auth/login");
    }

    const { user, profile } = userData;

    const formattedBirthday = profile?.date_of_birth
        ? new Date(profile.date_of_birth).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : null;

    return (
        <main className="min-h-screen w-full px-3 bg-zinc-50 dark:bg-zinc-950 pb-20">

            {/* Ultra-Compact Header */}
            <header className="max-w-3xl mx-auto py-4 px-6 sticky top-0 z-10">
                <h1 className={`${PlayWriteNewZealandFont.className} text-2xl md:text-2xl text-zinc-900 dark:text-zinc-100`}>
                    Settings
                </h1>
            </header>

            <div className="max-w-3xl mx-auto pt-8 px-0 sm:px-6 space-y-8">

                {/* 1. NAVIGATION BLOCK (Sharp Corners) */}
                <section className="border-y sm:border border-zinc-200 dark:border-zinc-800">
                    <SettingsItem
                        href="/profile/settings"
                        icon={PencilSquareIcon}
                        title="Account Settings"
                    />
                    <SettingsItem
                        href="/profile/saved"
                        icon={BookmarkIcon}
                        title="Saved Collection"
                    />
                </section>

                {/* 2. PERSONAL INFO (Sharp Container) */}
                <section className="bg-white dark:bg-black border-y sm:border border-zinc-200 dark:border-zinc-800 p-0">
                    {/* Note: Ensure your PersonalInformation component also uses sharp corners
                       or is wrapped cleanly here.
                    */}
                    <PersonalInformation
                        email={user.email || ''}
                        gender={profile?.gender}
                        birthday={formattedBirthday}
                        plan={profile?.subscription_status || 'Free'}
                    />
                </section>

                {/* 3. FOOTER ACTIONS */}
                <div className=" sm:px-0 space-y-6">
                    {/* Sharp Sign Out */}
                    <SignOutButton className="hover:text-red w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group">
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                            Log Out
                        </span>
                        <PowerIcon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                    </SignOutButton>

                    {/* Minimal Delete Link */}
                    <div className="flex justify-start">
                        <Link
                            href="/profile/delete-account"
                            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-red-600 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                            Delete Account
                        </Link>
                    </div>
                </div>

            </div>
        </main>
    );
}