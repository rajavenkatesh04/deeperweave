import { redirect } from "next/navigation";
import Link from 'next/link';
import { getUserProfile } from '@/lib/data/user-data';
import { geistSans } from "@/app/ui/fonts";
import SignOutButton from "@/app/ui/auth/SignOutButton";
import {
    PowerIcon,
    Cog6ToothIcon,
    BookmarkIcon,
    ArrowRightIcon,
    UserCircleIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import clsx from "clsx";

// --- Components ---

function MenuSectionLabel({ label }: { label: string }) {
    return (
        <div className="px-6 pb-2 mt-8 mb-2 flex items-center gap-2">
            <div className="h-px w-4 bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {label}
            </span>
        </div>
    );
}

function MenuLink({
                      href,
                      icon: Icon,
                      label,
                      index
                  }: {
    href: string,
    icon: any,
    label: string,
    index: string
}) {
    return (
        <Link
            href={href}
            className="group relative flex items-center justify-between px-6 py-5 bg-white dark:bg-black border-b border-zinc-100 dark:border-zinc-800 transition-all duration-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
            <div className="flex items-center gap-5">
                {/* Icon Container */}
                <div className="relative flex items-center justify-center w-10 h-10 border border-zinc-200 dark:border-zinc-800 rounded-sm bg-zinc-50 dark:bg-zinc-900 group-hover:border-zinc-900 dark:group-hover:border-zinc-100 transition-colors">
                    <Icon className="w-5 h-5 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" strokeWidth={1.5} />
                </div>

                {/* Text */}
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide group-hover:translate-x-1 transition-transform">
                        {label}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-[9px] font-mono text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 transition-colors">
                    {index}
                </span>
                <ArrowRightIcon className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
            </div>
        </Link>
    );
}

export default async function MoreMenuPage() {
    const userData = await getUserProfile();

    if (!userData || !userData.user) {
        redirect("/auth/login");
    }

    return (
        <main className={clsx(
            "min-h-screen w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20 relative",
            geistSans.className
        )}>
            {/* Global Noise Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0"
                 style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                 }}
            />

            <div className="relative z-10 max-w-2xl mx-auto pt-12 md:pt-20">

                {/* Header */}
                <header className="px-6 mb-12">
                    <h1 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-900 dark:text-white">
                        Archive <span className="font-bold">Settings</span>
                    </h1>
                </header>

                {/* Content Block */}
                <div className="border-t border-zinc-200 dark:border-zinc-800">

                    {/* Section: Profile */}
                    <MenuSectionLabel label="Personal" />
                    <div className="bg-white dark:bg-black border-y border-zinc-200 dark:border-zinc-800">
                        {/* Optional: Add Profile Edit link if needed here, matching index style */}
                        <MenuLink
                            href="/profile/settings"
                            icon={Cog6ToothIcon}
                            label="Account Preferences"
                            index="02"
                        />
                    </div>

                    {/* Section: Library */}
                    <MenuSectionLabel label="Library" />
                    <div className="bg-white dark:bg-black border-y border-zinc-200 dark:border-zinc-800">
                        <MenuLink
                            href="/profile/saved"
                            icon={BookmarkIcon}
                            label="Saved Collection"
                            index="03"
                        />
                        <MenuLink
                            href="/policies/privacy"
                            icon={DocumentTextIcon}
                            label="Privacy Policy"
                            index="04"
                        />
                    </div>

                    {/* Section: System */}
                    <MenuSectionLabel label="Session" />
                    <div className="px-6 py-4">
                        <SignOutButton className="w-full group relative flex items-center justify-center gap-3 h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-all rounded-sm">
                            <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

                            <PowerIcon className="w-4 h-4 relative z-10" />
                            <span className="text-sm font-bold uppercase tracking-widest relative z-10">
                                LogOut
                            </span>
                        </SignOutButton>
                        <div className="mt-4 text-center">
                            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                                Logged in as: {userData.user.email}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}