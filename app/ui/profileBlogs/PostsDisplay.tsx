'use client';

import { usePosts } from '@/hooks/api/use-posts';
import ProfileBlogCard from './ProfileBlogCard';
import Link from 'next/link';
import { PencilSquareIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import {PostCardSkeleton} from "@/app/ui/skeletons";
export default function PostsDisplay({
                                         username,
                                         isOwnProfile
                                     }: {
    username: string;
    isOwnProfile: boolean;
}) {
    // 1. USE THE HOOK
    const { data: posts, isLoading } = usePosts(username);

    // 2. LOADING STATE
    if (isLoading) {
        return (
            <div className="w-full max-w-4xl mx-auto pt-8 px-4 md:px-3 pb-20">

                {/* --- Header Skeleton --- */}
                <div className="flex items-center justify-between mb-6">
                    {/* Title Skeleton: "Posts (X)" */}
                    <div className="h-7 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />

                    {/* Button Skeleton: "New Post" */}
                    <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                </div>

                {/* --- Grid Skeleton --- */}
                {/* Matches: grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <PostCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    // 3. EMPTY STATE
    if (!posts || posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/20 max-w-4xl mx-auto mt-8 mx-4">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                    <ArchiveBoxXMarkIcon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No Posts Yet</h3>
                <p className="text-xs text-zinc-500 mt-1 mb-6 max-w-xs text-center">
                    {isOwnProfile
                        ? "Share your thoughts with the world. Write your first review or essay."
                        : `${username} hasn't published any posts.`}
                </p>
                {isOwnProfile && (
                    <Link
                        href="/blog/create"
                        className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 rounded-full text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                        <PencilSquareIcon className="w-4 h-4" /> Write Post
                    </Link>
                )}
            </div>
        );
    }

    // 4. DATA CONTENT
    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative z-10 max-w-4xl mx-auto pt-8 px-4 md:px-6">
            {/* --- Header Section --- */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Posts ({posts.length})
                </h2>

                {isOwnProfile && (
                    <Link
                        href="/blog/create"
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-xs font-bold transition-transform active:scale-95 hover:opacity-90"
                    >
                        <PencilSquareIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Write Post</span>
                    </Link>
                )}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post: any) => (
                    <ProfileBlogCard key={post.id} post={post} isOwner={isOwnProfile}/>
                ))}
            </div>
        </div>
    );
}