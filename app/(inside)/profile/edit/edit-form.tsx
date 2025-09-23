'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfile, Movie } from '@/lib/definitions';
import { updateProfile, EditProfileState, checkUsernameAvailability } from '@/lib/actions/profile-actions';
import { ofetch } from 'ofetch';
import { PhotoIcon, CheckCircleIcon, XCircleIcon, FilmIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { clsx } from 'clsx';

// A helper type for what the TMDB API search returns
type MovieSearchResult = { id: number; title: string; release_date: string; poster_path: string; };

// Helper component to display movie search results
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

// A submit button that shows a loading state
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-500">
            {pending ? <LoadingSpinner /> : 'Save Changes'}
        </button>
    );
}

// --- Main EditForm Component ---
export default function ProfileEditForm({ profile, favoriteFilms }: { profile: UserProfile; favoriteFilms: { rank: number; movies: Movie }[] }) {
    const initialState: EditProfileState = { message: null, errors: {} };
    const [state, formAction] = useActionState(updateProfile, initialState);

    // State for image preview & username logic
    const [previewUrl, setPreviewUrl] = useState<string | null>(profile.profile_pic_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [username, setUsername] = useState(profile.username);
    const [availability, setAvailability] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

    // State for Favorite Films UI
    const [favFilms, setFavFilms] = useState<(MovieSearchResult | null)[]>([null, null, null]);
    const [movieSearchQuery, setMovieSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // This effect runs once on mount to populate the form's film state from the server-side props.
    useEffect(() => {
        const initialFilms: (MovieSearchResult | null)[] = [null, null, null];
        favoriteFilms.forEach(fav => {
            if (fav.rank >= 1 && fav.rank <= 3 && fav.movies) {
                initialFilms[fav.rank - 1] = {
                    id: fav.movies.tmdb_id,
                    title: fav.movies.title,
                    release_date: fav.movies.release_date,
                    poster_path: fav.movies.poster_url?.replace('https://image.tmdb.org/t/p/w500', '') || ''
                };
            }
        });
        setFavFilms(initialFilms);
    }, [favoriteFilms]);

    // Debounce username availability check to avoid spamming the server
    useEffect(() => {
        if (username === profile.username) {
            setAvailability('idle');
            return;
        }
        if (username.length < 3) {
            setAvailability('idle');
            return;
        }

        const handler = setTimeout(() => {
            setAvailability('checking');
            checkUsernameAvailability(username).then(result => {
                setAvailability(result.available ? 'available' : 'taken');
            });
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(handler);
    }, [username, profile.username]);

    // Debounced effect for movie search
    useEffect(() => {
        const handler = setTimeout(() => {
            if (movieSearchQuery.trim().length < 2) {
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAddFavorite = (movie: MovieSearchResult) => {
        const firstEmptyIndex = favFilms.findIndex(film => film === null);
        if (firstEmptyIndex !== -1 && !favFilms.some(f => f?.id === movie.id)) {
            const newFilms = [...favFilms];
            newFilms[firstEmptyIndex] = movie;
            setFavFilms(newFilms);
        }
        setMovieSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveFavorite = (index: number) => {
        const newFilms = [...favFilms];
        newFilms[index] = null;
        setFavFilms(newFilms);
    };

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newFilms = [...favFilms];
        const draggedItemContent = newFilms[dragItem.current];
        newFilms[dragItem.current] = newFilms[dragOverItem.current];
        newFilms[dragOverItem.current] = draggedItemContent;
        dragItem.current = null;
        dragOverItem.current = null;
        setFavFilms(newFilms);
    };

    return (
        <form action={formAction} className="space-y-8">
            {/* Profile Picture Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Profile Picture</h3>
                <div className="mt-4 flex items-center gap-6">
                    <Image src={previewUrl || '/placeholder-user.jpg'} alt="Profile picture preview" width={96} height={96} className="h-24 w-24 rounded-full object-cover bg-gray-200" />
                    <input type="file" name="profile_pic" id="profile_pic" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                        <PhotoIcon className="h-5 w-5" /> Change Picture
                    </button>
                </div>
            </div>

            {/* User Details Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Your Details</h3>
                <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                    <div>
                        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Display Name</label>
                        <input type="text" name="display_name" id="display_name" defaultValue={profile.display_name} required className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                        {state.errors?.display_name && <p className="mt-1 text-sm text-red-600">{state.errors.display_name[0]}</p>}
                    </div>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Username</label>
                        <div className="relative mt-1">
                            <input type="text" name="username" id="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} required className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                {availability === 'checking' && <LoadingSpinner className="h-5 w-5" />}
                                {availability === 'available' && <CheckCircleIcon className="h-5 w-5 text-green-500" title="Username available" />}
                                {availability === 'taken' && <XCircleIcon className="h-5 w-5 text-red-500" title="Username taken" />}
                            </div>
                        </div>
                        {state.errors?.username && <p className="mt-1 text-sm text-red-600">{state.errors.username[0]}</p>}
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Bio</label>
                        <textarea name="bio" id="bio" rows={3} defaultValue={profile.bio || ''} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" placeholder="A little about yourself..."></textarea>
                        {state.errors?.bio && <p className="mt-1 text-sm text-red-600">{state.errors.bio[0]}</p>}
                    </div>
                </div>
            </div>

            {/* Favorite Films Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Favorite Films</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">Add up to three films, then drag to reorder.</p>
                <div className="relative mt-4">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={movieSearchQuery} onChange={(e) => setMovieSearchQuery(e.target.value)} placeholder="Search to add a film..." className="w-full rounded-md border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800" autoComplete="off" disabled={favFilms.every(film => film !== null)} />
                    <MovieSearchResults results={searchResults} onSelectMovie={handleAddFavorite} isLoading={isSearching} />
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Map over the 3 slots for favorite films */}
                    {[0, 1, 2].map(index => {
                        const film = favFilms[index];
                        const rankStyles = ['border-amber-400 text-amber-400', 'border-slate-400 text-slate-400', 'border-orange-600 text-orange-600'];
                        return (
                            <div key={index} className={clsx(`relative rounded-lg border-2 bg-white/5 p-4 transition-all duration-300 dark:bg-zinc-900/50`, rankStyles[index], dragOverItem.current === index && 'border-dashed border-sky-400 bg-sky-900/30')} onDragOver={(e) => { e.preventDefault(); dragOverItem.current = index; setFavFilms([...favFilms]); }} onDrop={handleDragSort} onDragEnd={() => { dragOverItem.current = null; setFavFilms([...favFilms]); }}>
                                <h4 className={`text-sm font-bold`}>Top {index + 1}</h4>
                                {film ? (
                                    <div className={`mt-2 flex cursor-grab items-center gap-3 rounded-md p-2 transition-opacity active:cursor-grabbing ${dragItem.current === index ? 'opacity-40' : 'opacity-100'}`} draggable onDragStart={() => dragItem.current = index}>
                                        <Image src={`https://image.tmdb.org/t/p/w92${film.poster_path}`} alt={film.title} width={40} height={60} className="rounded object-cover shadow-lg" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate text-zinc-100">{film.title}</p>
                                            <p className="text-xs text-zinc-400">{film.release_date?.split('-')[0]}</p>
                                        </div>
                                        <button type="button" onClick={() => handleRemoveFavorite(index)} className="p-1 text-zinc-400 hover:text-red-500 flex-shrink-0"><XMarkIcon className="h-5 w-5"/></button>
                                    </div>
                                ) : (
                                    <div className="mt-2 flex h-[68px] items-center justify-center text-xs text-zinc-500">Empty Slot</div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <input type="hidden" name="fav_movie_1" value={favFilms[0]?.id || ''} />
                <input type="hidden" name="fav_movie_2" value={favFilms[1]?.id || ''} />
                <input type="hidden" name="fav_movie_3" value={favFilms[2]?.id || ''} />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
                <Link href="/profile" className="flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-6 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">Cancel</Link>
                <SubmitButton />
            </div>
        </form>
    );
}
