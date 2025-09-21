import Link from 'next/link';
import Image from 'next/image';
import { PostForFeed } from '@/lib/data/blog-data';

export default function PostCard({ post }: { post: PostForFeed }) {
    // Extract counts, providing a fallback of 0
    const likeCount = post.likes[0]?.count || 0;
    const commentCount = post.comments[0]?.count || 0;

    // Safely strip HTML from content for the preview
    const plainTextContent = post.content_html?.replace(/<[^>]+>/g, '') || '';
    const previewText = plainTextContent.length > 150
        ? `${plainTextContent.substring(0, 150)}...`
        : plainTextContent;

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-lg shadow-lg transition-all duration-500 hover:shadow-xl hover:-translate-y-1 dark:bg-zinc-900/70 border border-white/30 dark:border-zinc-700/30">
            {/* Header with author info */}
            <div className="flex items-center p-3">
                <div className="relative h-10 w-10 mr-3">
                    <Image
                        src={post.author.profile_pic_url || '/placeholder-user.jpg'}
                        alt={post.author.display_name}
                        fill
                        sizes="40px"
                        className="rounded-full object-cover ring-2 ring-white/50 dark:ring-zinc-600/50"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-zinc-200 truncate">{post.author.display_name}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">@{post.author.username}</p>
                </div>

            </div>

            {/* Banner image with fade effect */}
            {post.banner_url && (
                <Link href={`/blog/${post.slug}`} className="block relative w-full aspect-[4/3] overflow-hidden">
                    <div className="relative w-full h-full overflow-hidden">
                        <Image
                            src={post.banner_url}
                            alt={`Banner for ${post.title}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Gradient overlay for text visibility */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-1"></div>
                        {/* Bottom fade effect */}
                        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white dark:from-black to-transparent z-2"></div>
                    </div>

                    {/* Title positioned at bottom with fade effect */}
                    <div className="absolute text-center bottom-0 left-0 z-10 w-full p-4">
                        <h2 className="text-lg font-bold text-white mb-1 line-clamp-2 drop-shadow-md">
                            {post.title}
                        </h2>
                    </div>
                </Link>
            )}

            {/* Post content preview */}
            <Link href={`/blog/${post.slug}`} className="block p-3 pt-0">
                {!post.banner_url && (
                    <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-2 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {post.title}
                    </h2>
                )}
            </Link>

            {/* Metrics with icons */}
            <div className="px-3 pb-2 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600 dark:text-zinc-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-semibold text-gray-800 dark:text-zinc-200">{likeCount}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-zinc-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="font-semibold text-gray-800 dark:text-zinc-200">{commentCount}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-zinc-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="font-semibold text-gray-800 dark:text-zinc-200">{post.view_count}</span>
                </div>
            </div>
            
        </div>
    );
}