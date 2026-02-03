import { getFollowRequests, getUserProfile } from '@/lib/data/user-data';
import { getNotifications } from '@/lib/data/notification-data';
import { markAllNotificationsAsRead } from '@/lib/actions/notification-actions';
import NotificationItem from '@/app/ui/notifications/NotificationItem';
import { redirect } from 'next/navigation';
import { geistSans } from "@/app/ui/fonts";
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
        is_read: false,
        timestamp: req.created_at,
        payload: null
    }));

    // Transform Activity
    const activityNotifications = dbNotifications.map((n) => ({
        id: n.id,
        type: n.type.toUpperCase() as 'LIKE' | 'COMMENT' | 'NEW_FOLLOWER',
        actor: {
            id: n.actor_id,
            username: n.actor.username,
            display_name: n.actor.display_name,
            profile_pic_url: n.actor.profile_pic_url || undefined,
        },
        is_read: n.is_read,
        timestamp: n.created_at,
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
        <div className={`w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative z-10 max-w-2xl mx-auto pt-8 px-4 md:px-6 ${geistSans.className}`}>

            {/* Header Section */}
            <div className="flex flex-col gap-6 mb-10">
                <Link href="/profile" className="self-start flex items-center gap-1.5 px-3 py-1.5 -ml-3 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                    <ChevronLeftIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Back
                </Link>

                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-light text-zinc-900 dark:text-zinc-100 tracking-tight">
                            Notifications
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            You have <span className="font-bold text-zinc-900 dark:text-zinc-100">{unreadCount}</span> unread updates.
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <form action={async () => {
                            'use server';
                            await markAllNotificationsAsRead(userId);
                        }}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-opacity">
                                <CheckCircleIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Mark Read</span>
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* List Section */}
            <div className="space-y-4">
                {allNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
                        <div className="w-12 h-12 flex items-center justify-center mb-3 text-zinc-300 dark:text-zinc-700 bg-white dark:bg-zinc-800 rounded-full shadow-sm">
                            <BellIcon className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">All caught up!</p>
                        <p className="text-xs text-zinc-500">Check back later for new activity.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {allNotifications.map((notif) => (
                            <NotificationItem key={notif.id} {...notif} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}