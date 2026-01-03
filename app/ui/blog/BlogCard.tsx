'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PostForFeed } from '@/lib/data/blog-data';
import { EyeIcon, HeartIcon, ChatBubbleOvalLeftEllipsisIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { PremiumBadge, NsfwBadge, SpoilerBadge } from '@/app/ui/blog/badges';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

export default function BlogCard({ post }: { post: PostForFeed }) {
    const likeCount = post.likes[0]?.count || 0;
    const commentCount = post.comments[0]?.count || 0;
    const plainTextContent = post.content_html?.replace(/<[^>]+>/g, '') || '';

    // Technical Date Format: "2026.01.02"
    const dateObj = new Date(post.created_at);
    const dateStr = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`;

    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group flex flex-col h-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors duration-300 relative"
        >
            {/* --- 1. VISUAL RECORD (Image) --- */}
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">

                {/* Film Grain Texture */}
                <div className="absolute inset-0 opacity-20 z-10 pointer-events-none"
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />

                {post.banner_url ? (
                    <Image
                        src={post.banner_url}
                        alt={`Banner for ${post.title}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0  opacity-90"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center relative">
                        {/* Static Noise Fallback */}
                        <div className="absolute inset-0 opacity-50"
                             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                        />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 z-10">
                            No Signal
                        </span>
                    </div>
                )}

                {/* Badges Overlay (Sharp & Technical) */}
                <div className="absolute top-0 left-0 p-3 z-20 flex flex-wrap gap-2">
                    {post.is_premium && <PremiumBadge />}
                    {post.is_nsfw && <NsfwBadge />}
                    {post.has_spoilers && <SpoilerBadge />}
                </div>

                {/* Hover Interaction: View Arrow */}
                <div className="absolute top-0 right-0 p-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white dark:bg-black p-2 border border-zinc-900 dark:border-zinc-100 shadow-none">
                        <ArrowUpRightIcon className="w-4 h-4 text-black dark:text-white" />
                    </div>
                </div>
            </div>

            {/* --- 2. DATA ENTRY (Content) --- */}
            <div className="flex flex-1 flex-col p-5 md:p-6">

                {/* Header: Date & Tag */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800 border-dashed">
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">
                        {dateStr}
                    </span>

                </div>

                {/* Title */}
                <h2 className={`${PlayWriteNewZealandFont.className} text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-[1.1] mb-3 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors`}>
                    {post.title}
                </h2>

                {/* Excerpt */}
                <p className="flex-1 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed font-light mb-6">
                    {plainTextContent}
                </p>

                {/* --- 3. FOOTER (Swap Mechanic) --- */}
                {/* Fixed height container for smooth swapping */}
                <div className="relative h-10 w-full overflow-hidden mt-auto">

                    {/* STATE A: AUTHOR (Default) */}
                    <div className="absolute inset-0 flex items-center gap-3 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-full">
                        <div className="relative w-8 h-8 rounded-sm overflow-hidden border border-zinc-200 dark:border-zinc-800 grayscale group-hover:grayscale-0 transition-all">
                            <Image
                                src={post.author.profile_pic_url || '/placeholder-user.jpg'}
                                alt={post.author.display_name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                                {post.author.display_name}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 mt-1">
                                @{post.author.username}
                            </span>
                        </div>
                    </div>

                    {/* STATE B: METRICS (Hover) */}
                    <div className="absolute inset-0 flex items-center justify-between translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-y-0 bg-zinc-50 dark:bg-zinc-900 px-3 border border-zinc-200 dark:border-zinc-800">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">
                            Metrics
                        </span>
                        <div className="flex items-center gap-4 text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100">
                            <div className="flex items-center gap-1.5" title="Likes">
                                <HeartIcon className="h-3.5 w-3.5 text-zinc-400" />
                                <span>{likeCount}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Comments">
                                <ChatBubbleOvalLeftEllipsisIcon className="h-3.5 w-3.5 text-zinc-400" />
                                <span>{commentCount}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Views">
                                <EyeIcon className="h-3.5 w-3.5 text-zinc-400" />
                                <span>{post.view_count}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Link>
    );
}