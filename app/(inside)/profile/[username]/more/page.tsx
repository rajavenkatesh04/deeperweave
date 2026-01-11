// app/profile/settings/page.tsx
import { redirect } from "next/navigation";
import Link from 'next/link';
import { getUserProfile } from '@/lib/data/user-data';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import SignOutButton from "@/app/ui/auth/SignOutButton";
import {
    EnvelopeIcon,
    CakeIcon,
    SparklesIcon,
    UserCircleIcon,
    BellAlertIcon,
    PowerIcon,
    TrashIcon,
    ShieldCheckIcon,
    CpuChipIcon,
    FingerPrintIcon
} from '@heroicons/react/24/outline';

// ============================================================================
// REUSABLE UI: INFO ROW
// ============================================================================
function InfoRow({
                     icon: Icon,
                     label,
                     value,
                     isMono = false
                 }: {
    icon: any;
    label: string;
    value: string | null | undefined;
    isMono?: boolean;
}) {
    return (
        <div className="flex items-start gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0">
            <div className="shrink-0 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-sm">
                <Icon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-1">
                    {label}
                </p>
                <p className={`text-sm text-zinc-900 dark:text-zinc-100 break-all ${isMono ? 'font-mono' : ''}`}>
                    {value || 'Not set'}
                </p>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN PAGE (SERVER COMPONENT)
// ============================================================================
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

                {/* 1. ACCOUNT CONTROLS */}
                <section className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden rounded-sm">
                    <div className="p-2">
                        <SignOutButton className="w-full group flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 text-left rounded-sm">
                            <PowerIcon className="w-5 h-5 text-zinc-400 group-hover:text-red-600 transition-colors" />
                            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-red-600 transition-colors">
                Log Out
            </span>
                        </SignOutButton>
                    </div>
                </section>

                <section className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden rounded-sm">
                    <div className="p-2">
                        <Link href={`/profile/settings`}>Settings</Link>
                    </div>

                    <div className="p-2">
                        <Link href={`/profile/saved`}>Saved</Link>
                    </div>
                </section>

                {/* 2. PERSONAL INFORMATION */}
                <section className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden rounded-sm">
                    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center gap-2">
                        <FingerPrintIcon className="w-4 h-4 text-zinc-500" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                            Personal Information
                        </h3>
                    </div>

                    <div className="flex flex-col">
                        <InfoRow icon={EnvelopeIcon} label="Email Address" value={user.email} />
                        <InfoRow icon={UserCircleIcon} label="Gender" value={profile?.gender} />
                        <InfoRow icon={CakeIcon} label="Birthday" value={formattedBirthday} />
                        <InfoRow icon={SparklesIcon} label="Plan" value={profile?.subscription_status || 'Free'} />
                    </div>
                </section>

                {/* 3. DANGER ZONE */}
                <section className="border border-red-200 dark:border-red-900/30 bg-white dark:bg-black overflow-hidden rounded-sm">
                    <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 flex items-center gap-2">
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