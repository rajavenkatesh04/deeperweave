import { redirect } from "next/navigation";
import Link from 'next/link';
import { getUserProfile } from '@/lib/data/user-data';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import SignOutButton from "@/app/ui/auth/SignOutButton";
import {
    PowerIcon,
    PencilSquareIcon,
    BookmarkIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

// --- Reusable Navigation Item ---
function MenuLink({
                      href,
                      icon: Icon,
                      title,
                      subtitle
                  }: {
    href: string,
    icon: any,
    title: string,
    subtitle?: string
}) {
    return (
        <Link
            href={href}
            className="group flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-200"
        >
            <div className="flex items-center gap-5">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-sm group-hover:bg-white dark:group-hover:bg-black border border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-800 transition-all">
                    <Icon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-wide uppercase">
                        {title}
                    </span>
                    {subtitle && (
                        <span className="text-xs text-zinc-500 font-medium mt-0.5">
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
        </Link>
    );
}

export default async function MoreMenuPage() {
    const userData = await getUserProfile();

    if (!userData || !userData.user) {
        redirect("/auth/login");
    }

    return (
        <main className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 pb-20">
            {/* Header */}
            <header className="max-w-3xl mx-auto py-6 px-6">
                <h1 className={`${PlayWriteNewZealandFont.className} text-3xl text-zinc-900 dark:text-zinc-100`}>
                    Menu
                </h1>
            </header>

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Navigation Group */}
                <section className="border-y border-zinc-200 dark:border-zinc-800">
                    <MenuLink
                        href="/profile/settings"
                        icon={PencilSquareIcon}
                        title="Account Settings"
                        subtitle="Personal info, privacy & preferences"
                    />
                    <MenuLink
                        href="/profile/saved"
                        icon={BookmarkIcon}
                        title="Saved Collection"
                        subtitle="Your bookmarks and lists"
                    />
                </section>

                {/* Footer Actions */}
                <div className="px-6 md:px-0">
                    <SignOutButton className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
                        <PowerIcon className="w-4 h-4 text-zinc-400 group-hover:text-red-600 transition-colors" />
                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 uppercase tracking-widest">
                            Log Out
                        </span>
                    </SignOutButton>
                </div>
            </div>
        </main>
    );
}