// @/app/blog/[slug]/page.tsx

import { getPostBySlug } from "@/lib/data/blog-data";
import { getUserProfile } from "@/lib/data/user-data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import MovieInfoCard from "@/app/ui/blog/MovieInfoCard";
import ViewTracker from "@/app/ui/blog/ViewTracker";
import LikeButton from "@/app/ui/blog/LikeButton";
import CommentsSection from "@/app/ui/blog/CommentsSection";
import parse from 'html-react-parser';

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
        <>
            <ViewTracker postSlug={post.slug} />

            {/* Hero Section with Banner */}
            <section className="relative overflow-hidden">
                {post.banner_url ? (
                    // Banner with overlay and content
                    <div className="relative h-[60vh] min-h-[400px] max-h-[600px]">
                        <Image
                            src={post.banner_url}
                            alt={`Banner for ${post.title}`}
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Content overlay */}
                        <div className="absolute inset-0 flex items-end">
                            <div className="max-w-4xl mx-auto px-4 pb-12 w-full">
                                <div className="text-white">
                                    {/* Category/Type Badge */}
                                    <div className="mb-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/20">
                                            {post.type === 'review' ? '🎬 Review' : '📝 Article'}
                                        </span>
                                    </div>

                                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
                                        {post.title}
                                    </h1>

                                    {/* Author info */}
                                    <div className="flex items-center gap-4">
                                        <Link href={`/profile/${author.username}`} className="group flex items-center gap-3 hover:scale-105 transition-transform">
                                            <div className="relative">
                                                <Image
                                                    src={author.profile_pic_url || '/placeholder-user.jpg'}
                                                    alt={author.display_name}
                                                    width={48}
                                                    height={48}
                                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white/50 group-hover:ring-white transition-all"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg group-hover:text-white/90 transition-colors">
                                                    {author.display_name}
                                                </p>
                                                <p className="text-sm text-white/70">
                                                    {new Date(post.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </Link>

                                        {/* View count */}
                                        <div className="hidden sm:flex items-center gap-2 text-white/70 text-sm ml-6">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <span>{post.view_count.toLocaleString()} views</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // No banner fallback with gradient background
                    <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
                        <div className="max-w-4xl mx-auto px-4 py-20">
                            <div className="text-center">
                                {/* Category/Type Badge */}
                                <div className="mb-6">
                                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        {post.type === 'review' ? '🎬 Review' : '📝 Article'}
                                    </span>
                                </div>

                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-8 leading-tight">
                                    {post.title}
                                </h1>

                                {/* Author info */}
                                <div className="flex items-center justify-center gap-4">
                                    <Link href={`/profile/${author.username}`} className="group flex items-center gap-3 hover:scale-105 transition-transform">
                                        <Image
                                            src={author.profile_pic_url || '/placeholder-user.jpg'}
                                            alt={author.display_name}
                                            width={56}
                                            height={56}
                                            className="h-14 w-14 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-300 dark:group-hover:ring-blue-600 transition-all"
                                        />
                                        <div className="text-left">
                                            <p className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                                                {author.display_name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(post.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 relative">
                {/* Movie Info Card for Reviews */}
                {post.type === 'review' && post.movie_id && movie && (
                    <div className="-mt-20 mb-12 relative z-10">
                        <MovieInfoCard
                            movieApiId={post.movie_id}
                            initialMovieData={movie}
                        />
                    </div>
                )}

                {/* Article Content */}
                <article className={`${post.type === 'review' && post.movie_id && movie ? '' : 'pt-12'} pb-12`}>
                    {/* Reading time and metadata */}
                    <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>5 min read</span>
                        </div>

                        <div className="sm:hidden flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{post.view_count.toLocaleString()} views</span>
                        </div>

                        <LikeButton postId={post.id} initialLikes={likeCount} userHasLiked={userHasLiked} />
                    </div>

                    {/* Blog Content */}
                    <div className="prose prose-lg dark:prose-invert mx-auto prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white">
                        <div dangerouslySetInnerHTML={{ __html: post.content_html }} />
                    </div>
                </article>

                {/* Comments Section */}
                <section className="border-t border-gray-200 dark:border-gray-800 pt-12">
                    <CommentsSection
                        postId={post.id}
                        comments={comments}
                        currentUserProfile={viewerData?.profile ?? null}
                    />
                </section>
            </main>
        </>
    );
}