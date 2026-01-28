import ProfileSectionDisplay from '@/app/ui/podium/ProfileSectionDisplay';
import { getPodiumData } from '@/lib/data/user-data';
import { createClient } from '@/utils/supabase/server'; // Import auth client
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { Metadata } from "next";
import { MdOutlineLeaderboard, MdAdd, MdOutlineSentimentDissatisfied } from 'react-icons/md';

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
        <div className="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black">

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed"
                 style={{
                     backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                     backgroundSize: '24px 24px'
                 }}
            />

            {/* Header Section */}
            <div className="relative z-10 w-full text-center content-center border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm py-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className={`${PlayWriteNewZealandFont.className} text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-3`}>
                            Podium
                        </h1>
                        <p className="text-sm font-mono uppercase tracking-widest text-zinc-500">
                            Award your Ranks
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto pt-8 pb-32 px-4 md:px-6">
                {!isEmpty ? (
                    <ProfileSectionDisplay sections={sections} />
                ) : (
                    // --- EMPTY STATE ---
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-6">
                            {isOwnProfile ? (
                                <MdOutlineLeaderboard className="w-8 h-8 text-zinc-400" />
                            ) : (
                                <MdOutlineSentimentDissatisfied className="w-8 h-8 text-zinc-400" />
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                            {isOwnProfile ? "The Podium is Empty" : "No Ranks Yet"}
                        </h3>

                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-8 leading-relaxed">
                            {isOwnProfile
                                ? "Start building your personal hall of fame. Add movies, shows, or people to showcase your taste."
                                : `${username} hasn't added any sections to their podium yet.`
                            }
                        </p>

                        {/* Button ONLY shows if it is your own profile */}
                        {isOwnProfile && (
                            <Link
                                href="/profile/edit"
                                className="group flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md text-sm font-bold transition-transform active:scale-95 hover:opacity-90"
                            >
                                <MdAdd className="w-5 h-5" />
                                <span>Customize Podium</span>
                            </Link>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}