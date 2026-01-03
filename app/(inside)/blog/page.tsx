// @/app/blog/page.tsx

import { getPosts } from "@/lib/data/blog-data";
import Breadcrumbs from "@/app/ui/Breadcrumbs";
import BlogCard from "@/app/ui/blog/BlogCard";
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { Square3Stack3DIcon } from "@heroicons/react/24/outline";

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <main className="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 px-6 py-8 md:px-12 md:py-12">

            {/* --- TECHNICAL BACKGROUND --- */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed"
                 style={{
                     backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                     backgroundSize: '24px 24px'
                 }}
            />
            <div className="absolute inset-0 opacity-10 pointer-events-none fixed"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            <div className="relative z-10 max-w-7xl mx-auto">
                <Breadcrumbs
                    breadcrumbs={[
                        { label: 'Home', href: '/' },
                        { label: 'Transmissions', href: '/blog', active: true },
                    ]}
                />

                {/* --- HEADER --- */}
                <div className="mt-8 mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                    <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">
                        <Square3Stack3DIcon className="w-4 h-4" />
                        <span>Archive // Vol. 01</span>
                    </div>
                    <h1 className={`${PlayWriteNewZealandFont.className} text-4xl md:text-6xl font-bold text-zinc-900 dark:text-zinc-100 leading-none`}>
                        The Logs
                    </h1>
                    <p className="mt-4 text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl font-light leading-relaxed">
                        Curated reviews, deep dives, and thoughts from the community.
                        Access the weave.
                    </p>
                </div>

                {/* --- GRID --- */}
                <div className="mt-8">
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        // Empty State - Technical Look
                        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50 p-12 text-center">
                            <div className="w-12 h-12 border border-zinc-400 dark:border-zinc-600 flex items-center justify-center mb-4 rotate-45">
                                <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full" />
                            </div>
                            <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">No Signal</h2>
                            <p className="mt-2 text-xs font-mono text-zinc-500">
                                [ ERR_EMPTY_ARCHIVE ]
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}