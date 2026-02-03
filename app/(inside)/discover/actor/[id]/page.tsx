import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPersonDetails } from '@/lib/actions/cinematic-actions';
import { getIsSaved } from '@/lib/actions/save-actions';
import { createClient } from '@/utils/supabase/server'; // ✨ IMPORT
import ContentGuard from '@/app/ui/shared/ContentGuard'; // ✨ IMPORT
import SaveButton from '@/app/ui/save/SaveButton';
import CinematicRow from '@/app/ui/discover/CinematicRow';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { BackdropGallery, ShareButton } from '@/app/(inside)/discover/[media_type]/[id]/media-interactive';
import BackButton from '@/app/(inside)/discover/[media_type]/[id]/BackButton';
import PortraitGallery from '@/app/ui/discover/PortraitGallery';

export const dynamic = 'force-dynamic';

// Redesigned simple info block
function InfoBlock({ label, value, className = "" }: { label: string; value: React.ReactNode; className?: string }) {
    if (!value) return null;
    return (
        <div className={`flex flex-col ${className}`}>
            <span className="text-[11px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-semibold mb-1.5">{label}</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">{value}</span>
        </div>
    );
}

function SocialTag({ href, label }: { href: string; label: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-full hover:border-black dark:hover:border-white transition-colors group bg-white dark:bg-zinc-950">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white">{label}</span>
            <ArrowUpRightIcon className="w-2.5 h-2.5 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
        </a>
    );
}

function getAge(birthday: string | null, deathday: string | null) {
    if (!birthday) return "N/A";
    const birthDate = new Date(birthday);
    const endDate = deathday ? new Date(deathday) : new Date();
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const m = endDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) age--;
    return age;
}

