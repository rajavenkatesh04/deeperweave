import ProfileSectionDisplay from '@/app/ui/profile/ProfileSectionDisplay';
import { getProfileByUsername } from '@/lib/data/user-data';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { ProfileSection } from '@/lib/definitions';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts"; // Ensure correct import path
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

async function getProfileSections(userId: string): Promise<ProfileSection[]> {
    const supabase = await createClient();
    const { data: sectionsData, error } = await supabase
        .from('profile_sections')
        .select(`
            *,
            items:section_items(
                *,
                movie:movies(*),
                series:series(*),
                person:people(*)
            )
        `)
        .eq('user_id', userId)
        .order('rank', { ascending: true });

    if (error || !sectionsData) return [];

    return sectionsData.map((sec: any) => ({
        ...sec,
        items: (sec.items || [])
            .sort((a: any, b: any) => a.rank - b.rank)
            .map((item: any) => ({
                ...item,
                movie: Array.isArray(item.movie) ? item.movie[0] : item.movie,
                series: Array.isArray(item.series) ? item.series[0] : item.series,
                person: Array.isArray(item.person) ? item.person[0] : item.person,
            }))
    }));
}

export default async function ProfileHomePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const profile = await getProfileByUsername(username);
    if (!profile) notFound();

    const sections = await getProfileSections(profile.id);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="w-full text-center content-center border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black py-10 px-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    {/* Title Section */}
                    <div>
                        <h1 className={`${PlayWriteNewZealandFont.className} text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-3`}>
                            Podium
                        </h1>
                        <p className="text-sm text-zinc-500">
                            Award your Ranks
                        </p>
                    </div>
                </div>
            </div>


            <main className="pt-5 pb-32">
                <ProfileSectionDisplay sections={sections} />
            </main>
        </div>
    );
}