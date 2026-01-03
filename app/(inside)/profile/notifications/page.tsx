import { getFollowRequests, getUserProfile } from '@/lib/data/user-data';
import { getNotifications } from '@/lib/data/notification-data';
import { markAllNotificationsAsRead } from '@/lib/actions/notification-actions';
import NotificationItem from '@/app/ui/notifications/NotificationItem';
import { redirect } from 'next/navigation';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import Link from 'next/link';
import { ChevronLeftIcon, BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default async function NotificationsPage() {
    const userSession = await getUserProfile();
    if (!userSession?.user) { redirect('/auth/login'); }
    const userId = userSession.user.id;

    // Fetch in parallel
    const [followRequests, dbNotifications] = await Promise.all([
        getFollowRequests(userId),
        getNotifications(userId)
    ]);

    // Transform Follow Requests
    const followNotifications = followRequests.map((req) => ({
        id: req.follower_id,
        type: 'FOLLOW_REQUEST' as const,
        actor: {
            id: req.follower_id,
            username: req.profiles.username,
            display_name: req.profiles.display_name,
            profile_pic_url: req.profiles.profile_pic_url || undefined,
        },
        is_read: false, // Follow requests are always "unread" until acted upon
        timestamp: req.created_at,
        payload: null
    }));

    // Transform Activity (Likes/Comments)
    const activityNotifications = dbNotifications.map((n) => ({
        id: n.id,
        type: n.type.toUpperCase() as 'LIKE' | 'COMMENT',
        actor: {
            id: n.actor_id,
            username: n.actor.username,
            display_name: n.actor.display_name,
            profile_pic_url: n.actor.profile_pic_url || undefined,
        },
        is_read: n.is_read, // ✨ Pass the read status
        timestamp: n.created_at,
        // ✨ Pass the REAL post data now
        payload: n.post ? {
            post_id: n.post.id,
            slug: n.post.slug,
            title: n.post.title,
            post_thumbnail: n.post.banner_url
        } : null
    }));

    // Merge & Sort
    const allNotifications = [...followNotifications, ...activityNotifications]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const unreadCount = allNotifications.filter(n => !n.is_read).length;

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 pb-20">
            {/* Nav */}
            <div className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Link href="/profile" className="group flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <ChevronLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Profile
                    </Link>

                    {/* Mark All Read Button */}
                    {unreadCount > 0 && (
                        <form action={async () => {
                            'use server';
                            await markAllNotificationsAsRead(userId);
                        }}>
                            <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
                                <CheckCircleIcon className="w-4 h-4" />
                                Mark All Read
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-8 md:py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className={`${PlayWriteNewZealandFont.className} text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-2`}>
                        Notifications
                    </h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 mt-8 md:mt-12">
                <div className="flex items-center justify-between mb-6 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Activity Log</h2>
                    <span className="text-[10px] font-mono text-zinc-400">{unreadCount} Unread</span>
                </div>

                <div className="flex flex-col">
                    {allNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">
                            <div className="w-12 h-12 flex items-center justify-center mb-4 text-zinc-300 dark:text-zinc-700">
                                <BellIcon className="w-8 h-8 stroke-1" />
                            </div>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No new notifications.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            {allNotifications.map((notif) => (
                                <NotificationItem key={notif.id} {...notif} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}