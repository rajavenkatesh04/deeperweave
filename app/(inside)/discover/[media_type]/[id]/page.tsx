import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetails, getSeriesDetails } from '@/lib/actions/cinematic-actions';
import {
    ArrowLeftIcon,
    StarIcon,
    PlayIcon,
    PlusIcon,
    FilmIcon,
    ShareIcon,
    BookmarkIcon,
} from '@heroicons/react/24/solid';
import { HeartIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

interface Genre { id: number; name: string; }
interface CastMember { id: number; name: string; character: string; profile_path: string | null; }
interface MediaDetails {
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    genres: Genre[];
    cast: CastMember[];
    vote_average?: number;
    director?: string;
    runtime?: number;
    creator?: string;
    number_of_seasons?: number;
    status?: string;
    tagline?: string;
}

export default async function SimpleDetailPage({
                                                   params
                                               }: {
    params: Promise<{ media_type: string; id: string }>
}) {
    const { media_type, id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId) || (media_type !== 'movie' && media_type !== 'tv')) notFound();

    let details: any;
    try {
        if (media_type === 'movie') details = await getMovieDetails(numericId);
        else details = await getSeriesDetails(numericId);
    } catch (error) {
        console.error(error);
        notFound();
    }

    if (!details) notFound();

    const title = details.title || details.name;
    const releaseDate = details.release_date || details.first_air_date;
    const releaseYear = releaseDate?.split('-')[0] || 'N/A';
    const directorOrCreator = details.director || details.creator || (details.created_by?.[0]?.name);

    const formatRuntime = (mins?: number) => mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : null;
    const runtimeString = details.runtime ? formatRuntime(details.runtime) : null;
    const seasonsString = details.number_of_seasons ? `${details.number_of_seasons} Seasons` : null;
    const rating = details.vote_average ? details.vote_average.toFixed(1) : 'NR';

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

            {/* Simple Header */}
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/discover"
                        className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </Link>

                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                            <ShareIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                        </button>
                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                            <BookmarkIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                        </button>
                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                            <HeartIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Backdrop Section with Auto-Scroll */}
            {details.backdrop_path && (
                <div className="relative w-full h-[35rem] bg-zinc-200 dark:bg-zinc-900 overflow-hidden group">
                    <div className="relative w-full h-full">
                        <Image
                            src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
                            alt="Backdrop"
                            fill
                            // UPDATED: opacity-100 for Light mode (crisp), opacity-60 for Dark mode (moody)
                            className="object-cover opacity-100 dark:opacity-60 transition-opacity duration-700"
                            priority
                        />
                    </div>
                    {/* UPDATED: Gradient classes now have 'dark:' prefix, so they don't appear in light mode */}
                    <div className="absolute inset-0 dark:bg-gradient-to-b dark:from-transparent dark:via-transparent dark:to-zinc-950" />
                </div>
            )}

            {/* Main Content */}
            <main className="pb-24">
                {/* Main Container - Keeps the overlap layout */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 -mt-48">

                    {/* Hero Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-24">

                        {/* Poster - Remains High Up (-mt-48 from parent applies here visually) */}
                        <div className="lg:col-span-2">
                            <div className="relative aspect-[2/3] w-full max-w-md mx-auto overflow-hidden bg-zinc-200 dark:bg-zinc-900 shadow-2xl group border-4 border-white dark:border-zinc-800 rounded-sm">
                                {details.poster_path ? (
                                    <>
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                                            alt={title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/10 transition-colors duration-500" />
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full">
                                        <FilmIcon className="w-16 h-16 text-zinc-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info - UPDATED: Pushed down to clear the backdrop image */}
                        <div className="lg:col-span-3 space-y-8 lg:mt-56">

                            {/* Title */}
                            <div className="space-y-3">
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
                                {runtimeString && (
                                    <>
                                        <span className="text-zinc-400 dark:text-zinc-600">·</span>
                                        <span>{runtimeString}</span>
                                    </>
                                )}
                                {seasonsString && (
                                    <>
                                        <span className="text-zinc-400 dark:text-zinc-600">·</span>
                                        <span>{seasonsString}</span>
                                    </>
                                )}
                                {details.vote_average && (
                                    <>
                                        <span className="text-zinc-400 dark:text-zinc-600">·</span>
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
                                    {details.genres.map((g: Genre) => (
                                        <span
                                            key={g.id}
                                            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-medium"
                                        >
                                            {g.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-3">
                                <button className="group px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all font-medium relative overflow-hidden">
                                    <span className="flex items-center gap-2 relative z-10">
                                        <PlayIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                                        Watch Trailer
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                </button>
                                <Link
                                    href={`/log?item=${id}&type=${media_type}`}
                                    className="px-8 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all font-medium"
                                >
                                    <span className="flex items-center gap-2">
                                        <PlusIcon className="w-4 h-4" />
                                        Log Entry
                                    </span>
                                </Link>
                            </div>

                            {/* Overview */}
                            <div className="space-y-4 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                                <h2 className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-semibold">
                                    Overview
                                </h2>
                                <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-light">
                                    {details.overview || "No overview available."}
                                </p>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                                {directorOrCreator && (
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-semibold">
                                            {media_type === 'movie' ? 'Director' : 'Creator'}
                                        </p>
                                        <p className="text-zinc-900 dark:text-zinc-100 font-medium">{directorOrCreator}</p>
                                    </div>
                                )}
                                {releaseDate && (
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-semibold">
                                            Release Date
                                        </p>
                                        <p className="text-zinc-900 dark:text-zinc-100 font-medium">{releaseDate}</p>
                                    </div>
                                )}
                                {details.status && (
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-semibold">
                                            Status
                                        </p>
                                        <p className="text-zinc-900 dark:text-zinc-100 font-medium">{details.status}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Cast Section */}
                    {details.cast?.length > 0 && (
                        <div className="space-y-8">
                            <h2 className="text-3xl font-light text-zinc-900 dark:text-zinc-100">Cast</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                                {details.cast.slice(0, 12).map((actor: CastMember) => (
                                    <div key={actor.id} className="space-y-3 group cursor-pointer">
                                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-900">
                                            {actor.profile_path ? (
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                                                    alt={actor.name}
                                                    fill
                                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-xs text-zinc-400">No Image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{actor.name}</p>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-500">{actor.character}</p>
                                        </div>
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