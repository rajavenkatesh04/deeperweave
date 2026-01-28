// @/app/blog/page.tsx

import { getPosts } from "@/lib/data/blog-data";
import Breadcrumbs from "@/app/ui/Breadcrumbs";
import BlogCard from "@/app/ui/blog/BlogCard";
import { Metadata } from "next";
import { Newspaper, FileText } from "lucide-react";

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Discover the latest reviews, news, and stories from the community.',
};

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <main className="min-h-screen w-full bg-white dark:bg-black px-6 py-12 md:py-20">

            <div className="max-w-6xl mx-auto space-y-12">

                {/* --- HEADER SECTION --- */}
                <div className="space-y-6">
                    <Breadcrumbs
                        breadcrumbs={[
                            { label: 'Home', href: '/' },
                            { label: 'Blog', href: '/blog', active: true },
                        ]}
                    />

                    <div className="border-b border-zinc-200 dark:border-zinc-800 pb-8 mt-8">
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">
                            <Newspaper size={16} />
                            <span>Publications</span>
                        </div>

                        <h1 className="font-serif text-5xl md:text-7xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
                            The Blog
                        </h1>

                        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl font-normal leading-relaxed">
                            Curated film reviews, industry news, and deep dives from our community of creators and critics.
                        </p>
                    </div>
                </div>

                {/* --- POSTS GRID --- */}
                <div>
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                            {posts.map((post) => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        // Empty State - Minimal & Friendly
                        <div className="flex flex-col items-center justify-center py-24 text-center border-t border-zinc-100 dark:border-zinc-800">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-zinc-400" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                                No posts published yet
                            </h2>
                            <p className="text-zinc-500 max-w-sm">
                                We are currently curating new content. Check back soon for the latest updates.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}