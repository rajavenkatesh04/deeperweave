import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProfileByUsername, getUserProfile } from '@/lib/data/user-data';
import { getPublicListsByUserId } from '@/lib/data/lists-data';
import ProfileListCard from '@/app/ui/profileLists/ProfileListCard'; // Ensure this matches path
import { FolderIcon, PlusIcon } from '@heroicons/react/24/outline';

export default async function ProfileListsPage({
                                                   params
                                               }: {
    params: Promise<{ username: string }>
}) {
    const { username } = await params;

    const profile = await getProfileByUsername(username);
    if (!profile) notFound();

    const currentUserData = await getUserProfile();
    const isOwner = currentUserData?.user?.id === profile.id;

    const lists = await getPublicListsByUserId(profile.id);

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative z-10 max-w-7xl mx-auto pt-8 px-4 md:px-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Collections</h2>
                    <span className="text-xs font-mono text-zinc-500">{lists.length} Lists</span>
                </div>
                {isOwner && (
                    <Link href="/lists/create" className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-xs font-bold transition-transform active:scale-95 hover:opacity-90">
                        <PlusIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">New List</span>
                    </Link>
                )}
            </div>

            {lists && lists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lists.map((list) => (
                        <ProfileListCard key={list.id} list={list} isOwner={isOwner} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                        <FolderIcon className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{isOwner ? "No lists created" : "No public lists"}</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs text-center">{isOwner ? "Start curating your favorite movies and shows into collections." : `${username} hasn't shared any lists yet.`}</p>
                    {isOwner && (
                        <Link href="/lists/create" className="mt-6 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Create your first list &rarr;</Link>
                    )}
                </div>
            )}
        </div>
    );
}