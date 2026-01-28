import ProfileSectionDisplay from '@/app/ui/podium/ProfileSectionDisplay';
import { getPodiumData } from '@/lib/data/user-data';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from "next";
import { MdOutlineLeaderboard, MdOutlineSentimentDissatisfied } from 'react-icons/md';
import { PencilSquareIcon } from '@heroicons/react/24/outline'; // Using Heroicons for the button consistency

type Props = {
    params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    return {
        title: `${username}'s Profile`,
        description: `Profile of ${username} on DeeperWeave.`,
    };
}

export default async function ProfileHomePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const supabase = await createClient();

    // 1. Fetch Profile Data
    const data = await getPodiumData(username);
    if (!data || !data.profile) notFound();
    const { sections, profile } = data;

    // 2. Determine if viewing own profile
    const { data: { user: viewer } } = await supabase.auth.getUser();
    const isOwnProfile = viewer?.id === profile.id;

    const isEmpty = !sections || sections.length === 0;

    return (
        // 1. STANDARD WRAPPER (Matches ProfileListsPage & TimelineDisplay)
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative z-10 max-w-7xl mx-auto pt-8 px-4 md:px-6">

            {/* --- COMPACT HEADER SECTION --- */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        Podium ({sections ? sections.length : 0})
                    </h2>
                </div>

                {isOwnProfile && (
                    <Link
                        href="/profile/edit"
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-xs font-bold transition-transform active:scale-95 hover:opacity-90"
                    >
                        <PencilSquareIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Customize</span>
                    </Link>
                )}
            </div>

            {/* --- MAIN CONTENT --- */}
            {!isEmpty ? (
                <ProfileSectionDisplay sections={sections} />
            ) : (
                /* --- EMPTY STATE (Matches ProfileListsPage Style) --- */
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                        {/* Using Md icon here as requested, but styled like the others */}
                        {isOwnProfile ? (
                            <MdOutlineLeaderboard className="w-8 h-8" />
                        ) : (
                            <MdOutlineSentimentDissatisfied className="w-8 h-8" />
                        )}
                    </div>

                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {isOwnProfile ? "The Podium is Empty" : "No Ranks Yet"}
                    </h3>

                    <p className="text-xs text-zinc-500 mt-1 max-w-xs text-center">
                        {isOwnProfile
                            ? "Start building your personal hall of fame. Add movies, shows, or people."
                            : `${username} hasn't added any sections to their podium yet.`
                        }
                    </p>

                    {isOwnProfile && (
                        <Link
                            href="/profile/edit"
                            className="mt-6 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Customize Podium &rarr;
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}