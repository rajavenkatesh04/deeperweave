'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { ofetch } from 'ofetch';
import { logMovie, type LogMovieState } from '@/lib/actions/timeline-actions';

import { FilmIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '@/app/ui/loading-spinner';

// --- Reusable Components ---

type MovieSearchResult = { id: number; title: string; release_date: string; poster_path: string; };

function MovieSearchResults({ results, onSelectMovie, isLoading }: { results: MovieSearchResult[]; onSelectMovie: (movie: MovieSearchResult) => void; isLoading: boolean; }) {
    if (isLoading) return <div className="absolute z-10 w-full mt-1 p-4 text-center rounded-md shadow-lg bg-white dark:bg-zinc-800 border dark:border-zinc-700"><LoadingSpinner /></div>;
    if (results.length === 0) return null;
    return (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg dark:bg-zinc-800 dark:border-zinc-700 max-h-60 overflow-y-auto">
            {results.map((movie) => (
                <li key={movie.id} className="flex items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700" onClick={() => onSelectMovie(movie)}>
                    {movie.poster_path ? <Image src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt={movie.title} width={40} height={60} className="object-cover mr-3 rounded" /> : <div className="w-10 h-[60px] mr-3 rounded flex items-center justify-center bg-gray-200 dark:bg-zinc-700"><FilmIcon className="w-5 h-5 text-gray-400"/></div>}
                    <div><p className="font-semibold">{movie.title}</p><p className="text-sm text-gray-500">{movie.release_date?.split('-')[0]}</p></div>
                </li>
            ))}
        </ul>
    );
}

// ✨ UPGRADED: Advanced StarRatingInput with half-star support
function StarRatingInput({ rating, setRating }: { rating: number; setRating: (rating: number) => void }) {
    const [hover, setHover] = useState(0);

    return (
        <div>
            <div className="flex items-center gap-4">
                <div className="flex">
                    {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={ratingValue} className="cursor-pointer">
                                <input
                                    type="radio"
                                    name="rating"
                                    value={ratingValue}
                                    onClick={() => {
                                        if (rating === ratingValue) setRating(ratingValue - 0.5);
                                        else if (rating === ratingValue - 0.5) setRating(0);
                                        else setRating(ratingValue);
                                    }}
                                    className="hidden"
                                />
                                <StarIcon
                                    className="h-7 w-7 transition-all duration-150"
                                    style={{
                                        clipPath: (hover || rating) >= ratingValue ? 'none' : (hover || rating) >= ratingValue - 0.5 ? 'inset(0 50% 0 0)' : 'none'
                                    }}
                                    color={(hover || rating) >= ratingValue - 0.5 ? '#f59e0b' : '#e5e7eb'}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                />
                            </label>
                        );
                    })}
                </div>
                {rating > 0 && (
                    <button type="button" onClick={() => setRating(0)} className="text-xs text-gray-500 hover:text-red-500" title="Clear rating">
                        Clear
                    </button>
                )}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
                Tip: Click a selected star again for a half-rating.
            </p>
        </div>
    );
}


function SubmitButton() {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className="flex h-10 w-full items-center justify-center rounded-lg bg-rose-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400">{pending ? <><LoadingSpinner className="mr-2"/> Saving...</> : 'Log Film'}</button>;
}

