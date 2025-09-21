// @/app/blog/[slug]/page.tsx

import { getPostBySlug } from "@/lib/data/blog-data";
import { getUserProfile } from "@/lib/data/user-data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import MovieInfoCard from "@/app/ui/blog/MovieInfoCard";
import ViewTracker from "@/app/ui/blog/ViewTracker";
import LikeButton from "@/app/ui/blog/LikeButton";
import CommentsSection from "@/app/ui/blog/CommentsSection"

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Fetch all data in one go with our new function
    const postData = await getPostBySlug(slug);
    const viewerData = await getUserProfile();

    if (!postData) {
        notFound();
    }

    const { likeCount, userHasLiked, comments, author, movie, ...post } = postData;

    return (
        <article className="min-h-screen bg-white dark:bg-black">
            <ViewTracker postSlug={post.slug} />

            {/* Hero Banner Section */}
            <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
                {post.banner_url ? (
                    <>
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={post.banner_url}
                                alt={`Banner for ${post.title}`}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        {/* Gradient overlay for better text visibility */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70 z-1"></div>
                        {/* Bottom fade effect - now to black in dark mode */}
                        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent z-2"></div>
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-800 dark:to-zinc-700 z-0"></div>
                )}

                {/* Title and author moved to bottom left */}
                <header className="absolute bottom-0 left-0 z-10 w-full p-6 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex items-center gap-4">
                            <Link href={`/profile/${author.username}`}>
                                <Image
                                    src={author.profile_pic_url || '/placeholder-user.jpg'}
                                    alt={author.display_name}
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 rounded-full object-cover border-2 border-white/30"
                                />
                            </Link>
                            <div className="text-left">
                                <p className="font-semibold text-white">
                                    <Link href={`/profile/${author.username}`} className="hover:underline">
                                        {author.display_name}
                                    </Link>
                                </p>
                                <p className="text-sm text-white/80">
                                    {new Date(post.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>
            </div>

            {/* Content separator */}
            <div className="relative max-w-4xl mx-auto px-4 md:px-6">
                <div className="flex justify-center -mt-6 mb-12">
                    <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>

                {/* Article Content */}
                <div
                    className="prose prose-lg dark:prose-invert max-w-none mb-8"
                    dangerouslySetInnerHTML={{ __html: post.content_html }}
                />

                {/* Engagement metrics */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                    <LikeButton postId={post.id} initialLikes={likeCount} userHasLiked={userHasLiked} />
                    <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                        {post.view_count.toLocaleString()} views
                    </p>
                </div>

                {/* Movie Info Card at the bottom */}
                {post.type === 'review' && post.movie_id && movie && (
                    <div className="mt-8">
                        <MovieInfoCard
                            movieApiId={post.movie_id}
                            initialMovieData={movie}
                        />
                    </div>
                )}

                {/* Comments Section */}
                <CommentsSection
                    postId={post.id}
                    comments={comments}
                    currentUserProfile={viewerData?.profile ?? null}
                />
            </div>
        </article>
    );
}