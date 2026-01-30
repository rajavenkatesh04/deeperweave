import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetails, getSeriesDetails } from '@/lib/actions/cinematic-actions';
import { getIsSaved } from '@/lib/actions/save-actions';
import { getUserProfile } from '@/lib/data/user-data';
import { getCinematicEngagement } from '@/lib/data/timeline-data'; // ✨ IMPORT
import SaveButton from '@/app/ui/save/SaveButton';
import CinematicRow from '@/app/ui/discover/CinematicRow';
import { PlusIcon, FilmIcon, StarIcon, HashtagIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/solid'; // ✨ Added Icons
import { ShareButton, TrailerButton, BackdropGallery } from './media-interactive';
import BackButton from './BackButton';

export const dynamic = 'force-dynamic';

interface CastMember { id: number; name: string; character: string; profile_path: string | null; }

export default async function SimpleDetailPage({
                                                   params
                                               }: {
    params: Promise<{ media_type: string; id: string }>
}) {
    const { media_type, id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId) || (media_type !== 'movie' && media_type !== 'tv')) notFound();

    // 1. Get User First (we need ID for engagement check)
    const userResult = await getUserProfile();
    const currentUser = userResult?.profile;

    // 2. Fetch Details, Saved Status, and Engagement in parallel
    const [details, isSaved, engagement] = await Promise.all([
        (media_type === 'movie' ? getMovieDetails(numericId) : getSeriesDetails(numericId)).catch((e) => {
            console.error("Fetch error:", e);
            return null;
        }),
        getIsSaved(media_type as 'movie' | 'series', numericId),
        // ✨ Fetch Social Context if user is logged in
        currentUser ? getCinematicEngagement(currentUser.id, media_type as 'movie' | 'tv', numericId) : null
    ]);

    if (!details) notFound();

    const title = details.title;
    const releaseDate = details.release_date;
    const releaseYear = releaseDate?.split('-')[0] || 'N/A';
    const directorOrCreator = details.director || details.creator;

    const formatRuntime = (mins?: number) => mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : null;
    const runtimeString = details.runtime ? formatRuntime(details.runtime) : null;
    const seasonsString = details.number_of_seasons ? `${details.number_of_seasons} Seasons` : null;
    const rating = details.vote_average ? details.vote_average.toFixed(1) : 'NR';

    const hasBackdrop = !!(details.backdrop_path || (details.images?.backdrops?.length > 0));
    const providers = details.watch_providers?.flatrate || [];

    // ✨ Helper: Date Formatter
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

            {/* Header */}
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <BackButton />
                    <div className="flex items-center gap-3">
                        <SaveButton
                            itemType={media_type as 'movie' | 'series'}
                            itemId={numericId}
                            initialIsSaved={isSaved}
                            className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            iconSize="w-5 h-5"
                        />
                        <ShareButton />
                    </div>
                </div>
            </header>

            {/* Backdrop Section */}
            <BackdropGallery
                images={details.images?.backdrops || []}
                fallbackPath={details.backdrop_path}
            />

            {!hasBackdrop && <div className="h-10 w-full" />}

            <main className="pb-24">
                <div className={`relative z-10 max-w-7xl mx-auto px-6 ${hasBackdrop ? '-mt-48' : 'mt-8'}`}>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-24">

                        {/* LEFT COLUMN: Poster & Streaming Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="relative aspect-[2/3] w-full max-w-md mx-auto overflow-hidden bg-zinc-200 dark:bg-zinc-900 shadow-2xl group border-4 border-white dark:border-zinc-800 rounded-sm">
                                {details.poster_path ? (
                                    <>
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                                            alt={title}
                                            fill
                                            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/10 transition-colors duration-700 ease-in-out" />
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full">
                                        <FilmIcon className="w-16 h-16 text-zinc-400" />
                                    </div>
                                )}
                            </div>

                            {providers.length > 0 && (
                                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Streaming On</p>
                                    <div className="flex flex-wrap gap-3">
                                        {providers.map((p) => (
                                            <div key={p.provider_name} className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800" title={p.provider_name}>
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                                                    alt={p.provider_name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Info & Details */}
                        <div className={`lg:col-span-3 space-y-8 ${hasBackdrop ? 'lg:mt-56' : 'lg:mt-0'}`}>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {details.certification && details.certification !== 'NR' && (
                                        <span className="px-2 py-1 border border-zinc-400 dark:border-zinc-600 text-xs font-bold rounded">
                                            {details.certification}
                                        </span>
                                    )}
                                    {details.status && (
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${details.status === 'Ended' || details.status === 'Released' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'}`}>
                                            {details.status}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
                                    {title}
                                </h1>
                                {details.tagline && (
                                    <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 font-light italic">
                                        {details.tagline}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                                <span className="font-medium">{releaseYear}</span>
                                {runtimeString && <><span className="text-zinc-400">·</span><span>{runtimeString}</span></>}
                                {seasonsString && <><span className="text-zinc-400">·</span><span>{seasonsString}</span></>}
                                {details.vote_average > 0 && (
                                    <>
                                        <span className="text-zinc-400">·</span>
                                        <span className="inline-flex items-center gap-1.5 font-medium">
                                            <StarIcon className="w-4 h-4 text-amber-500" />
                                            {rating}
                                        </span>
                                    </>
                                )}
                            </div>

                            {details.genres?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {details.genres.map((g) => (
                                        <span key={g.id} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-medium">
                                            {g.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-3">
                                <TrailerButton videos={details.videos || []} />
                                {currentUser ? (
                                    <Link
                                        href={`/profile/${currentUser.username}/timeline/create?item=${id}&type=${media_type}`}
                                        className="px-8 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all font-medium"
                                    >
                                        <span className="flex items-center gap-2">
                                            <PlusIcon className="w-4 h-4" />
                                            Log Entry
                                        </span>
                                    </Link>
                                ) : (
                                    <Link
                                        href={`/auth/login?item=${id}&type=${media_type}`}
                                        className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 transition-all font-medium"
                                    >
                                        <span className="flex items-center gap-2">
                                            Log In to Add
                                        </span>
                                    </Link>
                                )}
                            </div>

                            {/* ✨ NEW SECTION: SHARED INFO & ENGAGEMENT */}
                            {engagement && (engagement.watchCount > 0 || engagement.friendEntries.length > 0) && (
                                <div className="py-6 border-y border-zinc-100 dark:border-zinc-900 space-y-4 animate-in fade-in slide-in-from-bottom-4">

                                    {/* 1. My History */}
                                    {engagement.watchCount > 0 && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                                                <ClockIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                    You&apos;ve watched this <span className="font-bold">{engagement.watchCount} times</span>.
                                                </p>
                                                <p className="text-xs text-zinc-500 mt-1">
                                                    Last watched on {formatDate(engagement.myEntries[0].watched_on)}
                                                    {engagement.myEntries[0].rating && (
                                                        <span className="ml-2 inline-flex items-center text-amber-500">
                                                            <StarIcon className="w-3 h-3 mr-1" />
                                                            {engagement.myEntries[0].rating}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. Friends History */}
                                    {engagement.friendEntries.length > 0 && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                                                <UserGroupIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Watched by friends</p>
                                                <div className="flex flex-col gap-2 mt-2">
                                                    {engagement.friendEntries.slice(0, 3).map(entry => (
                                                        <Link
                                                            key={entry.id}
                                                            href={`/profile/${entry.profiles.username}`}
                                                            className="flex items-center gap-2 group"
                                                        >
                                                            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                                                <Image
                                                                    src={entry.profiles.profile_pic_url || '/placeholder-user.jpg'}
                                                                    alt={entry.profiles.username}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <span className="text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">@{entry.profiles.username}</span>
                                                                {entry.rating ? ` rated it ${entry.rating}` : ' logged it'}
                                                                <span className="text-zinc-400 mx-1">•</span>
                                                                {formatDate(entry.watched_on)}
                                                            </span>
                                                        </Link>
                                                    ))}
                                                    {engagement.friendEntries.length > 3 && (
                                                        <p className="text-xs text-zinc-400 pl-7">and {engagement.friendEntries.length - 3} others...</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Overview */}
                            <div className="space-y-4 pt-2">
                                <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Overview</h2>
                                <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-light">
                                    {details.overview || "No overview available."}
                                </p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                                {directorOrCreator && (
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                                            {media_type === 'movie' ? 'Director' : 'Creator'}
                                        </p>
                                        <p className="font-medium">{directorOrCreator}</p>
                                    </div>
                                )}
                                {releaseDate && (
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Release Date</p>
                                        <p className="font-medium">{releaseDate}</p>
                                    </div>
                                )}
                            </div>

                            {details.keywords?.length > 0 && (
                                <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100 transition-opacity">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                                        <HashtagIcon className="w-3 h-3"/> Related Keywords
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {details.keywords.slice(0, 10).map((k) => (
                                            <Link
                                                key={k.id}
                                                href={`/search?query=${k.name}`}
                                                className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 text-[10px] text-zinc-500 dark:text-zinc-400 rounded-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                                            >
                                                #{k.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cast Section */}
                    {details.cast?.length > 0 && (
                        <div className="space-y-8 mb-24">
                            <h2 className="text-3xl font-light text-zinc-900 dark:text-zinc-100">Cast</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                                {details.cast.slice(0, 12).map((actor: CastMember) => (
                                    <Link
                                        key={actor.id}
                                        href={`/discover/actor/${actor.id}`}
                                        className="space-y-3 group cursor-pointer block"
                                    >
                                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-900 rounded-md">
                                            {actor.profile_path ? (
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                                                    alt={actor.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">No Image</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium group-hover:text-amber-600 transition-colors">{actor.name}</p>
                                            <p className="text-xs text-zinc-500">{actor.character}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {details.recommendations?.length > 0 && (
                        <div className="mt-12 -mx-6 md:-mx-12">
                            <CinematicRow
                                title="More Like This"
                                items={details.recommendations}
                                href="/discover"
                            />
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}