// app/(inside)/profile/[username]/posts/page.tsx
import { notFound } from 'next/navigation';
import { getProfileByUsername, getUserProfile } from '@/lib/data/user-data'; // ✨ Import getUserProfile
import { getPostsByUserId } from '@/lib/data/blog-data';
import ProfileBlogCard from '@/app/ui/blog/ProfileBlogCard'; // ✨ Import the new specific card

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
        <div className="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
            {posts && posts.length > 0 ? (
                <div className={`relative z-10 max-w-7xl mx-auto pt-8 pb-32 px-4 md:px-6`}>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <ProfileBlogCard
                                key={post.id}
                                post={post}
                                isOwner={isOwner}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center p-8 rounded-lg border-2 border-dashed border-gray-200 dark:border-zinc-800">
                    <h3 className="font-semibold text-gray-900 dark:text-zinc-100">No Posts Yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                        This user hasn&apos;t posted anything yet.
                    </p>
                </div>
            )}
        </div>
    );
}