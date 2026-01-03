// app/ui/notifications/NotificationItem.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import RequestActions from '@/app/(inside)/profile/notifications/RequestActions';
import { HeartIcon, ChatBubbleLeftIcon, UserPlusIcon } from '@heroicons/react/24/solid';

type NotificationType = 'FOLLOW_REQUEST' | 'LIKE' | 'COMMENT' | 'SYSTEM';

interface NotificationProps {
    type: NotificationType;
    actor: {
        id: string; // Ensure your data passing includes ID here
        username: string;
        profile_pic_url: string | undefined;
        display_name: string | undefined;
    };
    payload?: any;
    timestamp: string;
}

export default function NotificationItem({ type, actor, payload, timestamp }: NotificationProps) {
    return (
        <div className="group flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">

            {/* 1. Avatar (Sharp & Clean) */}
            <Link href={`/profile/${actor.username}`} className="shrink-0 relative">
                <div className="w-10 h-10 md:w-12 md:h-12 relative bg-zinc-200 dark:bg-zinc-800 shadow-sm transition-transform group-hover:scale-105">
                    <Image
                        src={actor.profile_pic_url || '/placeholder-user.jpg'}
                        alt={actor.username}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 border border-black/5 dark:border-white/10 pointer-events-none" />
                </div>

                {/* Tiny Badge */}
                <div className="absolute -bottom-1 -right-1 p-0.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm z-10">
                    {type === 'LIKE' && <HeartIcon className="w-2.5 h-2.5 text-red-600" />}
                    {type === 'COMMENT' && <ChatBubbleLeftIcon className="w-2.5 h-2.5 text-blue-600" />}
                    {type === 'FOLLOW_REQUEST' && <UserPlusIcon className="w-2.5 h-2.5 text-zinc-900 dark:text-zinc-100" />}
                </div>
            </Link>

            {/* 2. Content (Expanded Space) */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="text-sm leading-tight truncate">
                    <Link href={`/profile/${actor.username}`} className="font-bold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4 decoration-zinc-400">
                        {actor.display_name || actor.username}
                    </Link>
                </div>

                <div className="text-sm mt-0.5 text-zinc-600 dark:text-zinc-400 leading-tight truncate">
                    {type === 'FOLLOW_REQUEST' && <span>requested to follow.</span>}
                    {type === 'LIKE' && <span>liked your post.</span>}
                    {type === 'COMMENT' && (
                        <span>
                            commented: <span className="text-zinc-900 dark:text-zinc-200 italic">"{payload?.comment_preview}"</span>
                        </span>
                    )}
                </div>

                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-1.5 font-medium">
                    {new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
            </div>

            {/* 3. Action Area (Compact) */}
            <div className="shrink-0 self-center pl-2">
                {type === 'FOLLOW_REQUEST' ? (
                    <RequestActions requesterId={actor.id} />
                ) : (type === 'LIKE' || type === 'COMMENT') && payload?.post_thumbnail ? (
                    <Link href={`/post/${payload.post_id}`} className="block relative w-9 h-9 md:w-10 md:h-10 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
                        <Image
                            src={payload.post_thumbnail}
                            alt="Post"
                            fill
                            className="object-cover"
                        />
                    </Link>
                ) : null}
            </div>
        </div>
    );
}