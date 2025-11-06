import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetails, getSeriesDetails } from '@/lib/actions/cinematic-actions';
import {
    CalendarIcon,
    UserIcon,
    FilmIcon,
    TvIcon,
    PlusIcon,
    SparklesIcon,
    UserGroupIcon,
    ClockIcon,
    CheckBadgeIcon,
    TagIcon
} from '@heroicons/react/24/solid';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Type definitions matching your server action returns
interface Genre {
    id: number;
    name: string;
}

interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
}

// Base structure returned by both getMovieDetails and getSeriesDetails
interface BaseMediaDetails {
    title: string; // Both return 'title'
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    genres: Genre[];
    cast: CastMember[];
}

interface MovieDetails extends BaseMediaDetails {
    director: string;
    runtime?: number;
    status?: string;
}

interface SeriesDetails extends BaseMediaDetails {
    creator: string;
    number_of_seasons?: number;
    status?: string;
}

type MediaDetails = MovieDetails | SeriesDetails;

// Define animation styles directly in the component
const CustomStyles = () => (
    <style>
        {`
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideInUp {
                from { 
                    opacity: 0;
                    transform: translateY(20px); 
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes subtleZoom {
                from { transform: scale(1.05); }
                to { transform: scale(1); }
            }
            
            .animate-fade-in {
                animation: fadeIn 0.8s ease-out forwards;
            }
            .animate-slide-in-up {
                opacity: 0;
                animation: slideInUp 0.7s ease-out forwards;
            }
            .animate-subtle-zoom {
                animation: subtleZoom 15s ease-out forwards;
            }
            
            /* Staggered delays */
            .delay-100 { animation-delay: 0.1s; }
            .delay-200 { animation-delay: 0.2s; }
            .delay-300 { animation-delay: 0.3s; }
            .delay-400 { animation-delay: 0.4s; }
            .delay-500 { animation-delay: 0.5s; }
            .delay-700 { animation-delay: 0.7s; }

            /* Custom text shadow for title */
            .text-shadow-xl {
                text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
            }

            /* Hide scrollbar for cast */
            .no-scrollbar::-webkit-scrollbar {
                display: none;
            }
            .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `}
    </style>
);

