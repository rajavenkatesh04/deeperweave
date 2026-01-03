// app/profile/settings/page.tsx
'use client';

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { UserProfile } from '@/lib/definitions';
import { logout } from '@/lib/actions/auth-actions';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import {
    EnvelopeIcon,
    CakeIcon,
    SparklesIcon,
    UserCircleIcon,
    BellAlertIcon,
    Cog6ToothIcon,
    PowerIcon,
    TrashIcon,
    ShieldCheckIcon,
    CpuChipIcon,
    FingerPrintIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from "@/app/ui/loading-spinner";

// ============================================================================
// REUSABLE UI: TECHNICAL ROW
// ============================================================================
function TechnicalRow({
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
                    {value || 'N/A'}
                </p>
            </div>
        </div>
    );
}

// ============================================================================
// CARD 1: IDENTITY
// ============================================================================
function IdentityCard({
                          profile,
                          email
                      }: {
    profile: UserProfile;
    email: string;
}) {
    const formattedBirthday = profile?.date_of_birth
        ? new Date(profile.date_of_birth).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).toUpperCase()
        : null;

    return (
        <section className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center gap-2">
                <FingerPrintIcon className="w-4 h-4 text-zinc-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                    Identity Matrix
                </h3>
            </div>

            {/* Content Grid */}
            <div className="flex flex-col">
                <TechnicalRow icon={EnvelopeIcon} label="Email Protocol" value={email} isMono />
                <TechnicalRow icon={UserCircleIcon} label="Gender Param" value={profile.gender} />
                <TechnicalRow icon={CakeIcon} label="Inception Date" value={formattedBirthday} isMono />
                <TechnicalRow icon={SparklesIcon} label="Sub Level" value={profile.subscription_status || 'FREE TIER'} />
            </div>
        </section>
    );
}

// ============================================================================
// CARD 2: SYSTEM NAVIGATION
// ============================================================================
function SystemNavCard() {
    const links = [
        { href: '/profile/notifications', icon: BellAlertIcon, label: 'Incoming Signals' },
        { href: '/profile/settings', icon: Cog6ToothIcon, label: 'System Config' },
    ];

    return (
        <section className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center gap-2">
                <CpuChipIcon className="w-4 h-4 text-zinc-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                    System Controls
                </h3>
            </div>

            <div className="p-2 space-y-1">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="group flex items-center gap-3 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                    >
                        <link.icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                        <span className="text-sm font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
              {link.label}
            </span>
                    </Link>
                ))}

                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />

                <form action={logout}>
                    <button className="w-full group flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-900/30">
                        <PowerIcon className="w-5 h-5 text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                        <span className="text-sm font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400">
              LOGOUT
            </span>
                    </button>
                </form>
            </div>
        </section>
    );
}

// ============================================================================
// CARD 3: DANGER ZONE
// ============================================================================
function DangerZone() {
    return (
        <section className="border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/30 flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                    Critical Zone
                </h3>
            </div>

            <div className="p-6 flex flex-col items-start gap-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                    // WARNING: This action is irreversible. All data will be purged.
                </p>
                <Link
                    href="/profile/delete-account"
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                    <TrashIcon className="w-4 h-4" />
                    Delete Account
                </Link>
            </div>
        </section>
    );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function SettingsPage() {
    const [userData, setUserData] = useState<{ user: any; profile: UserProfile } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return redirect("/auth/login");

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) setUserData({ user, profile });
            setIsLoading(false);
        }

        loadData();
    }, []);

    if (isLoading || !userData) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <LoadingSpinner className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
                <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 animate-pulse">
                    Initializing...
                </p>
            </div>
        );
    }

    return (
        <main className="w-full bg-zinc-50 dark:bg-zinc-950 min-h-screen pb-20">
            {/* Header */}
            <div className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black py-8 md:py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className={`${PlayWriteNewZealandFont.className} text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-2`}>
                        Configuration
                    </h1>
                    <p className="text-sm font-mono text-zinc-500 uppercase tracking-wide">
                        User_ID: {userData.user.id.slice(0, 8)}...
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
                <SystemNavCard />
                <IdentityCard profile={userData.profile} email={userData.user.email} />
                <DangerZone />
            </div>
        </main>
    );
}