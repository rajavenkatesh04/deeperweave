import {redirect} from "next/navigation";
import Link from 'next/link';
import {getUserProfile} from '@/lib/data/user-data';
import {geistSans} from "@/app/ui/fonts";
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
                <div
                    className="p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                    <Icon className="w-5 h-5" strokeWidth={1.5}/>
                </div>
                <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{label}</p>
                    {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
                </div>
            </div>
            <ArrowRightIcon
                className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors -translate-x-1 group-hover:translate-x-0"/>
        </Link>
    );
}

export default async function MoreMenuPage() {
    const userData = await getUserProfile();

    if (!userData || !userData.user) {
        redirect("/auth/login");
    }

    return (
        <div
            className={`w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative z-10 max-w-2xl mx-auto pt-8 px-4 md:px-6 ${geistSans.className}`}>

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
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-1">Legal &
                        Support</h3>
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
                    <div
                        className="p-5 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl">

                        {/* Top Row: User Info & Minimal Status */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Current
                                        Session</p>
                                    {/* Minimalist Status Indicator */}
                                    <div className="flex items-center gap-1.5 ml-1">
                        <span className="relative flex h-1.5 w-1.5">
                            <span
                                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                                        <span
                                            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">Active</span>
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500 truncate">
                                    {userData.user.email}
                                </p>
                            </div>
                        </div>

                        {/* Action: Cleaner Full-Width Button */}
                        <SignOutButton
                            className=" w-full flex items-center justify-center gap-2 h-10 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-900 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-[0.98]">
                            <PowerIcon className="w-3.5 h-3.5"/>
                            Sign Out
                        </SignOutButton>
                    </div>
                </section>
            </div>
        </div>
    );
}