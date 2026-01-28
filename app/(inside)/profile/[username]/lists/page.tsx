import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProfileByUsername, getUserProfile } from '@/lib/data/user-data';
import { getPublicListsByUserId } from '@/lib/data/lists-data'; // Use the new fetcher
import ListCard from '@/app/ui/profileLists/ListCard';
import { MdCollectionsBookmark, MdAdd, MdOutlineSentimentDissatisfied } from 'react-icons/md';

export default async function ProfileListsPage({
                                                   params
                                               }: {
    params: Promise<{ username: string }>
}) {
    const { username } = await params;

    // 1. Get the profile of the page we are viewing
    const profile = await getProfileByUsername(username);
    if (!profile) notFound();

    // 2. Get the currently logged-in user (to check ownership)
    const currentUserData = await getUserProfile();
    const isOwner = currentUserData?.user?.id === profile.id;

    // 3. Fetch lists for THIS profile ID
    const lists = await getPublicListsByUserId(profile.id);

    return (
        <div className="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed"
                 style={{
                     backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                     backgroundSize: '24px 24px'
                 }}
            />

            <div className="relative z-10 max-w-7xl mx-auto pt-8 pb-32 px-4 md:px-6">

                {lists && lists.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {lists.map((list) => (
                            <ListCard
                                key={list.id}
                                list={list}
                            />
                        ))}
                    </div>
                ) : (
                    // --- EMPTY STATE ---
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-6">
                            {isOwner ? (
                                <MdCollectionsBookmark className="w-8 h-8 text-zinc-400" />
                            ) : (
                                <MdOutlineSentimentDissatisfied className="w-8 h-8 text-zinc-400" />
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                            {isOwner ? "Create a Collection" : "No Lists Yet"}
                        </h3>

                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-8 leading-relaxed">
                            {isOwner
                                ? "Organize your favorite movies, series, and anime into shareable lists."
                                : `${username} hasn't created any public lists yet.`
                            }
                        </p>

                        {/* Button ONLY shows if it is your own profile */}
                        {isOwner && (
                            <Link
                                href="/lists/create"
                                className="group flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md text-sm font-bold transition-transform active:scale-95 hover:opacity-90"
                            >
                                <MdAdd className="w-5 h-5" />
                                <span>Create New List</span>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}