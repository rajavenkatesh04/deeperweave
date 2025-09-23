// app/(inside)/profile/[username]/posts/page.tsx
import { notFound } from 'next/navigation';
import { getProfileByUsername } from '@/lib/data/user-data';
import { getPostsByUserId } from '@/lib/data/blog-data';
import PostCard from '@/app/ui/blog/PostCard';

export default async function ProfilePostsPage({
                                                   params
                                               }: {
    params: Promise<{ username: string }>
}) {
    // Await the params Promise in Next.js 15
    const { username } = await params;

    // We need the profile to get the user's ID
    const profile = await getProfileByUsername(username);
    if (!profile) notFound();

    // Fetch only the posts for this specific user
    const posts = await getPostsByUserId(profile.id);

    return (
        <div>
            {posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 rounded-lg border-2 border-dashed border-gray-200 dark:border-zinc-800">
                    <h3 className="font-semibold text-gray-900 dark:text-zinc-100">No Posts Yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">This user hasn&apos;t posted anything yet.</p>
                </div>
            )}
        </div>
    );
}