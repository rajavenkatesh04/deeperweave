import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetails, getSeriesDetails } from '@/lib/actions/cinematic-actions';
import {
    CalendarIcon,
    UserIcon,
    PlusIcon,
    ClockIcon,
    TvIcon,
    ArrowLeftIcon,
    FilmIcon
} from '@heroicons/react/24/solid';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// --- TYPES ---
interface Genre { id: number; name: string; }
interface CastMember { id: number; name: string; character: string; profile_path: string | null; }
interface BaseMediaDetails {
    title: string; overview: string; poster_path: string | null; backdrop_path: string | null;
    release_date: string; genres: Genre[]; cast: CastMember[];
}
interface MovieDetails extends BaseMediaDetails { director: string; runtime?: number; status?: string; }
interface SeriesDetails extends BaseMediaDetails { creator: string; number_of_seasons?: number; status?: string; }
type MediaDetails = MovieDetails | SeriesDetails;

// --- STYLES & ANIMATIONS ---
const CustomStyles = () => (
    <style>
        {`
            @keyframes subtleZoom {
                0% { transform: scale(1); }
                100% { transform: scale(1.1); }
            }
            .animate-slow-zoom {
                animation: subtleZoom 20s infinite alternate linear;
            }
            .glass-panel {
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .text-glow {
                text-shadow: 0 0 20px rgba(255,255,255,0.3);
            }
        `}
    </style>
);

// --- HELPER COMPONENTS ---
const MetaPill = ({ icon, text }: { icon?: React.ReactNode; text: string | number }) => (
    <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-zinc-300 bg-white/10 px-3 py-1.5 rounded-md border border-white/5 hover:bg-white/20 transition-colors cursor-default">
        {icon && <span className="w-4 h-4 text-zinc-400">{icon}</span>}
        <span>{text}</span>
    </div>
);

const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-l-4 border-rose-600 pl-4">
        {title}
    </h3>
);

export default async function CinematicDetailPage({
                                                      params
                                                  }: {
    params: Promise<{ media_type: string; id: string }>
}) {
    const { media_type, id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId) || (media_type !== 'movie' && media_type !== 'tv')) notFound();

    let details: MediaDetails;
    try {
        if (media_type === 'movie') details = await getMovieDetails(numericId) as MovieDetails;
        else details = await getSeriesDetails(numericId) as SeriesDetails;
    } catch (error) {
        console.error(error);
        notFound();
    }

    if (!details) notFound();

    const title = details.title;
    const releaseYear = details.release_date?.split('-')[0] || 'N/A';
    const directorOrCreator = 'director' in details ? details.director : details.creator;
    const formatRuntime = (mins?: number) => mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : null;
    const runtimeString = 'runtime' in details ? formatRuntime(details.runtime) : null;

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-rose-600/40">
            <CustomStyles />

            {/* --- FIXED BACKGROUND (The "Kick") --- */}
            <div className="fixed inset-0 z-0 w-full h-full overflow-hidden pointer-events-none">
                {details.backdrop_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
                        alt="Background"
                        fill
                        className="object-cover opacity-40 animate-slow-zoom"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-900" />
                )}
                {/* Heavy Vignette for focus */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-[#050505]/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
            </div>

            {/* --- CONTENT LAYER --- */}
            <div className="relative mt-60 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                {/* Navbar */}
                <nav className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
                        <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </div>
                        <span className="font-medium tracking-wide">Back to Browse</span>
                    </Link>
                </nav>

                {/* Responsive Flex Layout */}
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

                    {/* LEFT COLUMN: Sticky on Desktop, Static on Mobile */}
                    <div className="w-full lg:w-1/4 flex-shrink-0 flex flex-col gap-6 lg:sticky lg:top-8">
                        {/* Poster */}
                        <div className="relative aspect-[2/3] w-full max-w-sm mx-auto lg:max-w-full rounded-xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10 group">
                            {details.poster_path ? (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w780${details.poster_path}`}
                                    alt={`Poster for ${title}`}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                    <FilmIcon className="w-20 h-20 text-zinc-600" />
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <Link
                            href="/auth/login"
                            className="w-full max-w-sm mx-auto lg:max-w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-600/20 transition-all transform hover:-translate-y-1 active:translate-y-0"
                        >
                            <PlusIcon className="w-6 h-6" />
                            <span>Log to Diary</span>
                        </Link>
                    </div>

                    {/* RIGHT COLUMN: Scrollable Info */}
                    <div className="flex-1 w-full min-w-0">

                        {/* Header */}
                        <div className="mb-10 animate-in slide-in-from-bottom-4 duration-700 fade-in">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 text-glow leading-none">
                                {title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                    media_type === 'movie'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-green-600 text-white'
                                }`}>
                                    {media_type === 'movie' ? 'MOVIE' : 'TV SERIES'}
                                </span>

                                <MetaPill icon={<CalendarIcon />} text={releaseYear} />
                                {runtimeString && <MetaPill icon={<ClockIcon />} text={runtimeString} />}
                                {details.status && <MetaPill text={details.status} />}
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-400 font-medium">
                                {details.genres.map((g, i) => (
                                    <span key={g.id} className="text-zinc-300 hover:text-rose-500 transition-colors cursor-default">
                                        {g.name}
                                        {i < details.genres.length - 1 && <span className="ml-4 text-zinc-600">/</span>}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Synopsis & Director */}
                        <div className="glass-panel p-6 md:p-8 rounded-2xl mb-12 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FilmIcon className="w-24 h-24 text-white" />
                            </div>

                            {directorOrCreator && (
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                        <UserIcon className="w-6 h-6 text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-0.5">
                                            {media_type === 'movie' ? 'Directed by' : 'Created by'}
                                        </p>
                                        <p className="text-lg font-bold text-white leading-none">{directorOrCreator}</p>
                                    </div>
                                </div>
                            )}

                            <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-3">Synopsis</h3>
                            <p className="text-lg leading-relaxed text-zinc-200 font-light">
                                {details.overview || "No synopsis available."}
                            </p>
                        </div>

                        {/* THE "WILD" CAST GRID */}
                        {details.cast && details.cast.length > 0 && (
                            <div className="animate-in slide-in-from-bottom-8 duration-700 fade-in delay-200">
                                <SectionTitle title="Top Cast" />

                                {/* RESPONSIVE GRID LOGIC:
                                   - Mobile: 2 columns (big enough to see)
                                   - Tablet: 3 columns
                                   - Desktop: 4 columns
                                */}
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {details.cast.slice(0, 12).map((actor) => (
                                        <div key={actor.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-rose-900/20 transition-all duration-300">
                                            {/* Actor Image - High Res */}
                                            {actor.profile_path ? (
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
                                                    alt={actor.name}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                                                    <UserIcon className="w-12 h-12" />
                                                </div>
                                            )}

                                            {/* Hover Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {/* Info Slide-Up Animation */}
                                            <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/90 to-transparent">
                                                <p className="text-white font-bold text-base leading-tight">
                                                    {actor.name}
                                                </p>
                                                <p className="text-rose-500 text-xs font-bold uppercase tracking-wider mt-1 truncate">
                                                    {actor.character}
                                                </p>
                                            </div>

                                            {/* Static Name Label (Visible when NOT hovering for mobile usability) */}
                                            <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent md:hidden">
                                                <p className="text-white text-sm font-bold truncate">{actor.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {details.cast.length > 12 && (
                                    <div className="mt-8 text-center">
                                        <button className="text-sm font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
                                            View Full Cast +
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}