export default async function CinematicDetailPage({
                                                      params
                                                  }: {
    params: Promise<{ media_type: string; id: string }>
}) {
    const { media_type, id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId) || (media_type !== 'movie' && media_type !== 'tv')) {
        notFound();
    }

    let details: MediaDetails;
    try {
        if (media_type === 'movie') {
            details = await getMovieDetails(numericId) as MovieDetails;
        } else {
            details = await getSeriesDetails(numericId) as SeriesDetails;
        }
    } catch (error) {
        console.error("Error fetching details:", error);
        notFound();
    }

    if (!details) {
        notFound();
    }

    // Both movie and series have 'title' in your API response
    const title = details.title;
    const releaseDate = details.release_date;
    const releaseYear = releaseDate?.split('-')[0];

    // Use type guard to determine if it's a movie or series
    const directorOrCreator = 'director' in details ? details.director : details.creator;

    // Helper function for Stat Card
    const StatCard = ({
                          icon,
                          title,
                          value
                      }: {
        icon: React.ReactNode;
        title: string;
        value: string | number;
    }) => (
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-lg dark:hover:shadow-zinc-950">
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {title}
                </h3>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {value}
            </p>
        </div>
    );

    // Helper for Genre Tags
    const GenreTags = ({ genres }: { genres: Genre[] }) => (
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-lg dark:hover:shadow-zinc-950">
            <div className="flex items-center gap-3 mb-4">
                <TagIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Genres
                </h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                    <span
                        key={genre.id}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-default"
                    >
                        {genre.name}
                    </span>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <CustomStyles />
            <main className="min-h-screen bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 overflow-x-hidden">
                {/* --- HERO SECTION --- */}
                <div className="relative h-[90vh] md:h-[85vh] w-full overflow-hidden">
                    {/* Backdrop Image */}
                    <div className="absolute inset-0">
                        {details.backdrop_path ? (
                            <Image
                                src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
                                alt={`Backdrop for ${title}`}
                                fill
                                className="object-cover animate-subtle-zoom"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full bg-zinc-900" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/30 to-transparent" />
                    </div>

                    {/* Hero Content */}
                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-16">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                            {/* Poster */}
                            <div className="relative h-64 w-44 md:h-72 md:w-48 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 animate-slide-in-up">
                                {details.poster_path ? (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                                        alt={`Poster for ${title}`}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                        <FilmIcon className="w-12 h-12 text-zinc-600" />
                                    </div>
                                )}
                            </div>

                            {/* Text Info */}
                            <div className="flex-1 space-y-3 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3 animate-slide-in-up delay-100">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        media_type === 'movie'
                                            ? 'bg-blue-500/20 text-blue-300'
                                            : 'bg-green-500/20 text-green-300'
                                    }`}>
                                        {media_type === 'movie' ? (
                                            <FilmIcon className="w-4 h-4" />
                                        ) : (
                                            <TvIcon className="w-4 h-4" />
                                        )}
                                        {media_type === 'movie' ? 'Movie' : 'TV Series'}
                                    </span>
                                    {releaseYear && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-bold">
                                            <CalendarIcon className="w-4 h-4" /> {releaseYear}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight text-shadow-xl animate-slide-in-up delay-200">
                                    {title}
                                </h1>

                                {directorOrCreator && directorOrCreator !== 'N/A' && (
                                    <p className="text-lg md:text-xl text-white/70 font-medium flex items-center justify-center md:justify-start gap-2 animate-slide-in-up delay-300">
                                        <UserIcon className="w-5 h-5 opacity-70" />
                                        {media_type === 'movie' ? 'Directed by' : 'Created by'}{' '}
                                        <span className="text-white">{directorOrCreator}</span>
                                    </p>
                                )}

                                <div className="pt-4 animate-slide-in-up delay-400">
                                    <Link
                                        href="/auth/login"
                                        className="inline-flex items-center gap-2.5 px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-rose-600/40 active:scale-100 shadow-md shadow-rose-600/20"
                                    >
                                        <PlusIcon className="w-6 h-6" />
                                        Log Entry
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- DETAILS SECTION --- */}
                <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 space-y-16">
                    {/* Stats Grid */}
                    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-slide-in-up delay-100">
                        <StatCard
                            icon={<CalendarIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
                            title="Release Year"
                            value={releaseYear || 'N/A'}
                        />
                        <StatCard
                            icon={<CheckBadgeIcon className="w-5 h-5 text-green-500 dark:text-green-400" />}
                            title="Status"
                            value={details.status || 'N/A'}
                        />
                        {media_type === 'movie' && 'runtime' in details && details.runtime ? (
                            <StatCard
                                icon={<ClockIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
                                title="Runtime"
                                value={`${details.runtime} min`}
                            />
                        ) : media_type === 'tv' && 'number_of_seasons' in details && details.number_of_seasons ? (
                            <StatCard
                                icon={<TvIcon className="w-5 h-5 text-green-500 dark:text-green-400" />}
                                title="Seasons"
                                value={details.number_of_seasons}
                            />
                        ) : (
                            <div className="hidden md:block"></div>
                        )}

                        {/* Genres Card (spans 2 cols on mobile) */}
                        {details.genres && details.genres.length > 0 && (
                            <div className="col-span-2">
                                <GenreTags genres={details.genres} />
                            </div>
                        )}
                    </section>

                    {/* Synopsis */}
                    <section className="animate-slide-in-up delay-200">
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                            <SparklesIcon className="w-7 h-7 text-amber-500" /> Synopsis
                        </h2>
                        <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 prose dark:prose-invert max-w-none">
                            {details.overview || "No synopsis available."}
                        </p>
                    </section>

                    {/* Top Cast */}
                    {details.cast && details.cast.length > 0 && (
                        <section className="animate-slide-in-up delay-300">
                            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                                <UserGroupIcon className="w-7 h-7 text-blue-500" /> Top Cast
                            </h2>
                            <div className="flex gap-4 overflow-x-auto py-4 -mx-6 px-6 no-scrollbar">
                                {details.cast.map((person) => (
                                    <div key={person.id} className="flex-shrink-0 w-36 text-center group">
                                        <div className="relative w-36 h-48 rounded-lg overflow-hidden mb-2 shadow-lg border border-zinc-200 dark:border-zinc-800">
                                            {person.profile_path ? (
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                                    alt={person.name}
                                                    fill
                                                    className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                    <UserIcon className="w-10 h-10 text-zinc-400 dark:text-zinc-600" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="font-bold text-sm truncate">{person.name}</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                            {person.character}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </>
    );
}