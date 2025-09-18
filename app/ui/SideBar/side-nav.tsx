import Link from 'next/link';
import NavLinks from '@/app/ui/SideBar/nav-links';
import UserProfile from '@/app/ui/SideBar/user-profile';
import { getUserProfile } from '@/lib/data';

export default async function SideNav() {
    // Fetch the user and profile data on the server
    const userData = await getUserProfile();

    const user = {
        profile: userData?.profile ?? null,
        email: userData?.user?.email,
    };

    return (
        <div className="flex h-full flex-col bg-gray-50 px-3 py-4 dark:bg-zinc-900 md:px-2">
            <Link
                className="mb-2 flex h-16 items-end justify-start rounded-md bg-gradient-to-r from-red-400 to-pink-700 p-4 md:h-20 lg:h-40"
                href="/public"
            >
                <div className="w-24 text-white md:w-32 lg:w-40">
                    {/* Replace with your Logo Component */}
                    <p className="text-xl font-bold md:text-2xl">Liv</p>
                </div>
            </Link>

            {/* --- Desktop Layout (md and above) --- */}
            <div className="hidden grow flex-col justify-between md:flex">
                <NavLinks />
                <div className="border-t border-gray-200 pt-2 dark:border-zinc-800">
                    <UserProfile user={user} />
                </div>
            </div>

            {/* --- Mobile Layout --- */}
            <div className="flex flex-col md:hidden">
                {/* Navigation links section - takes most space */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <NavLinks />
                </div>

                {/* User profile at bottom - compact */}
                <div className="mt-4 border-t border-gray-200 pt-2 dark:border-zinc-800 flex-shrink-0">
                    <UserProfile user={user} />
                </div>
            </div>
        </div>
    );
}