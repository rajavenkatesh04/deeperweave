// @/app/blog/[slug]/page.tsx

import { getPostBySlug } from "@/lib/data/blog-data";
import { getUserProfile } from "@/lib/data/user-data";
import { notFound } from "next/navigation";
import ViewTracker from "@/app/ui/blog/ViewTracker";
import AnimatedBlogPost from "@/app/ui/blog/AnimatedBlogPost";

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
            <AnimatedBlogPost
                post={post}
                author={author}
                movie={movie}
                likeCount={likeCount}
                userHasLiked={userHasLiked}
                comments={comments}
                viewerData={viewerData}
                nsfw={postData.is_nsfw}
                rating={postData.rating}
            />
        </>
    );
}