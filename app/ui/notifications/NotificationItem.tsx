'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import RequestActions from '@/app/(inside)/profile/notifications/RequestActions';
import { markNotificationAsRead, dismissNotification } from '@/lib/actions/notification-actions';
import { HeartIcon, ChatBubbleLeftIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/solid';

type NotificationType = 'FOLLOW_REQUEST' | 'LIKE' | 'COMMENT' | 'SYSTEM' | 'NEW_FOLLOWER' | 'new_follower';

interface NotificationProps {
    id: string; // The ID of the notification row
    type: NotificationType;
    is_read: boolean;
    actor: {
        id: string;
        username: string;
        profile_pic_url: string | undefined;
        display_name: string | undefined;
    };
    payload?: any; // Contains slug, post_thumbnail etc
    timestamp: string;
}

export default function NotificationItem({ id, type, is_read, actor, payload, timestamp }: NotificationProps) {
    const router = useRouter();

    // Handle clicking the main body (Navigate + Mark Read)
    const handleInteraction = async () => {
        if (!is_read && type !== 'FOLLOW_REQUEST') {
            // Fire and forget - don't await to keep nav snappy
            markNotificationAsRead(id);
        }

        // Navigate if it's content
        if ((type === 'LIKE' || type === 'COMMENT') && payload?.slug) {
            router.push(`/blog/${payload.slug}`);
        }
    };

    return (
        <div
            className={`group relative flex items-center gap-3 p-4 border-b border-zinc-100 dark:border-zinc-900 transition-all
                ${is_read ? 'bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900/50' : 'bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'}
            `}
        >
            {/* UNREAD INDICATOR DOT */}
            {!is_read && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            )}

            {/* CLICKABLE AREA (Covering most of the card) */}
            <div onClick={handleInteraction} className="flex-1 flex items-center gap-3 cursor-pointer min-w-0">

                {/* 1. Avatar */}
                <div className="shrink-0 relative">
                    <div className="w-10 h-10 md:w-12 md:h-12 relative bg-zinc-200 dark:bg-zinc-800 shadow-sm">
                        <Image
                            src={actor.profile_pic_url || '/placeholder-user.jpg'}
                            alt={actor.username}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 border border-black/5 dark:border-white/10 pointer-events-none" />
                    </div>
                    {/* Tiny Icon Badge */}
                    <div className="absolute -bottom-1 -right-1 p-0.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm z-10">
                        {type === 'LIKE' && <HeartIcon className="w-2.5 h-2.5 text-red-600" />}
                        {type === 'COMMENT' && <ChatBubbleLeftIcon className="w-2.5 h-2.5 text-blue-600" />}
                        {type === 'FOLLOW_REQUEST' && <UserPlusIcon className="w-2.5 h-2.5 text-zinc-900 dark:text-zinc-100" />}
                    </div>
                </div>

                {/* 2. Text Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="text-sm leading-tight truncate pr-8">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {actor.display_name || actor.username}
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-400 ml-1">
                            {type === 'FOLLOW_REQUEST' && "requested to follow."}
                            {type === 'LIKE' && "liked your post."}
                            {type === 'COMMENT' && "commented on your post."}
                            {(type === 'NEW_FOLLOWER' || type === 'new_follower') && "started following you."}
                        </span>
                    </div>

                    {/* Post Title Context */}
                    {payload?.title && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5 truncate italic">
                            "{payload.title}"
                        </p>
                    )}

                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1.5 font-medium">
                        {new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* 3. Right Side Actions (Thumbnail or Buttons) */}
            <div className="shrink-0 pl-2 flex items-center gap-3 z-20">
                {type === 'FOLLOW_REQUEST' ? (
                    <RequestActions requesterId={actor.id} />
                ) : payload?.post_thumbnail ? (
                    <div onClick={handleInteraction} className="cursor-pointer block relative w-10 h-10 md:w-12 md:h-12 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 transition-colors">
                        <Image
                            src={payload.post_thumbnail}
                            alt="Post"
                            fill
                            className="object-cover"
                        />
                    </div>
                ) : null}

                {/* DISMISS BUTTON (X) - Only for Activity, not requests */}
                {type !== 'FOLLOW_REQUEST' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent navigation
                            dismissNotification(id);
                        }}
                        className="p-1 text-zinc-300 hover:text-red-500 transition-colors"
                        title="Dismiss"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}