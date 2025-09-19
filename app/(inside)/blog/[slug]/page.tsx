import { getPostBySlug } from "@/lib/data/blog-data";
import { getUserProfile } from "@/lib/data/user-data";
import { notFound } from "next/navigation";
import { UserProfile } from "@/lib/definitions";
import Image from "next/image";
import Link from "next/link";
import MovieInfoCard from "@/app/ui/blog/MovieInfoCard";
import ViewTracker from "@/app/ui/blog/ViewTracker";
import LikeButton from "@/app/ui/blog/LikeButton";
import CommentsSection from "@/app/ui/blog/CommentsSection";

// The params object needs to be awaited in newer versions of Next.js
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const postData = await getPostBySlug(slug);
    const viewerData = await getUserProfile();

    if (!postData) {
        notFound();
    }

    const { likeCount, userHasLiked, comments, ...post } = postData;
    // We cast the author object to the full UserProfile type for type safety
    const author = post.author as UserProfile;

    return (
        <article className="max-w-4xl mx-auto py-12 px-4">
            {/* This client component calls the RPC to increment the view count */}
            <ViewTracker postSlug={post.slug} />

            <header className="mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">{post.title}</h1>
                <div className="mt-6 flex items-center justify-center gap-4">
                    <Link href={`/profile/${author.username}`}>
                        <Image src={author.profile_pic_url || '/placeholder-user.jpg'} alt={author.display_name} width={48} height={48} className="h-12 w-12 rounded-full object-cover"/>
                    </Link>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-zinc-100">
                            <Link href={`/profile/${author.username}`} className="hover:underline">{author.display_name}</Link>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">
                            {new Date(post.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}
                        </p>
                    </div>
                </div>
            </header>

            {post.banner_url && (
                <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
                    <Image
                        src={post.banner_url}
                        alt={`Banner for ${post.title}`}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            {post.type === 'review' && post.movie_id && (
                <MovieInfoCard
                    movieApiId={post.movie_id}
                    movieTitle={post.title} // Pass the title from the post as a fallback
                    moviePosterUrl={post.banner_url || ''}
                    movieReleaseDate={new Date(post.created_at).toLocaleDateString()}
                />
            )}

            <div
                className="prose prose-lg dark:prose-invert mx-auto"
                dangerouslySetInnerHTML={{ __html: post.content_html }}
            />

            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between text-gray-500 dark:text-zinc-400">
                <LikeButton postId={post.id} initialLikes={likeCount} userHasLiked={userHasLiked} />
                <p className="text-sm font-medium">{post.view_count.toLocaleString()} views</p>
            </div>

            <CommentsSection
                postId={post.id}
                comments={comments}
                currentUserProfile={viewerData?.profile ?? null}
            />
        </article>
    );
}