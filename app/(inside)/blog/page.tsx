// @/app/blog/page.tsx

import { getPosts } from "@/lib/data/blog-data";
import Breadcrumbs from "@/app/ui/Breadcrumbs";
import PostCard from "@/app/ui/blog/PostCard";

export default async function BlogPage() {
    // Fetch posts with our new, efficient function
    const posts = await getPosts();

    return (
        <main className={`p-6`}>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Blog', href: '/blog', active: true },
                ]}
            />
            <div className="mt-6 ">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">The Blog</h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-400">Read the latest reviews and articles from our community.</p>
            </div>

            <div className="mt-8">
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300/80 bg-white/50 p-12 text-center dark:border-zinc-800/50 dark:bg-zinc-900/50">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">No Posts Yet</h2>
                        <p className="mt-1 text-base text-gray-600 dark:text-zinc-400">There are no blog posts to display. Why not create the first one?</p>
                    </div>
                )}
            </div>
        </main>
    );
}