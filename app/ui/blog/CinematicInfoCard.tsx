'use client';

import { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
// ✨ 1. IMPORT from your 'cinematic-actions' library
import { getMovieDetails, getSeriesDetails } from '@/lib/actions/cinematic-actions';
import { UserGroupIcon, XMarkIcon, FilmIcon, TvIcon } from '@heroicons/react/24/solid'; // ✨ 2. Added TvIcon
import LoadingSpinner from '@/app/ui/loading-spinner';
import { Movie, Series } from '@/lib/definitions'; // ✨ 3. Imported Movie and Series

// ✨ 4. Created a unified type for API details
type ApiDetails = {
    overview: string;
    cast: { name: string; profile_path: string; character: string }[];
    genres: { id: number; name: string }[];
    director?: string;
    creator?: string;
    number_of_seasons?: number;
};

// ✨ 5. Updated Props
interface CinematicInfoCardProps {
    tmdbId: number;
    initialData: Movie | Series; // Now accepts Movie or Series
    mediaType: 'movie' | 'tv';  // This prop is required
    isOpen?: boolean;
    onClose?: () => void;
}

export default function CinematicInfoCard({
                                              tmdbId,
                                              initialData,
                                              mediaType,
                                              isOpen,
                                              onClose
                                          }: CinematicInfoCardProps) {
    const isControlled = typeof isOpen !== 'undefined' && typeof onClose !== 'undefined';
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [apiDetails, setApiDetails] = useState<ApiDetails | null>(null);
    const [isPending, startTransition] = useTransition();

    const isModalOpen = isControlled ? isOpen : internalIsOpen;

    // ✨ 6. Updated useEffect to fetch based on mediaType
    useEffect(() => {
        if (isModalOpen && !apiDetails) {
            startTransition(async () => {
                try {
                    if (mediaType === 'movie') {
                        const movieDetails = await getMovieDetails(tmdbId);
                        setApiDetails(movieDetails);
                    } else if (mediaType === 'tv') {
                        const seriesDetails = await getSeriesDetails(tmdbId);
                        setApiDetails(seriesDetails);
                    }
                } catch (error) {
                    console.error("Failed to fetch cinematic details from API:", error);
                }
            });
        } else if (!isModalOpen) {
            setApiDetails(null);
        }
    }, [isModalOpen, tmdbId, apiDetails, startTransition, mediaType]);

    const handleOpen = () => {
        if (!isControlled) {
            setInternalIsOpen(true);
        }
    };

    const handleClose = () => {
        if (isControlled) {
            onClose();
        } else {
            setInternalIsOpen(false);
        }
    };

    // ✨ 7. Unified displayDetails
    const displayDetails = {
        ...initialData,
        ...apiDetails
    };

    return (
        <>
            {/* --- Uncontrolled Button (Uses initialData) --- */}
            {!isControlled && (
                <div className="my-6 relative ">
                    <button
                        onClick={handleOpen}
                        className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 p-4 md:p-6 text-left shadow-lg ring-2 ring-blue-100/40 backdrop-blur-sm transition-all duration-500 hover:scale-[1.01] hover:shadow-xl hover:ring-blue-300/60 dark:from-slate-900/95 dark:via-blue-950/30 dark:to-indigo-950/40 dark:ring-blue-800/40 dark:hover:ring-blue-500/60"
                    >
                        {/* ... (rest of the button styling) ... */}
                        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                            {initialData.poster_url && (
                                <div className="relative flex-shrink-0">
                                    <div className="overflow-hidden rounded-xl shadow-lg ring-2 ring-white/40 transition-all duration-500 group-hover:scale-105 group-hover:ring-blue-200/60 dark:ring-slate-700/40 dark:group-hover:ring-blue-400/40">
                                        <Image src={initialData.poster_url} alt={`Poster for ${initialData.title}`} width={80} height={120} className="md:w-24 md:h-36 object-cover" />
                                    </div>
                                    <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 opacity-0 blur transition-opacity duration-500 group-hover:opacity-40" />
                                    {/* ✨ 8. Conditional Icon on button */}
                                    <div className={`absolute -bottom-1 -right-1 rounded-full p-1.5 shadow-md ring-2 ring-white dark:ring-slate-800 ${mediaType === 'movie' ? 'bg-blue-600 dark:bg-blue-500' : 'bg-green-600 dark:bg-green-500'}`}>
                                        {mediaType === 'movie' ? <FilmIcon className="h-3 w-3 text-white" /> : <TvIcon className="h-3 w-3 text-white" />}
                                    </div>
                                </div>
                            )}
                            <div className="flex-grow text-center md:text-left">
                                <div className="mb-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-100/80 via-orange-100/60 to-amber-100/80 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 ring-1 ring-amber-200/50 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-amber-900/40 dark:text-amber-300 dark:ring-amber-700/30">
                                        <FilmIcon className="h-2.5 w-2.5" /> In this post
                                    </span>
                                </div>
                                <h3 className="mb-2 text-2xl md:text-3xl font-bold leading-tight tracking-tight text-slate-900 transition-colors duration-500 group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-400">{initialData.title || 'N/A'}</h3>
                                <p className="mb-3 md:mb-4 text-sm md:text-base text-slate-600 dark:text-slate-400">Released: <span className="font-semibold">{initialData.release_date || 'N/A'}</span></p>
                                {/* ... (rest of the button) ... */}
                            </div>
                        </div>
                    </button>
                    {/* ... */}
                </div>
            )}

            {/* --- Modal --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 md:p-4 backdrop-blur-xl animate-fade-in" onClick={handleClose}>
                    <div className="relative flex flex-col w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] transform rounded-2xl md:rounded-3xl bg-white/96 shadow-2xl ring-2 ring-black/10 backdrop-blur-2xl transition-all dark:bg-slate-900/96 dark:ring-white/10" onClick={(e) => e.stopPropagation()}>
                        <button onClick={handleClose} className="absolute right-3 top-3 md:right-6 md:top-6 z-20 rounded-full bg-slate-100/90 p-2 md:p-3 text-slate-500 transition-all duration-200 hover:bg-slate-200 hover:text-slate-900 hover:scale-110 dark:bg-slate-800/90 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white">
                            <XMarkIcon className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                        <div className="flex-grow overflow-y-auto p-4 md:p-8">
                            <div className="mb-6 md:mb-8 text-center">
                                {/* ✨ 9. Conditional Header */}
                                <div className={`inline-flex items-center gap-2 rounded-full px-3 md:px-4 py-1.5 md:py-2 ${
                                    mediaType === 'movie'
                                        ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30'
                                        : 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30'
                                }`}>
                                    {mediaType === 'movie' ? (
                                        <FilmIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                                    ) : (
                                        <TvIcon className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
                                    )}
                                    <span className={`text-xs md:text-sm font-semibold uppercase tracking-wide ${
                                        mediaType === 'movie'
                                            ? 'text-blue-700 dark:text-blue-300'
                                            : 'text-green-700 dark:text-green-300'
                                    }`}>
                                        {mediaType === 'movie' ? 'Featured Movie Details' : 'Featured Series Details'}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
                                <div className="lg:col-span-1">
                                    {displayDetails.poster_url && (
                                        <div className="group relative mb-4 md:mb-6 overflow-hidden rounded-xl md:rounded-2xl shadow-xl ring-2 md:ring-4 ring-black/10 dark:ring-white/10 max-w-xs mx-auto lg:max-w-none">
                                            <Image src={displayDetails.poster_url.replace('w500', 'w780')} alt={`Poster for ${displayDetails.title}`} width={300} height={450} className="w-full object-cover" />
                                        </div>
                                    )}
                                    <div className="space-y-3 md:space-y-4">
                                        {/* ✨ 10. Conditional Director/Creator Field */}
                                        <div className="rounded-lg md:rounded-xl bg-slate-50 p-3 md:p-4 dark:bg-slate-800/50">
                                            <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-1 text-sm md:text-base">
                                                {mediaType === 'movie' ? 'Director' : 'Creator'}
                                            </h4>
                                            <p className="text-slate-800 dark:text-slate-200 text-sm md:text-base">
                                                {displayDetails.director || displayDetails.creator || 'N/A'}
                                            </p>
                                        </div>
                                        {/* ✨ 11. Added Seasons Field */}
                                        {displayDetails.number_of_seasons && (
                                            <div className="rounded-lg md:rounded-xl bg-slate-50 p-3 md:p-4 dark:bg-slate-800/50">
                                                <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-1 text-sm md:text-base">Seasons</h4>
                                                <p className="text-slate-800 dark:text-slate-200 text-sm md:text-base">{displayDetails.number_of_seasons}</p>
                                            </div>
                                        )}
                                        {displayDetails.genres && (
                                            <div className="space-y-2">
                                                <h4 className="font-bold text-blue-700 dark:text-blue-400 text-sm md:text-base">Genres</h4>
                                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                                    {displayDetails.genres.map((genre) => (<span key={genre.id} className="text-xs px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/50 dark:to-indigo-900/50 dark:text-blue-300 rounded-full font-semibold">{genre.name}</span>))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="lg:col-span-2">
                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2">{displayDetails.title || 'N/A'}</h3>
                                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-6 md:mb-8">Released: {displayDetails.release_date || 'N/A'}</p>
                                    {isPending ? (<div className="flex justify-center items-center h-32 md:h-64"><LoadingSpinner /></div>) : (
                                        <div className="space-y-6 md:space-y-8">
                                            {displayDetails.overview && (<div><h4 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-3 md:mb-4">Synopsis</h4><p className="text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300">{displayDetails.overview}</p></div>)}
                                            {displayDetails.cast && displayDetails.cast.length > 0 && (
                                                <div>
                                                    <h4 className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-400 mb-4 md:mb-6">Main Cast</h4>
                                                    <div className="grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-2">
                                                        {displayDetails.cast.slice(0, 8).map((actor) => (
                                                            <div key={actor.name} className="flex items-center gap-3 md:gap-4 p-2.5 md:p-3 rounded-lg md:rounded-xl bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                                {actor.profile_path ? (<div className="flex-shrink-0"><Image src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} alt={actor.name} width={48} height={48} className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover ring-2 ring-white dark:ring-slate-700" /></div>) : (<div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 flex-shrink-0"><UserGroupIcon className="h-6 w-6 md:h-7 md:w-7" /></div>)}
                                                                <div className="min-w-0 flex-1"><p className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm md:text-base">{actor.name}</p><p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">{actor.character}</p></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* ... (keep the style tag) ... */}
            <style jsx global>{`@keyframes fadeIn {from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); }}.animate-fade-in {animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;}`}</style>
        </>
    );
}