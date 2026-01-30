'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import RequestActions from '@/app/(inside)/profile/notifications/RequestActions';
import { markNotificationAsRead, dismissNotification } from '@/lib/actions/notification-actions';
import { HeartIcon, ChatBubbleLeftIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { geistSans } from '@/app/ui/fonts';

type NotificationType = 'FOLLOW_REQUEST' | 'LIKE' | 'COMMENT' | 'SYSTEM' | 'NEW_FOLLOWER' | 'new_follower';

interface NotificationProps {
    id: string;
    type: NotificationType;
    is_read: boolean;
    actor: {
        id: string;
        username: string;
        profile_pic_url: string | undefined;
        display_name: string | undefined;
    };
    payload?: any;
    timestamp: string;
}

export default function NotificationItem({ id, type, is_read, actor, payload, timestamp }: NotificationProps) {
    const router = useRouter();

    // Interaction Handler
    const handleInteraction = async () => {
        if (!is_read && type !== 'FOLLOW_REQUEST') {
            markNotificationAsRead(id);
        }
        if ((type === 'LIKE' || type === 'COMMENT') && payload?.slug) {
            router.push(`/blog/${payload.slug}`);
        }
    };

    // Helper: Determine Icon & Color based on type
    const getIcon = () => {
        switch (type) {
            case 'LIKE': return <HeartIcon className="w-3 h-3 text-white" />;
            case 'COMMENT': return <ChatBubbleLeftIcon className="w-3 h-3 text-white" />;
            case 'FOLLOW_REQUEST':
            case 'NEW_FOLLOWER':
            case 'new_follower': return <UserPlusIcon className="w-3 h-3 text-white" />;
            default: return null;
        }
    };

    const getBadgeColor = () => {
        switch (type) {
            case 'LIKE': return 'bg-red-500 border-red-500';
            case 'COMMENT': return 'bg-blue-500 border-blue-500';
            default: return 'bg-zinc-900 dark:bg-zinc-700 border-zinc-900 dark:border-zinc-700';
        }
    };

    return (
        <div
            onClick={handleInteraction}
            className={`
                group relative flex items-center justify-between p-4 mb-3
                bg-white dark:bg-zinc-950 border rounded-2xl transition-all duration-200 cursor-pointer
                ${is_read
                ? 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                : 'border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-900/10'
            }
                ${geistSans.className}
            `}
        >
            {/* LEFT SIDE: Avatar & Text */}
            <div className="flex items-center gap-4 flex-1 min-w-0">

                {/* Avatar with Badge */}
                <div className="relative shrink-0">
                    <div className="w-11 h-11 relative rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-800">
                        <Image
                            src={actor.profile_pic_url || '/placeholder-user.jpg'}
                            alt={actor.username}
                            fill
                            className="object-cover"
                        />
                    </div>
                    {/* Badge Indicator */}
                    <div className={`absolute -bottom-0.5 -right-0.5 p-1 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm flex items-center justify-center ${getBadgeColor()}`}>
                        {getIcon()}
                    </div>
                </div>

                {/* Text Content */}
                <div className="flex flex-col min-w-0">
                    <div className="text-sm text-zinc-900 dark:text-zinc-100 truncate pr-2">
                        <span className="font-bold mr-1.5">{actor.display_name || actor.username}</span>
                        <br/>
                        <span className="text-zinc-500 dark:text-zinc-400 font-normal">
                            {type === 'FOLLOW_REQUEST' && "requested to follow you."}
                            {type === 'LIKE' && "liked your post."}
                            {type === 'COMMENT' && "commented on your post."}
                            {(type === 'NEW_FOLLOWER' || type === 'new_follower') && "started following you."}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                        {/* Unread Dot */}
                        {!is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        )}
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium text-wrap">
                            {new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            {payload?.title && <span className="normal-case ml-1 opacity-75 border-l border-zinc-300 dark:border-zinc-700 pl-2">On &quot;{payload.title}&quot;</span>}
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Actions or Thumbnail */}
            <div className="flex items-center gap-3 pl-3 shrink-0">

                {/* 1. Content Thumbnail or Request Actions */}
                {type === 'FOLLOW_REQUEST' ? (
                    <div onClick={(e) => e.stopPropagation()}>
                        <RequestActions requesterId={actor.id} />
                    </div>
                ) : payload?.post_thumbnail ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm group-hover:border-zinc-300 transition-colors">
                        <Image
                            src={payload.post_thumbnail}
                            alt="Post"
                            fill
                            className="object-cover"
                        />
                    </div>
                ) : null}

                {/* 2. Dismiss Button (Standard 'More' style arrow/close) */}
                {type !== 'FOLLOW_REQUEST' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(id);
                        }}
                        className="p-1.5 text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all"
                        title="Dismiss"
                    >
                        <XMarkIcon className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                )}
            </div>
        </div>
    );
}