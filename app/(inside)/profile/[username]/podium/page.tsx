import ProfileSectionDisplay from '@/app/ui/profile/ProfileSectionDisplay';
import { getPodiumData } from '@/lib/data/user-data'; // Import the new function
import { notFound } from 'next/navigation';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { Metadata } from "next";

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

    // ✨ Fetches cached data (Profile + Sections)
    const data = await getPodiumData(username);

    if (!data || !data.profile) notFound();
    const { sections } = data;

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
                <ProfileSectionDisplay sections={sections} />
            </main>
        </div>
    );
}