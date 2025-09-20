// @/app/ui/blog/PostCard.tsx

import Link from 'next/link';
import Image from 'next/image';
import { PostForFeed } from '@/lib/data/blog-data';
import { EyeIcon, HeartIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid';

export default function PostCard({ post }: { post: PostForFeed }) {
    // Extract counts, providing a fallback of 0
    const likeCount = post.likes[0]?.count || 0;
    const commentCount = post.comments[0]?.count || 0;

    // Safely strip HTML from content for the preview
    const plainTextContent = post.content_html?.replace(/<[^>]+>/g, '') || '';

    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900"
        >
            {post.banner_url && (
                <div className="relative h-48 w-full overflow-hidden">
                    <Image
                        src={post.banner_url}
                        alt={`Banner for ${post.title}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            )}
            <div className="flex flex-1 flex-col p-6">
                <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{post.title}</h2>
                    <p className="mt-3 text-base text-gray-600 dark:text-zinc-400 line-clamp-3">
                        {plainTextContent}
                    </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Image
                            src={post.author.profile_pic_url || '/placeholder-user.jpg'}
                            alt={post.author.display_name}
                            width={40} height={40}
                            className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-zinc-200">{post.author.display_name}</p>
                            <p className="text-xs text-gray-500 dark:text-zinc-500">@{post.author.username}</p>
                        </div>
                    </div>
                    {/* ✨ FIX: Added like and comment counts */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5" title={`${likeCount} likes`}><HeartIcon className="h-4 w-4" /><span>{likeCount}</span></div>
                        <div className="flex items-center gap-1.5" title={`${commentCount} comments`}><ChatBubbleOvalLeftEllipsisIcon className="h-4 w-4" /><span>{commentCount}</span></div>
                        <div className="flex items-center gap-1.5" title={`${post.view_count} views`}><EyeIcon className="h-4 w-4" /><span>{post.view_count}</span></div>
                    </div>
                </div>
            </div>
        </Link>
    );
}