import ProfileSectionDisplay from '@/app/ui/podium/ProfileSectionDisplay';
import {getProfileByUsername} from '@/lib/data/user-data';
import {createClient} from '@/utils/supabase/server';
import {notFound} from 'next/navigation';
import {PlayWriteNewZealandFont} from "@/app/ui/fonts";
import {Metadata} from "next";

type Props = {
    params: Promise<{ username: string }>
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
    const {username} = await params;
    return {
        title: `${username}'s Profile`,
        description: `Profile of ${username} on DeeperWeave.`,
    };
}

export default async function ProfileHomePage({params}: { params: Promise<{ username: string }> }) {
    const {username} = await params;
    const supabase = await createClient();

    // 1. FAST Check: Only fetch basic profile info (not the heavy sections)
    // This confirms the user exists without blocking the UI for long.
    const profile = await getProfileByUsername(username);
    if (!profile) notFound();

    // 2. Determine if viewing own profile
    const {data: {user: viewer}} = await supabase.auth.getUser();
    const isOwnProfile = viewer?.id === profile.id;

    return (
        <div className="w-full min-h-[50vh] animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

            {/* MINIMAL CENTERED HEADER */}
            <header className="w-full pt-6 pb-10 px-4 flex flex-col items-center justify-center text-center">
                <div className="relative">
                    <h1
                        className={`${PlayWriteNewZealandFont.className} text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-blue-400 to-cyan-400 leading-tight`}
                    >
                        Podium
                    </h1>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="w-full max-w-4xl mx-auto px-4 md:px-6">
                {/* We pass 'username' so the Client Component can fetch/cache the data */}
                <ProfileSectionDisplay
                    username={username}
                    isOwnProfile={isOwnProfile}
                />
            </main>
        </div>
    );
}