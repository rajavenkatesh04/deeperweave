import Link from 'next/link';
import Image from 'next/image';
import { Post, UserProfile } from '@/lib/definitions';
import { EyeIcon } from '@heroicons/react/24/solid';

// The type for a post object coming from our simplified getPosts() function
type PostForFeed = Post & {
    author: UserProfile;
};

export default function PostCard({ post }: { post: PostForFeed }) {
    // ✨ FIX: Removed like and comment counts as they are no longer fetched in the main feed query.
    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900"
        >
            {post.banner_url && (
                <div className="relative h-48 w-full">
                    <Image
                        src={post.banner_url}
                        alt={`Banner for ${post.title}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            )}
            <div className="p-6">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">{post.title}</h2>
                <p className="mt-4 text-base text-gray-600 dark:text-zinc-400 line-clamp-3"
                   dangerouslySetInnerHTML={{ __html: post.content_html.replace(/<[^>]+>/g, '') }}
                />

                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-zinc-800">
                    {/* Author Info */}
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
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5"><EyeIcon className="h-4 w-4" /><span>{post.view_count}</span></div>
                    </div>
                </div>
            </div>
        </Link>
    );
}