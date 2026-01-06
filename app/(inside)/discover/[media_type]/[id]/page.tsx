import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetails, getSeriesDetails, RichCinematicDetails } from '@/lib/actions/cinematic-actions';
import { getIsSaved } from '@/lib/actions/save-actions'; // ✨ IMPORT
import { getUserProfile } from '@/lib/data/user-data';
import SaveButton from '@/app/ui/save/SaveButton'; // ✨ IMPORT
import CinematicRow from '@/app/ui/discover/CinematicRow';
import { PlusIcon, FilmIcon, StarIcon, HashtagIcon } from '@heroicons/react/24/solid';
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

    // ✨ OPTIMIZATION: Fetch User, Details, and Saved Status in parallel
    const [userResult, details, isSaved] = await Promise.all([
        getUserProfile(),
        (media_type === 'movie' ? getMovieDetails(numericId) : getSeriesDetails(numericId)).catch((e) => {
            console.error("Fetch error:", e);
            return null;
        }),
        getIsSaved(media_type as 'movie' | 'series', numericId)
    ]);

    if (!details) notFound();

    const currentUser = userResult?.profile;
    const title = details.title;
    const releaseDate = details.release_date;
    const releaseYear = releaseDate?.split('-')[0] || 'N/A';
    const directorOrCreator = details.director || details.creator;

    const formatRuntime = (mins?: number) => mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : null;
    const runtimeString = details.runtime ? formatRuntime(details.runtime) : null;
    const seasonsString = details.number_of_seasons ? `${details.number_of_seasons} Seasons` : null;
    const rating = details.vote_average ? details.vote_average.toFixed(1) : 'NR';

    // Determine if we actually have a backdrop to render
    const hasBackdrop = !!(details.backdrop_path || (details.images?.backdrops?.length > 0));

    // Helper for provider logos
    const providers = details.watch_providers?.flatrate || [];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

            {/* Header */}
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <BackButton />
                    <div className="flex items-center gap-3">
                        {/* ✨ INJECTED SAVE BUTTON */}
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

            {/* Spacer if no backdrop */}
            {!hasBackdrop && <div className="h-10 w-full" />}

            <main className="pb-24">
                {/* Conditional Margin to create overlap effect if backdrop exists */}
                <div className={`relative z-10 max-w-7xl mx-auto px-6 ${hasBackdrop ? '-mt-48' : 'mt-8'}`}>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-24">

                        {/* LEFT COLUMN: Poster & Streaming Info */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Poster Card */}
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

                            {/* Streaming Providers */}
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
                                    {/* Status Badges */}
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

                            {/* Metadata */}
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

                            {/* Genres */}
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

                            {/* Overview */}
                            <div className="space-y-4 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                                <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Overview</h2>
                                <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-light">
                                    {details.overview || "No overview available."}
                                </p>
                            </div>

                            {/* Details Grid (Director, Release Date) */}
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

                            {/* Keywords (Moved to bottom) */}
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

                    {/* Cast Section (Clickable) */}
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

                    {/* Recommendations (Using Reusable CinematicRow) */}
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