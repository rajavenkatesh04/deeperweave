import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPersonDetails, PersonDetails } from '@/lib/actions/cinematic-actions';
import { getIsSaved } from '@/lib/actions/save-actions'; // ✨ IMPORT
import SaveButton from '@/app/ui/save/SaveButton'; // ✨ IMPORT
import CinematicRow from '@/app/ui/discover/CinematicRow';
import { BriefcaseIcon, GlobeAltIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { BackdropGallery, ShareButton } from '@/app/(inside)/discover/[media_type]/[id]/media-interactive';
import BackButton from '@/app/(inside)/discover/[media_type]/[id]/BackButton';
import { googleSansCode } from '@/app/ui/fonts';
import PortraitGallery from '@/app/ui/discover/PortraitGallery';

export const dynamic = 'force-dynamic';

// --- HELPER COMPONENTS ---

function CastingStat({ label, value }: { label: string; value: string | number | null }) {
    if (!value) return null;
    return (
        <div className="flex flex-col border-b border-zinc-200 dark:border-zinc-800 py-3 last:border-0 group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors px-2 -mx-2 rounded-md">
            <span className={`${googleSansCode.className} text-[10px] uppercase tracking-widest text-zinc-400 mb-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors`}>
                {label}
            </span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 font-mono">
                {value}
            </span>
        </div>
    );
}

function SocialTag({ href, label }: { href: string; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-full hover:border-black dark:hover:border-white transition-colors group bg-white dark:bg-zinc-950"
        >
            <span className={`${googleSansCode.className} text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white`}>
                {label}
            </span>
            <ArrowUpRightIcon className="w-2.5 h-2.5 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
        </a>
    );
}

function getAge(birthday: string | null, deathday: string | null) {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const endDate = deathday ? new Date(deathday) : new Date();
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const m = endDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export default async function ActorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId)) notFound();

    // ✨ OPTIMIZATION: Fetch Actor Details & Saved Status concurrently
    const [details, isSaved] = await Promise.all([
        getPersonDetails(numericId).catch((e) => {
            console.error(e);
            return null;
        }),
        getIsSaved('person', numericId).catch(() => false)
    ]);

    if (!details) notFound();

    const hasBackdrop = details.backdrops.length > 0;
    const age = details.birthday ? getAge(details.birthday, details.deathday) : null;
    const genderMap: Record<number, string> = { 1: 'Female', 2: 'Male', 3: 'Non-binary' };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

            {/* --- HEADER: Back + Share + Save --- */}
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <BackButton />

                    <div className="flex items-center gap-3">
                        {/* ✨ INJECTED SAVE BUTTON */}
                        <SaveButton
                            itemType="person"
                            itemId={numericId}
                            initialIsSaved={isSaved}
                            className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            iconSize="w-5 h-5"
                        />
                        <ShareButton />
                    </div>
                </div>
            </header>

            {/* Backdrop Gallery */}
            <BackdropGallery
                images={details.backdrops}
                fallbackPath={details.backdrops[0]?.file_path || null}
            />

            {!hasBackdrop && <div className="h-10 w-full" />}

            <main className="pb-24">
                <div className={`relative z-10 max-w-7xl mx-auto px-6 ${hasBackdrop ? '-mt-48' : 'mt-8'}`}>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-24">

                        {/* --- LEFT COLUMN --- */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Profile Card */}
                            <div className="relative group">
                                {/* Decorative "Paper" Shadow */}
                                <div className="absolute top-2 left-2 w-full h-full bg-zinc-900/5 dark:bg-white/5 rounded-sm -z-10 transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />

                                <div className="relative aspect-[2/3] w-full bg-zinc-200 dark:bg-zinc-900 rounded-sm overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl">
                                    {details.profile_path ? (
                                        <>
                                            <Image
                                                src={`https://image.tmdb.org/t/p/h632${details.profile_path}`}
                                                alt={details.name}
                                                fill
                                                className="object-cover grayscale contrast-110 group-hover:grayscale-0 transition-all duration-700 ease-in-out"
                                                priority
                                            />
                                            {/* Flash Effect on Hover */}
                                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:animate-pulse pointer-events-none" />
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-zinc-400 bg-zinc-100 dark:bg-zinc-900">
                                            <span className={`${googleSansCode.className} text-xs uppercase`}>No Headshot</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Data Sheet Box */}
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                                {/* Decorative "Stamp" */}
                                <div className="absolute -top-6 -right-6 w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full blur-2xl opacity-50 pointer-events-none" />

                                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                    <BriefcaseIcon className="w-4 h-4 text-zinc-400" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                        Personal Data
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <CastingStat label="Department" value={details.known_for_department} />
                                    <CastingStat label="Gender" value={genderMap[details.gender]} />
                                    <CastingStat label="Birth Date" value={details.birthday} />
                                    {age !== null && <CastingStat label="Current Age" value={`${age}`} />}

                                    {details.place_of_birth && (
                                        <div className="pt-4 mt-2">
                                            <p className={`${googleSansCode.className} text-[10px] uppercase tracking-widest text-zinc-400 mb-2`}>
                                                Origin
                                            </p>
                                            <div className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300 leading-snug">
                                                <GlobeAltIcon className="w-4 h-4 shrink-0 mt-0.5" />
                                                {details.place_of_birth}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Social Tags */}
                            <div className="flex flex-wrap gap-2">
                                {details.social_ids.instagram_id && <SocialTag href={`https://instagram.com/${details.social_ids.instagram_id}`} label="IG" />}
                                {details.social_ids.twitter_id && <SocialTag href={`https://twitter.com/${details.social_ids.twitter_id}`} label="TW" />}
                                {details.social_ids.imdb_id && <SocialTag href={`https://www.imdb.com/name/${details.social_ids.imdb_id}`} label="IMDb" />}
                                {details.social_ids.facebook_id && <SocialTag href={`https://facebook.com/${details.social_ids.facebook_id}`} label="FB" />}
                            </div>
                        </div>

                        {/* --- RIGHT COLUMN --- */}
                        <div className={`lg:col-span-3 space-y-10 ${hasBackdrop ? 'lg:mt-56' : 'lg:mt-0'}`}>

                            {/* Name */}
                            <div className="space-y-3">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
                                    {details.name}
                                </h1>
                                {details.deathday && (
                                    <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 font-light">
                                        {details.birthday} – {details.deathday}
                                    </p>
                                )}
                            </div>

                            {/* Biography */}
                            <div className="space-y-4 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                                <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Biography</h2>
                                <div className="space-y-4 text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-light">
                                    {details.biography ? (
                                        details.biography.split('\n\n').map((paragraph, i) => (
                                            <p key={i}>{paragraph}</p>
                                        ))
                                    ) : (
                                        <p className="italic text-zinc-500">No biography available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Known For Row */}
                    {details.known_for.length > 0 && (
                        <div className="mb-24 -mx-6 md:-mx-12">
                            <CinematicRow
                                title="Known For"
                                items={details.known_for}
                                href={`/search?query=${details.name}`}
                            />
                        </div>
                    )}

                    {/* --- NEW PORTRAITS GALLERY --- */}
                    {details.images.length > 0 && (
                        <PortraitGallery images={details.images} />
                    )}
                </div>
            </main>
        </div>
    );
}