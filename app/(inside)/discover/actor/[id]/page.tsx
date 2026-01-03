import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPersonDetails, PersonDetails } from '@/lib/actions/cinematic-actions';
import CinematicRow from '@/app/ui/discover/CinematicRow';
import { UserIcon, MapPinIcon, CameraIcon } from '@heroicons/react/24/outline';
import { BackdropGallery } from '@/app/(inside)/discover/[media_type]/[id]/media-interactive';
import BackButton from '@/app/(inside)/discover/[media_type]/[id]/BackButton';

export const dynamic = 'force-dynamic';

function SocialLink({ href, label, colorClass }: { href: string; label: string; colorClass?: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all font-medium text-xs rounded-md"
        >
            <span className={colorClass || ""}>{label}</span>
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

    let details: PersonDetails;
    try {
        details = await getPersonDetails(numericId);
    } catch (error) {
        console.error(error);
        notFound();
    }

    if (!details) notFound();

    const hasBackdrop = details.backdrops.length > 0;
    const age = details.birthday ? getAge(details.birthday, details.deathday) : null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

            {/* Header */}
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <BackButton />
                    <div className="text-sm font-medium text-zinc-500">{details.known_for_department}</div>
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

                        {/* LEFT COLUMN: Profile Poster & Info */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Profile Card */}
                            <div className="relative aspect-[2/3] w-full max-w-md mx-auto overflow-hidden bg-zinc-200 dark:bg-zinc-900 shadow-2xl group border-4 border-white dark:border-zinc-800 rounded-sm">
                                {details.profile_path ? (
                                    <>
                                        <Image
                                            src={`https://image.tmdb.org/t/p/h632${details.profile_path}`}
                                            alt={details.name}
                                            fill
                                            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/10 transition-colors duration-700 ease-in-out" />
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-400">
                                        <UserIcon className="w-20 h-20" />
                                    </div>
                                )}
                            </div>

                            {/* Personal Info Box */}
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Personal Info</p>

                                <div className="space-y-6">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Known For</p>
                                            <p className="font-medium">{details.known_for_department}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Gender</p>
                                            <p className="font-medium">
                                                {details.gender === 1 ? 'Female' : details.gender === 2 ? 'Male' : 'Non-binary'}
                                            </p>
                                        </div>
                                        {age !== null && (
                                            <div className="space-y-2">
                                                <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Age</p>
                                                <p className="font-medium">{age} years</p>
                                            </div>
                                        )}
                                        {details.birthday && (
                                            <div className="space-y-2">
                                                <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Birthday</p>
                                                <p className="font-medium">{details.birthday}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Place of Birth */}
                                    {details.place_of_birth && (
                                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-2">Place of Birth</p>
                                            <p className="text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                                                <MapPinIcon className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5"/>
                                                {details.place_of_birth}
                                            </p>
                                        </div>
                                    )}

                                    {/* Social Links */}
                                    {(details.social_ids.instagram_id || details.social_ids.twitter_id ||
                                        details.social_ids.imdb_id || details.social_ids.facebook_id) && (
                                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">Social</p>
                                            <div className="flex flex-wrap gap-2">
                                                {details.social_ids.instagram_id && (
                                                    <SocialLink
                                                        href={`https://instagram.com/${details.social_ids.instagram_id}`}
                                                        label="Instagram"
                                                        colorClass="text-pink-600 dark:text-pink-400"
                                                    />
                                                )}
                                                {details.social_ids.twitter_id && (
                                                    <SocialLink
                                                        href={`https://twitter.com/${details.social_ids.twitter_id}`}
                                                        label="Twitter"
                                                    />
                                                )}
                                                {details.social_ids.imdb_id && (
                                                    <SocialLink
                                                        href={`https://www.imdb.com/name/${details.social_ids.imdb_id}`}
                                                        label="IMDb"
                                                        colorClass="text-yellow-600 dark:text-yellow-400"
                                                    />
                                                )}
                                                {details.social_ids.facebook_id && (
                                                    <SocialLink
                                                        href={`https://facebook.com/${details.social_ids.facebook_id}`}
                                                        label="Facebook"
                                                        colorClass="text-blue-600 dark:text-blue-400"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Bio & Works */}
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

                    {/* Portraits Gallery - FIXED: 'profiles' -> 'images' */}
                    {details.images.length > 0 && (
                        <div className="space-y-8 mb-24">
                            <h2 className="text-3xl font-light text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                                <CameraIcon className="w-7 h-7 text-zinc-400"/>
                                Portraits
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {details.images.map((img) => (
                                    <div
                                        key={img.file_path}
                                        className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 rounded-md group cursor-pointer"
                                    >
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${img.file_path}`}
                                            alt="Portrait"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}