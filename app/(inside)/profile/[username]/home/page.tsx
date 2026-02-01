import ProfileSectionDisplay from '@/app/ui/podium/ProfileSectionDisplay';
import { getPodiumData } from '@/lib/data/user-data';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {calSans, playfairDisplay, PlayWriteNewZealandFont} from "@/app/ui/fonts";
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
        <div className="w-full min-h-[50vh] animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

            {/* MINIMAL CENTERED HEADER */}
            <header className="w-full pt-12 pb-10 px-4 flex flex-col items-center justify-center text-center">
                <div className="relative">
                    <h1 className={`${PlayWriteNewZealandFont.className} text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 leading-tight`}>
                        Podium
                    </h1>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="w-full max-w-4xl mx-auto px-4 md:px-6">
                {!isEmpty ? (
                    <ProfileSectionDisplay sections={sections} />
                ) : (
                    // --- EMPTY STATE ---
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-full mb-6 border border-zinc-100 dark:border-zinc-800">
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
                                className="group flex items-center gap-2 px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-sm font-bold transition-all hover:bg-zinc-800 dark:hover:bg-white hover:scale-105"
                            >
                                <MdAdd className="w-4 h-4" />
                                <span>Customize Podium</span>
                            </Link>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}