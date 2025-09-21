import {
    BellAlertIcon,
    Cog6ToothIcon,
    PowerIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { logout } from '@/lib/actions/auth-actions'; // Make sure this path is correct

export default function MoreOptionsPage() {
    // An array to hold the navigation links for easier mapping
    const navLinks = [
        { href: '/profile/notifications', icon: BellAlertIcon, label: 'Notifications' },
        { href: '/profile/settings', icon: Cog6ToothIcon, label: 'Settings' },
    ];

    return (
        <div className="flex items-center justify-cente ">
            <div className="w-full  rounded-md bg-zinc-900 p-2 shadow-2xl ring-1 ring-white/10">

                <nav className="flex flex-col space-y-2">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group flex w-full items-center gap-4 rounded-lg p-3 text-left text-sm font-semibold text-zinc-300 transition-colors duration-200 hover:bg-zinc-800 hover:text-white"
                            >
                                <Icon className="h-6 w-6 text-zinc-400 transition-colors group-hover:text-white" />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}

                    {/* Divider */}
                    <div className="pt-2">
                        <hr className="border-t border-zinc-800" />
                    </div>

                    {/* Sign Out Button */}
                    <form action={logout} className="w-full">
                        <button
                            type="submit"
                            className="group flex w-full items-center gap-4 rounded-lg p-3 text-left text-sm font-semibold text-zinc-300 transition-colors duration-200 hover:bg-red-900/50 hover:text-red-400"
                        >
                            <PowerIcon className="h-6 w-6 text-zinc-400 transition-colors group-hover:text-red-400" />
                            <span>Sign Out</span>
                        </button>
                    </form>
                </nav>
            </div>
        </div>
    );
}