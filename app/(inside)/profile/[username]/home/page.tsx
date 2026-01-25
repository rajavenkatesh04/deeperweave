import ProfileSectionDisplay from '@/app/ui/profile/ProfileSectionDisplay';
import { getProfileByUsername } from '@/lib/data/user-data';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { ProfileSection } from '@/lib/definitions';

// Helper to fetch full sections with nested items
async function getProfileSections(userId: string): Promise<ProfileSection[]> {
    const supabase = await createClient();

    // Fetch sections and nested items (movies, series, people)
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

    if (error || !sectionsData) {
        console.error("Error fetching profile sections:", error);
        return [];
    }

    // Transform and Sort the data
    const sections: ProfileSection[] = sectionsData.map((sec: any) => ({
        ...sec,
        items: (sec.items || [])
            .sort((a: any, b: any) => a.rank - b.rank)
            .map((item: any) => ({
                ...item,
                // Flatten array responses from Supabase
                movie: Array.isArray(item.movie) ? item.movie[0] : item.movie,
                series: Array.isArray(item.series) ? item.series[0] : item.series,
                person: Array.isArray(item.person) ? item.person[0] : item.person,
            }))
    }));

    return sections;
}

export default async function ProfileHomePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    const profile = await getProfileByUsername(username);
    if (!profile) {
        notFound();
    }

    // Fetch the new modular sections
    const sections = await getProfileSections(profile.id);

    return (
        <div className="space-y-8">
            <ProfileSectionDisplay sections={sections} />
        </div>
    );
}