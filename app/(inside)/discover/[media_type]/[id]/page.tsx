import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMovieDetails, getSeriesDetails } from '@/lib/actions/cinematic-actions';
import { getIsSaved } from '@/lib/actions/save-actions';
import { getUserProfile } from '@/lib/data/user-data';
import { getCinematicEngagement } from '@/lib/data/timeline-data';
import { createClient } from '@/utils/supabase/server';
import SaveButton from '@/app/ui/save/SaveButton';
import CinematicRow from '@/app/ui/discover/CinematicRow';
import ContentGuard from '@/app/ui/shared/ContentGuard';
import { PlusIcon, FilmIcon, StarIcon, HashtagIcon, CurrencyDollarIcon, LanguageIcon, BuildingOffice2Icon, TvIcon, GlobeAltIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { ShareButton, TrailerButton, BackdropGallery, CastCrewSwitcher } from './media-interactive';
import BackButton from './BackButton';

export const dynamic = 'force-dynamic';

export default async function SimpleDetailPage({
                                                   params
                                               }: {
    params: Promise<{ media_type: string; id: string }>
}) {
    const { media_type, id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId) || (media_type !== 'movie' && media_type !== 'tv')) notFound();

    // 1. Parallel Data Fetching
    // ✨ FIX: Added 'await' here because createClient is async in Next.js 15+
    const supabase = await createClient();

    const [userResult, authResult] = await Promise.all([
        getUserProfile(),
        supabase.auth.getUser()
    ]);

    const currentUser = userResult?.profile;
    const sessionUser = authResult.data.user;

    // 2. Determine Safety Preferences
    const userPreference = sessionUser?.user_metadata?.content_preference || 'sfw';
    const isSFW = userPreference === 'sfw';

    const [details, isSaved, engagement] = await Promise.all([
        (media_type === 'movie' ? getMovieDetails(numericId) : getSeriesDetails(numericId)).catch((e) => {
            console.error("Fetch error:", e);
            return null;
        }),
        getIsSaved(media_type as 'movie' | 'series', numericId),
        currentUser ? getCinematicEngagement(currentUser.id, media_type as 'movie' | 'tv', numericId) : null
    ]);

    if (!details) notFound();

    const isExplicit = details.adult;

    // --- Helpers ---
    const title = details.title;
    const showOriginalTitle = details.original_title && details.original_title !== title;
    const releaseDate = details.release_date;
    const releaseYear = releaseDate?.split('-')[0] || 'N/A';
    const directorOrCreator = details.director || details.creator || 'N/A';

    const formatRuntime = (mins?: number) => mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : null;
    const runtimeString = details.runtime ? formatRuntime(details.runtime) : null;
    const seasonsString = details.number_of_seasons ? `${details.number_of_seasons} Seasons` : null;
    const rating = details.vote_average ? details.vote_average.toFixed(1) : 'NR';
    const hasBackdrop = !!(details.backdrop_path || (details.images?.backdrops?.length > 0));
    const providers = details.watch_providers?.flatrate || [];

    const formatMoney = (amount?: number) => (amount && amount > 0)
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0, notation: 'compact' }).format(amount)
        : 'N/A';

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

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

            <ContentGuard isAdult={isExplicit} isSFW={isSFW}>
                <BackdropGallery
                    images={details.images?.backdrops || []}
                    fallbackPath={details.backdrop_path}
                />
            </ContentGuard>

            {!hasBackdrop && <div className="h-10 w-full" />}

            <main className="pb-24">
                <div className={`relative z-10 max-w-7xl mx-auto px-6 ${hasBackdrop ? '-mt-48' : 'mt-8'}`}>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
                        <div className="lg:col-span-2 space-y-6">

                            <ContentGuard isAdult={isExplicit} isSFW={isSFW}>
                                <div className="relative aspect-[2/3] w-full max-w-md mx-auto overflow-hidden bg-zinc-200 dark:bg-zinc-900 shadow-2xl group border-4 border-white dark:border-zinc-800 rounded-sm">
                                    {details.poster_path ? (
                                        <>
                                            <Image src={`https://image.tmdb.org/t/p/w500${details.poster_path}`} alt={title} fill className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" priority />
                                            <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/10 transition-colors duration-700 ease-in-out" />
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full"><FilmIcon className="w-16 h-16 text-zinc-400" /></div>
                                    )}
                                </div>
                            </ContentGuard>

                            {providers.length > 0 && (
                                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Streaming On</p>
                                    <div className="flex flex-wrap gap-3">
                                        {providers.map((p) => (
                                            <div key={p.provider_name} className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800" title={p.provider_name}>
                                                <Image src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} fill className="object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`lg:col-span-3 space-y-8 ${hasBackdrop ? 'lg:mt-56' : 'lg:mt-0'}`}>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {details.certification && details.certification !== 'NR' && <span className="px-2 py-1 border border-zinc-400 dark:border-zinc-600 text-xs font-bold rounded">{details.certification}</span>}
                                    {details.status && <span className={`text-xs font-bold px-2 py-1 rounded ${details.status === 'Ended' || details.status === 'Released' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'}`}>{details.status}</span>}
                                    {details.type && <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded">{details.type}</span>}
                                    {isExplicit && <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold rounded">EXPLICIT</span>}
                                </div>
                                <div>
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">{title}</h1>
                                    {showOriginalTitle && <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 font-serif italic mt-2">{details.original_title}</p>}
                                    {details.tagline && <p className="text-base md:text-lg text-zinc-400 font-light mt-2">{details.tagline}</p>}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                                <span className="font-medium">{releaseYear}</span>
                                {runtimeString && <><span className="text-zinc-400">·</span><span>{runtimeString}</span></>}
                                {seasonsString && <><span className="text-zinc-400">·</span><span>{seasonsString}</span></>}
                                {details.vote_average > 0 && <><span className="text-zinc-400">·</span><span className="inline-flex items-center gap-1.5 font-medium"><StarIcon className="w-4 h-4 text-amber-500" />{rating}</span></>}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <TrailerButton videos={details.videos || []} />
                                {currentUser ? (
                                    <Link href={`/profile/${currentUser.username}/timeline/create?item=${id}&type=${media_type}`} className="px-8 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all font-medium"><span className="flex items-center gap-2"><PlusIcon className="w-4 h-4" />Log Entry</span></Link>
                                ) : (
                                    <Link href={`/auth/login?item=${id}&type=${media_type}`} className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 transition-all font-medium">Log In to Add</Link>
                                )}
                            </div>

                            {engagement && (engagement.watchCount > 0 || engagement.friendEntries.length > 0) && (
                                <div className="py-6 border-y border-zinc-100 dark:border-zinc-900 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                    {engagement.watchCount > 0 && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full"><ClockIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-300" /></div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">You&apos;ve watched this <span className="font-bold">{engagement.watchCount} times</span>.</p>
                                                <p className="text-xs text-zinc-500 mt-1">Last watched on {formatDate(engagement.myEntries[0].watched_on)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {engagement.friendEntries.length > 0 && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full"><UserGroupIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-300" /></div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Watched by friends</p>
                                                <div className="flex flex-col gap-2 mt-2">
                                                    {engagement.friendEntries.slice(0, 3).map(entry => (
                                                        <Link key={entry.id} href={`/profile/${entry.profiles.username}`} className="flex items-center gap-2 group">
                                                            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700"><Image src={entry.profiles.profile_pic_url || '/placeholder-user.jpg'} alt={entry.profiles.username} fill className="object-cover" /></div>
                                                            <span className="text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors"><span className="font-semibold text-zinc-800 dark:text-zinc-200">@{entry.profiles.username}</span>{entry.rating ? ` rated it ${entry.rating}` : ' logged it'}<span className="text-zinc-400 mx-1">•</span>{formatDate(entry.watched_on)}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4 py-4">
                                <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Overview</h3>
                                <p className="text-lg text-zinc-800 dark:text-zinc-200 leading-relaxed font-light">{details.overview || "No overview available."}</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-zinc-200 dark:border-zinc-800">
                                <div className="col-span-1">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{media_type === 'movie' ? 'Director' : 'Creator'}</p>
                                    <p className="font-semibold text-sm">{directorOrCreator}</p>
                                </div>
                                <div className="col-span-1">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 flex items-center gap-1"><GlobeAltIcon className="w-3 h-3"/> Country</p>
                                    <p className="font-medium text-sm text-zinc-600 dark:text-zinc-400">{details.origin_country && details.origin_country.length > 0 ? details.origin_country.join(', ') : 'N/A'}</p>
                                </div>
                                <div className="col-span-1">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 flex items-center gap-1"><CurrencyDollarIcon className="w-3 h-3"/> Budget</p>
                                    <p className="font-medium text-sm text-zinc-600 dark:text-zinc-400">{media_type === 'movie' ? formatMoney(details.budget) : 'N/A'}</p>
                                </div>
                                <div className="col-span-1">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 flex items-center gap-1"><CurrencyDollarIcon className="w-3 h-3"/> Revenue</p>
                                    <p className="font-medium text-sm text-green-600 dark:text-green-500">{media_type === 'movie' ? formatMoney(details.revenue) : 'N/A'}</p>
                                </div>
                                {media_type === 'tv' && (
                                    <div className="col-span-2">
                                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 flex items-center gap-1"><TvIcon className="w-3 h-3"/> Networks</p>
                                        <div className="flex flex-wrap gap-2">
                                            {details.networks && details.networks.length > 0 ? details.networks.slice(0, 3).map(n => (
                                                <div key={n.name} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                                    {n.logo_path && <Image src={`https://image.tmdb.org/t/p/w200${n.logo_path}`} alt={n.name} width={20} height={20} className="object-contain" />}
                                                    <span className="text-xs font-medium">{n.name}</span>
                                                </div>
                                            )) : <span className="text-sm text-zinc-500">N/A</span>}
                                        </div>
                                    </div>
                                )}
                                <div className="col-span-1">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 flex items-center gap-1"><LanguageIcon className="w-3 h-3"/> Language</p>
                                    <p className="font-medium text-sm text-zinc-600 dark:text-zinc-400 uppercase">{details.original_language || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1"><BuildingOffice2Icon className="w-3 h-3"/> Production</p>
                                <div className="flex flex-wrap items-center gap-4">
                                    {details.production_companies && details.production_companies.length > 0 ? details.production_companies.slice(0, 4).map(c => (
                                        <div key={c.id} className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity" title={c.name}>
                                            {c.logo_path ? <Image src={`https://image.tmdb.org/t/p/w200${c.logo_path}`} alt={c.name} width={60} height={30} className="object-contain dark:invert" /> : <span className="text-xs font-medium text-zinc-500">{c.name}</span>}
                                        </div>
                                    )) : <span className="text-sm text-zinc-500">N/A</span>}
                                </div>
                            </div>

                            {details.keywords?.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {details.keywords.slice(0, 8).map((k) => (
                                        <Link key={k.id} href={`/search?query=${k.name}`} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 text-[10px] text-zinc-500 dark:text-zinc-400 rounded-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">#{k.name}</Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-24">
                        <CastCrewSwitcher cast={details.cast} crew={details.crew} />
                    </div>

                    {details.recommendations?.length > 0 && (
                        <div className="mt-12 -mx-6 md:-mx-12">
                            <CinematicRow title="More Like This" items={details.recommendations} href="/discover" />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}