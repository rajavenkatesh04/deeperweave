// app/(inside)/explore/page.tsx
import { createClient } from '@/utils/supabase/server';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import Link from 'next/link';
import BlogCard from '@/app/ui/blog/BlogCard'; // Your existing component
// import ProfileListCard from '@/app/ui/lists/ProfileListCard'; // You'll need this

export default async function ExplorePage() {
    const supabase = await createClient();

    // Parallel Fetching
    const [blogs, lists] = await Promise.all([
        supabase.from('blogs').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('lists').select('*').eq('status', 'public').order('created_at', { ascending: false }).limit(5)
    ]);

    return (
        <main className="p-6 max-w-7xl mx-auto space-y-12">
            <header>
                <h1 className={`${PlayWriteNewZealandFont.className} text-4xl font-bold mb-2`}>Explore</h1>
                <p className="text-zinc-500">Curated stories and collections from the community.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COL: BLOGS (Larger share) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="bg-zinc-900 text-white text-xs px-2 py-1 rounded">FRESH</span>
                            Stories
                        </h2>
                        <Link href="/explore/blogs" className="text-xs font-bold text-zinc-400 hover:text-zinc-900">VIEW ALL</Link>
                    </div>
                    <div className="grid gap-6">
                        {blogs.data?.map(blog => (
                            <BlogCard key={blog.id} post={blog} />
                        ))}
                    </div>
                </div>

                {/* RIGHT COL: LISTS (Sidebar style) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Community Lists</h2>
                        <Link href="/explore/lists" className="text-xs font-bold text-zinc-400 hover:text-zinc-900">VIEW ALL</Link>
                    </div>
                    <div className="space-y-4">
                        {lists.data?.map(list => (
                            <Link key={list.id} href={`/lists/${list.id}`} className="block group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg hover:border-zinc-400 transition-all">
                                <h3 className="font-bold text-sm group-hover:underline">{list.title}</h3>
                                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{list.description}</p>
                                <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-400 font-mono uppercase">
                                    <span>{list.item_count || 0} Items</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}