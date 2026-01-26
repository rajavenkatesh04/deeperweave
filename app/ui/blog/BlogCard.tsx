'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PostForFeed } from '@/lib/data/blog-data';
import { EyeIcon, HeartIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { PremiumBadge, NsfwBadge, SpoilerBadge } from '@/app/ui/blog/badges';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

export default function BlogCard({ post }: { post: PostForFeed }) {
    // ✨ FIX: Read directly from the new integer columns
    const likeCount = post.likes_count || 0;
    const commentCount = post.comments_count || 0;

    const plainTextContent = post.content_html?.replace(/<[^>]+>/g, '') || '';

    const dateObj = new Date(post.created_at);
    const dateStr = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group flex flex-col h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300"
        >
            {/* --- 1. MEDIA --- */}
            <div className="relative w-full aspect-[16/9] bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                {post.banner_url ? (
                    <Image
                        src={post.banner_url}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-all duration-500 group-hover:scale-105 filter grayscale-[0.5] group-hover:grayscale-0"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Clean Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {post.is_premium && <PremiumBadge />}
                    {post.is_nsfw && <NsfwBadge />}
                    {post.has_spoilers && <SpoilerBadge />}
                </div>
            </div>

            {/* --- 2. CONTENT --- */}
            <div className="flex flex-1 flex-col p-5">
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                        {dateStr}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <div className="relative w-5 h-5 rounded-full overflow-hidden bg-zinc-100">
                            <Image
                                src={post.author.profile_pic_url || '/placeholder-user.jpg'}
                                alt={post.author.display_name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {post.author.display_name}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <h2 className={`${PlayWriteNewZealandFont.className} text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
                    {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-6 flex-1">
                    {plainTextContent}
                </p>

                {/* --- 3. METRICS FOOTER --- */}
                <div className="pt-4 mt-auto border-t border-zinc-100 dark:border-zinc-900 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                        <HeartIcon className="w-4 h-4" />
                        <span>{likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" />
                        <span>{commentCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                        <EyeIcon className="w-4 h-4" />
                        <span>{post.view_count}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}