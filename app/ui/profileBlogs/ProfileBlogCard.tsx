'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PostForFeed } from '@/lib/data/blog-data';
import {
    EyeIcon,
    HeartIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    EllipsisHorizontalIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
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

/* ---------------- Owner Actions ---------------- */

function ActionDropdown({
                            slug,
                            postId,
                        }: {
    slug: string;
    postId: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('Delete this post permanently?')) return;

        setIsDeleting(true);
        const result = await deletePost(postId);

        if (!result.success) {
            alert(result.error);
            setIsDeleting(false);
        }
    };

    return (
        <div
            className="
                absolute top-3 right-3 z-30
                opacity-100
                md:opacity-0 md:group-hover:opacity-100
                transition-opacity
            "
        >
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                aria-label="Post actions"
                className="
                    p-2 rounded-full
                    bg-white/90 dark:bg-zinc-900/90 backdrop-blur
                    text-zinc-600 dark:text-zinc-300
                    shadow-sm hover:shadow
                    active:scale-95 transition
                "
            >
                <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    <div
                        className="
                            absolute right-0 mt-2 w-44
                            rounded-xl bg-white dark:bg-zinc-900
                            shadow-xl ring-1 ring-black/5 dark:ring-white/5
                            overflow-hidden z-20
                        "
                    >
                        <Link
                            href={`/blog/${slug}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="
                                flex items-center gap-2 px-4 py-3 text-sm
                                text-zinc-700 dark:text-zinc-200
                                hover:bg-zinc-50 dark:hover:bg-zinc-800
                            "
                        >
                            <PencilIcon className="w-4 h-4" />
                            Edit
                        </Link>

                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="
                                flex w-full items-center gap-2 px-4 py-3 text-sm
                                text-red-600
                                hover:bg-red-50 dark:hover:bg-red-900/20
                            "
                        >
                            <TrashIcon className="w-4 h-4" />
                            {isDeleting ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

/* ---------------- Card ---------------- */

export default function ProfileBlogCard({
                                            post,
                                            isOwner,
                                        }: {
    post: PostForFeed;
    isOwner: boolean;
}) {
    const plainTextContent =
        post.content_html?.replace(/<[^>]+>/g, '') || '';

    const dateStr = new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div
            className={`${inter.className}
                group relative h-full rounded-2xl bg-white dark:bg-zinc-950
                border border-zinc-200/60 dark:border-zinc-800/60
                hover:shadow-lg hover:-translate-y-0.5
                transition-all duration-300 overflow-hidden`}
        >
            {isOwner && <ActionDropdown slug={post.slug} postId={post.id} />}

            <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
                {/* MEDIA */}
                <div className="relative aspect-[2/1] bg-zinc-100 dark:bg-zinc-900">
                    {post.banner_url ? (
                        <Image
                            src={post.banner_url}
                            alt={post.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-zinc-300 dark:text-zinc-700 text-sm">
                            No cover image
                        </div>
                    )}

                    <div className="absolute top-3 left-3 flex gap-2">
                        {post.is_premium && <PremiumBadge />}
                        {post.is_nsfw && <NsfwBadge />}
                        {post.has_spoilers && <SpoilerBadge />}
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex flex-col flex-1 px-5 py-4">
                    <span className="text-xs text-zinc-400 mb-2">
                        {dateStr}
                    </span>

                    <h2
                        className={`${dmSerif.className}
                            text-lg font-normal text-zinc-900 dark:text-zinc-100
                            leading-snug line-clamp-2 mb-2`}
                    >
                        {post.title}
                    </h2>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-5">
                        {plainTextContent}
                    </p>

                    {/* META */}
                    <div
                        className="
                            mt-auto flex items-center gap-4 text-xs text-zinc-500
                            border-t border-zinc-100 dark:border-zinc-800 pt-3
                        "
                    >
                        <div className="flex items-center gap-1">
                            <HeartIcon className="w-4 h-4" />
                            {post.likes_count || 0}
                        </div>
                        <div className="flex items-center gap-1">
                            <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" />
                            {post.comments_count || 0}
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" />
                            {post.view_count}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
