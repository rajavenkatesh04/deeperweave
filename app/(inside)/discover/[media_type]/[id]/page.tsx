import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetails, getSeriesDetails } from '@/lib/actions/cinematic-actions';
import { ArrowLeftIcon, StarIcon, PlusIcon, FilmIcon } from '@heroicons/react/24/solid';
// Import the new components
import { ShareButton, TrailerButton, BackdropGallery } from './media-interactive';
import BackButton from "./BackButton";

export const dynamic = 'force-dynamic';

interface Genre { id: number; name: string; }
interface CastMember { id: number; name: string; character: string; profile_path: string | null; }

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

            {/* Header with Functional Share Button */}
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <BackButton />

                    <div className="flex items-center gap-2">
                        <ShareButton />
                    </div>
                </div>
            </header>

            {/* Backdrop Section (Auto-Scroll + Soft Hover) */}
            {/* We pass the images array fetched from the API update */}
            <BackdropGallery
                images={details.images?.backdrops || []}
                fallbackPath={details.backdrop_path}
            />

            <main className="pb-24">
                <div className="relative z-10 max-w-7xl mx-auto px-6 -mt-48">

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-24">
                        {/* Poster - Added Soft Hover Effect */}
                        <div className="lg:col-span-2">
                            <div className="relative aspect-[2/3] w-full max-w-md mx-auto overflow-hidden bg-zinc-200 dark:bg-zinc-900 shadow-2xl group border-4 border-white dark:border-zinc-800 rounded-sm">
                                {details.poster_path ? (
                                    <>
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                                            alt={title}
                                            fill
                                            // Soft, graceful hover using ease-in-out and longer duration
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
                        </div>

                        <div className="lg:col-span-3 space-y-8 lg:mt-56">
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
                                {runtimeString && <><span className="text-zinc-400">·</span><span>{runtimeString}</span></>}
                                {seasonsString && <><span className="text-zinc-400">·</span><span>{seasonsString}</span></>}
                                {details.vote_average && (
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
                                    {details.genres.map((g: Genre) => (
                                        <span key={g.id} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-medium">
                                            {g.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Actions with Functional Trailer Button */}
                            <div className="flex flex-wrap items-center gap-3">
                                <TrailerButton videos={details.videos?.results || []} />

                                <Link
                                    href={`/log?item=${id}&type=${media_type}`}
                                    className="px-8 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all font-medium"
                                >
                                    <span className="flex items-center gap-2">
                                        <PlusIcon className="w-4 h-4" />
                                        Log Entry
                                    </span>
                                </Link>
                            </div>

                            {/* Overview */}
                            <div className="space-y-4 pt-8 border-t border-zinc-200 dark:border-zinc-800">
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
                                                <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">No Image</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{actor.name}</p>
                                            <p className="text-sm text-zinc-500">{actor.character}</p>
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