export default async function ActorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId)) notFound();

    // 1. ✨ FETCH SESSION FOR PREFERENCES
    const supabase = await createClient();
    const [details, isSaved, { data: { user } }] = await Promise.all([
        getPersonDetails(numericId).catch((e) => {
            console.error(e);
            return null;
        }),
        getIsSaved('person', numericId).catch(() => false),
        supabase.auth.getUser()
    ]);

    if (!details) notFound();

    // 2. ✨ SAFETY LOGIC
    // Default to 'sfw' if user is not logged in or preference is missing
    const userPreference = user?.user_metadata?.content_preference || 'sfw';
    const isSFW = userPreference === 'sfw';
    // Ensure we access the 'adult' property we added to the action
    const isExplicit = (details as any).adult === true;

    const hasBackdrop = details.backdrops && details.backdrops.length > 0;
    const age = getAge(details.birthday, details.deathday);
    const genderMap: Record<number, string> = { 0: 'N/A', 1: 'Female', 2: 'Male', 3: 'Non-binary' };
    const genderLabel = genderMap[details.gender] || 'N/A';

    // Format birthday for better readability
    const formattedBirthday = details.birthday ? new Date(details.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <BackButton />
                    <div className="flex items-center gap-3">
                        <SaveButton itemType="person" itemId={numericId} initialIsSaved={isSaved} className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800" iconSize="w-5 h-5" />
                        <ShareButton />
                    </div>
                </div>
            </header>

            {/* ✨ GUARDED BACKDROP */}
            <ContentGuard isAdult={isExplicit} isSFW={isSFW}>
                <BackdropGallery images={details.backdrops || []} fallbackPath={details.backdrops?.[0]?.file_path || null} />
            </ContentGuard>

            {!hasBackdrop && <div className="h-10 w-full" />}

            <main className="pb-24">
                <div className={`relative z-10 max-w-7xl mx-auto px-6 ${hasBackdrop ? '-mt-48' : 'mt-8'}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-24">

                        {/* LEFT COLUMN: Image & Personal Data */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Profile Image */}
                            <div className="relative group">
                                <div className="absolute top-2 left-2 w-full h-full bg-zinc-900/5 dark:bg-white/5 rounded-sm -z-10 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />

                                {/* ✨ GUARDED PROFILE IMAGE */}
                                <div className="relative aspect-[2/3] w-full bg-zinc-200 dark:bg-zinc-900 rounded-sm overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl">
                                    <ContentGuard isAdult={isExplicit} isSFW={isSFW}>
                                        {details.profile_path ? (
                                            <>
                                                <Image src={`https://image.tmdb.org/t/p/h632${details.profile_path}`} alt={details.name} fill className="object-cover contrast-110 group-hover:grayscale-0 transition-all duration-700 ease-in-out" priority />
                                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:animate-pulse pointer-events-none" />
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-zinc-400 bg-zinc-100 dark:bg-zinc-900"><span className="text-xs uppercase font-bold tracking-widest">No Headshot</span></div>
                                        )}
                                    </ContentGuard>
                                </div>
                            </div>

                            {/* Personal Data Section */}
                            <div className="space-y-6 pt-4">
                                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                    <InfoBlock label="Known For" value={details.known_for_department} />
                                    <InfoBlock label="Gender" value={genderLabel} />
                                    <InfoBlock label="Age" value={age} />
                                    {details.birthday && <InfoBlock label="Birth Date" value={formattedBirthday} />}
                                </div>

                                <InfoBlock
                                    label="Place of Birth"
                                    value={details.place_of_birth}
                                />

                                {details.also_known_as && details.also_known_as.length > 0 && (
                                    <div className="pt-2">
                                        <span className="text-[11px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-semibold mb-2 block">Also Known As</span>
                                        <div className="flex flex-wrap gap-2">
                                            {details.also_known_as.slice(0, 5).map((alias, i) => (
                                                <span key={i} className="text-xs px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-md text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                                                    {alias}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-2">
                                    {details.social_ids?.instagram_id && <SocialTag href={`https://instagram.com/${details.social_ids.instagram_id}`} label="IG" />}
                                    {details.social_ids?.twitter_id && <SocialTag href={`https://twitter.com/${details.social_ids.twitter_id}`} label="TW" />}
                                    {details.social_ids?.imdb_id && <SocialTag href={`https://www.imdb.com/name/${details.social_ids.imdb_id}`} label="IMDb" />}
                                    {details.social_ids?.facebook_id && <SocialTag href={`https://facebook.com/${details.social_ids.facebook_id}`} label="FB" />}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Bio & Content */}
                        <div className={`lg:col-span-3 space-y-10 ${hasBackdrop ? 'lg:mt-56' : 'lg:mt-0'}`}>
                            <div className="space-y-3">
                                {/* ✨ EXPLICIT BADGE */}
                                {isExplicit && (
                                    <span className="inline-block px-2 py-1 mb-2 text-[10px] font-bold tracking-wider text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30 rounded">
                                        ADULT ACTOR
                                    </span>
                                )}
                                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">{details.name}</h1>
                                {details.deathday && <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 font-light">{formattedBirthday} – {new Date(details.deathday).getFullYear()}</p>}
                            </div>
                            <div className="space-y-4 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                                <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Biography</h2>
                                <div className="space-y-4 text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-light">{details.biography ? details.biography.split('\n\n').map((paragraph, i) => <p key={i}>{paragraph}</p>) : <p className="italic text-zinc-500">No biography available for this person.</p>}</div>
                            </div>
                        </div>
                    </div>

                    {details.known_for && details.known_for.length > 0 && <div className="mb-24 -mx-6 md:-mx-12"><CinematicRow title="Known For" items={details.known_for} href={`/search?query=${details.name}`} /></div>}

                    {/* Gallery Section */}
                    {details.images && details.images.length > 0 && (
                        <div className="mb-12">
                            {/* ✨ GUARDED GALLERY */}
                            <ContentGuard isAdult={isExplicit} isSFW={isSFW}>
                                <PortraitGallery images={details.images} />
                            </ContentGuard>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}