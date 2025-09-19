import { getPostBySlug } from "@/lib/data/blog-data";
import { getUserProfile } from "@/lib/data";
import { notFound } from "next/navigation";
import { UserProfile, CommentWithAuthor } from "@/lib/definitions";
import Image from "next/image";
import Link from "next/link";
import MovieInfoCard from "@/app/ui/blog/MovieInfoCard";
import ViewTracker from "@/app/ui/blog/ViewTracker";
import LikeButton from "@/app/ui/blog/LikeButton";
import CommentsSection from "@/app/ui/blog/CommentsSection";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    // Await params before using its properties
    const { slug } = await params;

    const postData = await getPostBySlug(slug);
    const viewerData = await getUserProfile();

    if (!postData) notFound();
    const { likeCount, userHasLiked, comments, ...post } = postData;
    const author = post.author as UserProfile;

    return (
        <article className="max-w-4xl mx-auto py-12 px-4">
            <ViewTracker postSlug={post.slug} />
            <header className="mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">{post.title}</h1>
                <div className="mt-6 flex items-center justify-center gap-4">
                    <Link href={`/profile/${author.username}`}>
                        <Image src={author.profile_pic_url || '/placeholder-user.jpg'} alt={author.display_name} width={48} height={48} className="h-12 w-12 rounded-full object-cover"/>
                    </Link>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-zinc-100"><Link href={`/profile/${author.username}`}>{author.display_name}</Link></p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{new Date(post.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                    </div>
                </div>
            </header>

            {post.banner_url && <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden shadow-lg"><Image src={post.banner_url} alt={`Banner for ${post.title}`} fill className="object-cover" priority/></div>}
            {post.type === 'review' && post.movie_id && <MovieInfoCard movieApiId={post.movie_id} movieTitle={post.title} />}

            <div className="prose prose-lg dark:prose-invert mx-auto" dangerouslySetInnerHTML={{ __html: post.content_html }} />

            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                <LikeButton postId={post.id} initialLikes={likeCount} userHasLiked={userHasLiked} />
                <p className="text-sm text-gray-500 dark:text-zinc-400">{post.view_count.toLocaleString()} views</p>
            </div>

            <CommentsSection postId={post.id} comments={comments as CommentWithAuthor[]} currentUserProfile={viewerData?.profile ?? null} />
        </article>
    );
}