export default function LogMovieForm() {
    const initialState: LogMovieState = { message: null, errors: {} };
    const [state, formAction] = useActionState(logMovie, initialState);

    // ✨ ADDED: Refs for better form control
    const formRef = useRef<HTMLFormElement>(null);
    const justSelectedMovie = useRef(false);

    const [movieSearchQuery, setMovieSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<MovieSearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [rating, setRating] = useState(0);

    const today = new Date().toISOString().split('T')[0];
    const [watchedOn, setWatchedOn] = useState(today);

    // ✨ ADDED: Effect to reset the form on successful submission
    useEffect(() => {
        if (state.message === 'Success') { // Assuming your server action returns a success message
            formRef.current?.reset();
            setMovieSearchQuery('');
            setSelectedMovie(null);
            setRating(0);
            setWatchedOn(today);
            // Optionally, you might want to clear the success message after a delay
        }
    }, [state, today]);

    // ✨ UPDATED: Movie search effect now ignores the first run after a movie is selected
    useEffect(() => {
        if (justSelectedMovie.current) {
            justSelectedMovie.current = false;
            return;
        }

        const handler = setTimeout(() => {
            if (movieSearchQuery.trim().length < 3) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
            ofetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieSearchQuery)}`)
                .then(response => setSearchResults(response.results.slice(0, 5)))
                .catch(error => console.error("Failed to fetch movies:", error))
                .finally(() => setIsSearching(false));
        }, 500);
        return () => clearTimeout(handler);
    }, [movieSearchQuery]);

    // ✨ UPDATED: Now sets the ref to prevent re-searching
    const handleSelectMovie = (movie: MovieSearchResult) => {
        justSelectedMovie.current = true;
        setSelectedMovie(movie);
        setMovieSearchQuery(movie.title);
        setSearchResults([]);
    };

    const clearSelectedMovie = () => {
        setSelectedMovie(null);
        setMovieSearchQuery('');
    };

    return (
        <div className="w-full max-w-lg mx-auto rounded-lg border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-bold mb-4">Log a Film</h2>
            <form ref={formRef} action={formAction} className="space-y-6">
                {/* Movie Search Input */}
                <div className="space-y-2">
                    <label htmlFor="movieSearch" className="block text-sm font-medium text-gray-900 dark:text-zinc-200">Film</label>
                    <div className="relative">
                        <input id="movieSearch" type="text" value={movieSearchQuery} onChange={(e) => setMovieSearchQuery(e.target.value)} placeholder="Search for a movie..." autoComplete="off" className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"/>
                        <MovieSearchResults results={searchResults} onSelectMovie={handleSelectMovie} isLoading={isSearching} />
                    </div>
                    {selectedMovie && (
                        <div className="mt-2 p-3 rounded-md border border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/50">
                            <div className="flex items-center gap-3">
                                {selectedMovie.poster_path && <Image src={`https://image.tmdb.org/t/p/w92${selectedMovie.poster_path}`} alt={selectedMovie.title} width={40} height={60} className="rounded object-cover" />}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{selectedMovie.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400">{selectedMovie.release_date?.split('-')[0]}</p>
                                </div>
                                <button type="button" onClick={clearSelectedMovie} className="p-1 text-gray-400 hover:text-red-500 flex-shrink-0"><XCircleIcon className="h-5 w-5"/></button>
                            </div>
                            <input type="hidden" name="movieApiId" value={selectedMovie.id} />
                        </div>
                    )}
                    {state.errors?.movieApiId && <p className="text-sm text-red-500 mt-1">{state.errors.movieApiId[0]}</p>}
                </div>

                {/* Watched On & Rating */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="watched_on" className="block text-sm font-medium text-gray-900 dark:text-zinc-200">Watched On</label>
                        <input type="date" id="watched_on" name="watched_on" value={watchedOn} onChange={(e) => setWatchedOn(e.target.value)} className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" />
                        {state.errors?.watched_on && <p className="text-sm text-red-500 mt-1">{state.errors.watched_on[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-zinc-200">Rating</label>
                        <StarRatingInput rating={rating} setRating={setRating} />
                        <input type="hidden" name="rating" value={rating} />
                    </div>
                </div>

                {/* Notes Textarea */}
                <div className="space-y-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-900 dark:text-zinc-200">Notes (Optional)</label>
                    <textarea id="notes" name="notes" rows={3} placeholder="Any brief thoughts on the film?" className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"></textarea>
                    {state.errors?.notes && <p className="text-sm text-red-500 mt-1">{state.errors.notes[0]}</p>}
                </div>

                {state.message && state.message !== 'Success' && <p className="text-sm text-red-500">{state.message}</p>}

                <SubmitButton />
            </form>
        </div>
    );
}