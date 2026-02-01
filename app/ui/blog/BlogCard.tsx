'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PostForFeed } from '@/lib/data/blog-data';
import {
    Eye,
    Heart,
    MessageCircle,
    MoreHorizontal,
    Pen,
    Trash,
    User
} from 'lucide-react';
import { PremiumBadge, NsfwBadge, SpoilerBadge } from '@/app/ui/blog/BlogPostBadges';
import { deletePost } from '@/lib/actions/blog-actions';
import { Inter, DM_Serif_Display } from 'next/font/google';

/* ---------------- Fonts ---------------- */
const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
});

const dmSerif = DM_Serif_Display({
    subsets: ['latin'],
    weight: '400',
    display: 'swap',
});

/* ---------------- Owner Actions Dropdown ---------------- */

function ActionDropdown({ slug, postId }: { slug: string; postId: string; }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent card click

        if (!window.confirm('Delete this post permanently?')) return;

        setIsDeleting(true);
        const result = await deletePost(postId);

        if (!result.success) {
            alert(result.error);
            setIsDeleting(false);
        }
    };

    return (
        <div className="absolute top-3 right-3 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                aria-label="Post actions"
                className="p-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur text-zinc-600 dark:text-zinc-300 shadow-sm hover:shadow active:scale-95 transition"
            >
                <MoreHorizontal size={18} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-40 rounded-lg bg-white dark:bg-zinc-900 shadow-xl ring-1 ring-black/5 dark:ring-white/5 overflow-hidden z-20">
                        <Link
                            href={`/blog/${slug}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                            <Pen size={14} />
                            Edit
                        </Link>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <Trash size={14} />
                            {isDeleting ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

/* ---------------- Main Card Component ---------------- */

export default function BlogCard({
                                     post,
                                     isOwner = false,
                                 }: {
    post: PostForFeed;
    isOwner?: boolean;
}) {
    const plainTextContent = post.content_html?.replace(/<[^>]+>/g, '') || '';

    const dateStr = new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className={`${inter.className} group relative h-full rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden`}>

            {isOwner && <ActionDropdown slug={post.slug} postId={post.id} />}

            <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">

                {/* MEDIA */}
                <div className="relative aspect-[16/9] bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                    {post.banner_url ? (
                        <Image
                            src={post.banner_url}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-zinc-300 dark:text-zinc-700 text-sm">
                            No cover image
                        </div>
                    )}

                    {/* Badges Overlay */}
                    <div className="absolute top-3 left-3 flex gap-2 scale-90 origin-top-left">
                        {post.is_premium && <PremiumBadge />}
                        {post.is_nsfw && <NsfwBadge />}
                        {post.has_spoilers && <SpoilerBadge />}
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex flex-col flex-1 px-4 py-4"> {/* Reduced padding to 4 */}

                    {/* Header: Date & Author */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            {dateStr}
                        </span>

                        {/* Author Info Restored */}
                        <div className="flex items-center gap-2">
                            <div className="relative w-5 h-5 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                <Image
                                    src={post.author.profile_pic_url || '/placeholder-user.jpg'}
                                    alt={post.author.display_name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 line-clamp-1 max-w-[100px]">
                                {post.author.display_name}
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className={`${dmSerif.className} text-lg text-zinc-900 dark:text-zinc-100 leading-snug mb-2 group-hover:underline decoration-1 underline-offset-4 line-clamp-2`}>
                        {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-500 line-clamp-3 mb-4">
                        {plainTextContent}
                    </p>

                    {/* Footer: Metrics */}
                    <div className="mt-auto flex items-center gap-4 text-xs font-medium text-zinc-400 border-t border-zinc-100 dark:border-zinc-900 pt-3">
                        <div className="flex items-center gap-1.5 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                            <Heart size={14} />
                            {post.likes_count || 0}
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                            <MessageCircle size={14} />
                            {post.comments_count || 0}
                        </div>
                        <div className="ml-auto flex items-center gap-1.5">
                            <Eye size={14} />
                            {post.view_count.toLocaleString()}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}