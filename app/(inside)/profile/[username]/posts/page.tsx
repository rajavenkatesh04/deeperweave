// app/(inside)/profile/[username]/posts/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProfileByUsername, getUserProfile } from '@/lib/data/user-data';
import { getPostsByUserId } from '@/lib/data/blog-data';
import ProfileBlogCard from '@/app/ui/blog/ProfileBlogCard';
import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline'; // Switched to Heroicons for consistency

export default async function ProfilePostsPage({
                                                   params
                                               }: {
    params: Promise<{ username: string }>
}) {
    const { username } = await params;

    // 1. Get the profile of the page we are viewing
    const profile = await getProfileByUsername(username);
    if (!profile) notFound();

    // 2. Get the currently logged-in user
    const currentUserData = await getUserProfile();

    // 3. Check ownership
    const isOwner = currentUserData?.user?.id === profile.id;

    // 4. Fetch posts
    const posts = await getPostsByUserId(profile.id);

    return (
        // 1. STANDARD WRAPPER (Matches ProfileListsPage, Timeline, Podium)
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative z-10 max-w-4xl mx-auto pt-8 px-4 md:px-6">

            {/* --- COMPACT HEADER SECTION --- */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        Posts ({posts ? posts.length : 0})
                    </h2>
                </div>

                {isOwner && (
                    <Link
                        href="/blog/create"
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-xs font-bold transition-transform active:scale-95 hover:opacity-90"
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">New Post</span>
                    </Link>
                )}
            </div>

            {/* --- MAIN CONTENT --- */}
            {posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <ProfileBlogCard
                            key={post.id}
                            post={post}
                            isOwner={isOwner}
                        />
                    ))}
                </div>
            ) : (
                /* --- EMPTY STATE (Matches Other Tabs Style) --- */
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                        <DocumentTextIcon className="w-8 h-8" strokeWidth={1.5} />
                    </div>

                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {isOwner ? "Your Blog is Empty" : "No Posts Yet"}
                    </h3>

                    <p className="text-xs text-zinc-500 mt-1 max-w-xs text-center">
                        {isOwner
                            ? "Share your thoughts, reviews, and cinematic experiences with the world."
                            : `${username} hasn't published any articles yet.`
                        }
                    </p>

                    {isOwner && (
                        <Link
                            href="/blog/create"
                            className="mt-6 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Create First Post &rarr;
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}