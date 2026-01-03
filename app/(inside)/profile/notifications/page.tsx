import { getFollowRequests, getUserProfile } from '@/lib/data/user-data';
import NotificationItem from '@/app/ui/notifications/NotificationItem';
import { redirect } from 'next/navigation';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import Link from 'next/link';
import { ChevronLeftIcon, BellIcon } from '@heroicons/react/24/outline';

export default async function NotificationsPage() {
    // 1. Get current User
    const userSession = await getUserProfile();
    if (!userSession?.user) { redirect('/auth/login'); }

    // 2. Fetch Requests
    const followRequests = await getFollowRequests(userSession.user.id);

    // 3. Transform to Notification Format
    const notifications = followRequests.map((req) => ({
        id: req.follower_id,
        type: 'FOLLOW_REQUEST' as const,
        actor: {
            id: req.follower_id,
            username: req.profiles.username,
            display_name: req.profiles.display_name,
            profile_pic_url: req.profiles.profile_pic_url,
        },
        timestamp: req.created_at,
        payload: null
    }));

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 pb-20">

            {/* 1. STICKY TOP NAV */}
            <div className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-6 h-14 flex items-center">
                    <Link
                        href="/profile"
                        className="group flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                        <ChevronLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Profile
                    </Link>
                </div>
            </div>

            {/* 2. MATCHED HEADER */}
            <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-8 md:py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className={`${PlayWriteNewZealandFont.className} text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-2`}>
                        Notifications
                    </h1>
                    {/*<p className="text-sm font-mono text-zinc-500 uppercase tracking-wide">*/}
                    {/*    User_ID: {userSession.user.id.slice(0, 8)}...*/}
                    {/*</p>*/}
                </div>
            </header>

            {/* 3. LIST CONTENT */}
            <main className="max-w-4xl mx-auto px-6 mt-8 md:mt-12">

                {/* Section Meta */}
                <div className="flex items-center justify-between mb-6 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                        Follow Requests
                    </h2>
                    <span className="text-[10px] font-mono text-zinc-400">
                        {notifications.length} Pending
                    </span>
                </div>

                <div className="flex flex-col">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">
                            <div className="w-12 h-12 flex items-center justify-center mb-4 text-zinc-300 dark:text-zinc-700">
                                <BellIcon className="w-8 h-8 stroke-1" />
                            </div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                You have no new notifications.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            {notifications.map((notif) => (
                                <NotificationItem
                                    key={notif.id}
                                    {...notif}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Technical Footer */}
                <div className="mt-12 text-center">
                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.2em] opacity-50">
                        End of Activity Log
                    </p>
                </div>
            </main>
        </div>
    );
}