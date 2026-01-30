import { redirect } from "next/navigation";
import Link from 'next/link';
import { getUserProfile } from '@/lib/data/user-data';
import { geistSans } from "@/app/ui/fonts";
import SignOutButton from "@/app/ui/auth/SignOutButton";
import {
    Cog6ToothIcon,
    BookmarkIcon,
    DocumentTextIcon,
    ArrowRightIcon,
    PowerIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

// --- Minimal Link Component ---
function MenuLink({
                      href,
                      icon: Icon,
                      label,
                      description
                  }: {
    href: string,
    icon: any,
    label: string,
    description?: string
}) {
    return (
        <Link
            href={href}
            className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all active:scale-[0.99]"
        >
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{label}</p>
                    {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
                </div>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors -translate-x-1 group-hover:translate-x-0" />
        </Link>
    );
}

export default async function MoreMenuPage() {
    const userData = await getUserProfile();

    if (!userData || !userData.user) {
        redirect("/auth/login");
    }

    return (
        <div className={`w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative z-10 max-w-2xl mx-auto pt-8 px-4 md:px-6 ${geistSans.className}`}>

            {/* Header */}
            <div className="mb-10">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h2>
                <p className="text-sm text-zinc-500 mt-1">Manage your archive preferences.</p>
            </div>

            <div className="space-y-10">

                {/* Account Section */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-1">Account</h3>
                    <div className="space-y-3">
                        <MenuLink
                            href="/profile/settings"
                            icon={Cog6ToothIcon}
                            label="Preferences"
                            description="Profile details, visibility, and themes."
                        />
                        <MenuLink
                            href="/profile/saved"
                            icon={BookmarkIcon}
                            label="Saved Collections"
                            description="Your bookmarked movies and lists."
                        />
                    </div>
                </section>

                {/* Legal Section */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-1">Legal & Support</h3>
                    <div className="space-y-3">
                        <MenuLink
                            href="/policies/privacy"
                            icon={ShieldCheckIcon}
                            label="Privacy Policy"
                        />
                        <MenuLink
                            href="/policies/terms"
                            icon={DocumentTextIcon}
                            label="Terms of Service"
                        />
                    </div>
                </section>

                {/* Session Section */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-1">Session</h3>
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Current Session</p>
                                <p className="text-xs text-zinc-500 mt-0.5">Logged in as <span className="font-mono text-zinc-700 dark:text-zinc-300">{userData.user.email}</span></p>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-full">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide pr-1">Active</span>
                            </div>
                        </div>

                        <SignOutButton className="w-full flex items-center justify-center gap-2 h-11 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-900 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-sm">
                            <PowerIcon className="w-4 h-4" />
                            Sign Out
                        </SignOutButton>
                    </div>
                </section>
            </div>
        </div>
    );
}