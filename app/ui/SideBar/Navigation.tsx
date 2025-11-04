import Link from 'next/link';
import Image from 'next/image';
import { getUserProfile } from '@/lib/data/user-data';
import DesktopNavLinks from '@/app/ui/SideBar/DesktopNavLinks';
import MobileNavLinks from '@/app/ui/SideBar/MobileNavLinks';
import UserProfile from "@/app/ui/SideBar/user-profile";

export default async function Navigation() {
    const userData = await getUserProfile();
    const profile = userData?.profile ?? null;

    return (
        <>
            {/* ====== DESKTOP SIDEBAR ====== */}
            {/* Visible only on screens md and larger */}
            <div className="hidden h-full flex-col bg-gray-50 px-3 py-4 dark:bg-zinc-900 md:flex md:w-20 lg:w-64">
                <Link
                    className="mb-4 flex h-16 items-end justify-start rounded-md bg-gradient-to-r from-red-500 to-red-800 p-4 md:h-20 lg:h-32"
                    href="/"
                >
                    <div className="w-24 text-white md:w-32 lg:w-40">
                        <p className="text-xl font-bold md:text-2xl">DeeperWeave</p>
                    </div>
                </Link>

                {/* Growable nav links section */}
                <div className="flex grow flex-col justify-between">
                    <DesktopNavLinks />

                    {/* User profile section at the bottom */}
                    <div className="border-t border-gray-200 pt-2 dark:border-zinc-800">
                        {/* We will reuse your existing UserProfile component here */}
                        <UserProfile user={{ profile, email: userData?.user?.email }} />
                    </div>
                </div>
            </div>

            {/* ====== MOBILE BOTTOM BAR ====== */}
            {/* Hidden on md and larger screens */}
            <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-gray-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 md:hidden">

                <MobileNavLinks />
                {/* For mobile, the profile is just another link icon */}
                <Link href={profile ? "/profile" : "/auth/login"} className="flex flex-col items-center justify-center gap-1 text-xs text-gray-600 dark:text-zinc-400">
                    <Image
                        src={profile?.profile_pic_url || '/placeholder-user.jpg'}
                        alt={'Profile'}
                        className="h-7 w-7 rounded-full object-cover"
                        width={28}
                        height={28}
                    />
                </Link>

            </div>
        </>
    );
}