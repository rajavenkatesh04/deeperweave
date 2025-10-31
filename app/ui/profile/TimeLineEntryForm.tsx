// @/app/ui/timeline/TimeLineEntryForm.tsx

'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { ofetch } from 'ofetch';
import { logMovie, type LogMovieState } from '@/lib/actions/timeline-actions';
import { searchProfiles } from '@/lib/actions/profile-actions';
import { type ProfileSearchResult } from '@/lib/definitions';

import {
    FilmIcon,
    StarIcon,
    XCircleIcon,
    ArrowLeftIcon,
    BuildingLibraryIcon,
    DevicePhoneMobileIcon,
    PhotoIcon,
    UserPlusIcon,
    XMarkIcon,
    CheckIcon // <-- 1. IMPORT THE CHECK ICON
} from '@heroicons/react/24/solid';
import LoadingSpinner from '@/app/ui/loading-spinner';

// --- Reusable Components (MovieSearchResults, StarRatingInput, SubmitButton) ---
// (These are unchanged from the previous version)

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

function StarRatingInput({ rating, setRating, error }: { rating: number; setRating: (rating: number) => void; error?: string }) {
    const [hover, setHover] = useState(0);

    return (
        <div>
            <div className="flex items-center gap-4">
                <div className={`flex p-1 rounded-lg ${error ? 'ring-2 ring-red-500' : ''}`}>
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
                                        else if (rating === ratingValue - 0.5) setRating(0); // Click half-star to clear
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
            {error ? (
                <p className="mt-2 text-sm text-red-500">{error}</p>
            ) : (
                <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
                    Tip: Click a selected star again for a half-rating.
                </p>
            )}
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className="flex h-10 w-full items-center justify-center rounded-lg bg-rose-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400">{pending ? <><LoadingSpinner className="mr-2"/> Saving...</> : 'Log Film'}</button>;
}


// --- Constants for New Features ---
const ottPlatforms = [
    { name: 'Netflix', logo: '/logos/netflix.svg', color: '#E50914' },
    { name: 'Prime Video', logo: '/logos/prime-video.svg', color: '#00A8E1' },
    { name: 'Disney+', logo: '/logos/disney-plus.svg', color: '#011c70' },
    { name: 'Hulu', logo: '/logos/hulu.svg', color: '#1CE783' },
    { name: 'Max', logo: '/logos/max.svg', color: '#002be7' },
    { name: 'Apple TV+', logo: '/logos/apple-tv.svg', color: '#000000' },
    { name: 'Other', logo: null, color: '#6b7280' },
];

// ✨ 2. THESE CONSTANTS ARE ALREADY HERE AND ARE USED FOR VALIDATION
const MAX_FILE_SIZE_MB = 5; // You can set this to 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

// --- Main Form Component ---
export default function TimeLineEntryForm({ username }: { username: string }) {
    const initialState: LogMovieState = { message: null, errors: {} };
    const [state, formAction] = useActionState(logMovie, initialState);

    const formRef = useRef<HTMLFormElement>(null);
    const justSelectedMovie = useRef(false);

    // Movie Search State
    const [movieSearchQuery, setMovieSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<MovieSearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Core Entry State
    const [rating, setRating] = useState(0); // 0 will mean "not rated"
    const today = new Date().toISOString().split('T')[0];
    const [watchedOn, setWatchedOn] = useState(today);

    // --- NEW STATE FOR NEW FEATURES ---
    const [viewingMedium, setViewingMedium] = useState<'theatre' | 'ott' | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<string>('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [tagSearchQuery, setTagSearchQuery] = useState('');
    const [isTagSearching, setIsTagSearching] = useState(false);
    const [tagResults, setTagResults] = useState<ProfileSearchResult[]>([]);
    const [taggedUsers, setTaggedUsers] = useState<ProfileSearchResult[]>([]);

    // ✨ 3. THIS IS THE NEW STATE FOR THE CHECKMARK
    const [isFileValid, setIsFileValid] = useState(false);

    // --- Effect to reset form on success ---
    useEffect(() => {
        if (state.message === 'Success') {
            formRef.current?.reset();
            setMovieSearchQuery('');
            setSelectedMovie(null);
            setRating(0);
            setWatchedOn(today);
            setViewingMedium(null);
            setSelectedPlatform('');
            setPhotoPreview(null);
            setPhotoError(null);
            setIsFileValid(false); // Reset checkmark
            setTagSearchQuery('');
            setTagResults([]);
            setTaggedUsers([]);
            const fileInput = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        }
    }, [state, today]);

    // --- Movie search effect (unchanged) ---
    useEffect(() => {
        if (justSelectedMovie.current) {
            justSelectedMovie.current = false; return;
        }
        const handler = setTimeout(() => {
            if (movieSearchQuery.trim().length < 2) {
                setSearchResults([]); return;
            }
            setIsSearching(true);
            const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
            ofetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieSearchQuery)}`)
                .then(response => setSearchResults(response.results.slice(0, 20)))
                .catch(error => console.error("Failed to fetch movies:", error))
                .finally(() => setIsSearching(false));
        }, 500);
        return () => clearTimeout(handler);
    }, [movieSearchQuery]);

    // --- User tag search effect (unchanged) ---
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (tagSearchQuery.trim().length < 2) {
                setTagResults([]); return;
            }
            setIsTagSearching(true);
            try {
                const results = await searchProfiles(tagSearchQuery);
                setTagResults(results.filter(user =>
                    !taggedUsers.some(tagged => tagged.id === user.id)
                ));
            } catch (error) {
                console.error("Failed to search profiles:", error);
            } finally {
                setIsTagSearching(false);
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [tagSearchQuery, taggedUsers]);


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

    // ✨ 4. UPDATED PHOTO HANDLER
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (photoPreview) URL.revokeObjectURL(photoPreview);

        setIsFileValid(false); // Reset on new file

        if (file) {
            // Check 1: File Size
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setPhotoError(`File is too large (max ${MAX_FILE_SIZE_MB}MB).`);
                setPhotoPreview(null); e.target.value = ''; return;
            }
            // Check 2: File Type
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                setPhotoError('Invalid file type. Please use JPG, PNG, or WEBP.');
                setPhotoPreview(null); e.target.value = ''; return;
            }

            // All checks passed
            setPhotoError(null);
            setPhotoPreview(URL.createObjectURL(file));
            setIsFileValid(true); // <-- Set valid state
        } else {
            setPhotoPreview(null);
            setPhotoError(null);
        }
    };

    // ✨ 5. UPDATED CLEAR PHOTO HANDLER
    const clearPhoto = () => {
        setPhotoPreview(null);
        setPhotoError(null);
        setIsFileValid(false); // Reset checkmark
        const fileInput = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    }

    const handleSelectUser = (user: ProfileSearchResult) => {
        setTaggedUsers(prev => [...prev, user]);
        setTagSearchQuery('');
        setTagResults([]);
    };

    const handleRemoveUser = (userId: string) => {
        setTaggedUsers(prev => prev.filter(user => user.id !== userId));
    };

    return (
        <div className="w-full max-w-lg mx-auto rounded-lg border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {/* ... (Back to Timeline Link) ... */}
            <Link href={`/profile/${username}/timeline`} className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Timeline
            </Link>

            <h2 className="text-xl font-bold mb-4">Log a Film</h2>
            <form ref={formRef} action={formAction} className="space-y-6">

                {/* --- Movie Search (Mandatory) --- */}
                <div className="space-y-2">
                    <label htmlFor="movieSearch" className="block text-sm font-medium text-gray-900 dark:text-zinc-200">Film *</label>
                    <div className="relative">
                        <input id="movieSearch" type="text" value={movieSearchQuery} onChange={(e) => setMovieSearchQuery(e.target.value)} placeholder="Search for a movie..." autoComplete="off" className={`block w-full rounded-md bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800 ${state.errors?.movieApiId ? 'border-red-500' : 'border-gray-300'}`}/>
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

                {/* --- Watched On & Rating (Mandatory) --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="watched_on" className="block text-sm font-medium text-gray-900 dark:text-zinc-200">Watched On *</label>
                        <input type="date" id="watched_on" name="watched_on" value={watchedOn} onChange={(e) => setWatchedOn(e.target.value)} className={`block w-full rounded-md bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800 ${state.errors?.watched_on ? 'border-red-500' : 'border-gray-300'}`} />
                        {state.errors?.watched_on && <p className="text-sm text-red-500 mt-1">{state.errors.watched_on[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-zinc-200">Rating *</label>
                        <StarRatingInput rating={rating} setRating={setRating} error={state.errors?.rating?.[0]} />
                        <input type="hidden" name="rating" value={rating} />
                    </div>
                </div>

                {/* --- Viewing Medium (Optional) --- */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-900 dark:text-zinc-200">Where did you watch? (Optional)</label>
                    {viewingMedium && <input type="hidden" name="viewing_medium" value={viewingMedium} />}
                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setViewingMedium(v => v === 'theatre' ? null : 'theatre')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${viewingMedium === 'theatre' ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50' : 'border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500'}`}>
                            <BuildingLibraryIcon className={`w-6 h-6 ${viewingMedium === 'theatre' ? 'text-rose-600' : 'text-gray-400'}`} />
                            <span className="font-medium text-sm">In Theatres</span>
                        </button>
                        <button type="button" onClick={() => setViewingMedium(v => v === 'ott' ? null : 'ott')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${viewingMedium === 'ott' ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50' : 'border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500'}`}>
                            <DevicePhoneMobileIcon className={`w-6 h-6 ${viewingMedium === 'ott' ? 'text-rose-600' : 'text-gray-400'}`} />
                            <span className="font-medium text-sm">At Home (OTT)</span>
                        </button>
                    </div>
                    {state.errors?.viewing_medium && <p className="text-sm text-red-500 mt-1">{state.errors.viewing_medium[0]}</p>}
                </div>

                {/* --- OTT Platform Selector (Conditional) --- */}
                {viewingMedium === 'ott' && (
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-900 dark:text-zinc-200">On which platform?</label>
                        <input type="hidden" name="ott_platform" value={selectedPlatform} />
                        <div className="flex flex-wrap gap-2">
                            {ottPlatforms.map(platform => (
                                <button type="button" key={platform.name} onClick={() => setSelectedPlatform(p => p === platform.name ? '' : platform.name)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all ${selectedPlatform === platform.name ? 'border-transparent ring-2 ring-rose-500' : 'border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500'}`}
                                        style={selectedPlatform === platform.name ? { backgroundColor: platform.color, color: platform.name === 'Hulu' ? '#000' : '#fff', borderColor: platform.color } : {}}
                                >
                                    {platform.logo && <Image src={platform.logo} alt={platform.name} width={16} height={16} className={selectedPlatform === platform.name && platform.name !== 'Hulu' ? 'brightness-0 invert' : ''} />}
                                    <span className={`text-sm font-medium ${selectedPlatform === platform.name ? 'text-inherit' : 'text-gray-700 dark:text-zinc-300'}`}>{platform.name}</span>
                                </button>
                            ))}
                        </div>
                        {state.errors?.ott_platform && <p className="text-sm text-red-500 mt-1">{state.errors.ott_platform[0]}</p>}
                    </div>
                )}

                {/* --- Notes Textarea (Optional) --- */}
                <div className="space-y-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-900 dark:text-zinc-200">Notes (Optional)</label>
                    <textarea id="notes" name="notes" rows={3} placeholder="Any brief thoughts on the film?" className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"></textarea>
                    {state.errors?.notes && <p className="text-sm text-red-500 mt-1">{state.errors.notes[0]}</p>}
                </div>

                {/* --- ✨ 6. UPDATED Photo Upload with Checkmark --- */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-zinc-200">Add a Photo (Optional)</label>
                    <label htmlFor="photo" className={`cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors ${state.errors?.photo || photoError ? 'border-red-500' : 'border-gray-300'}`}>
                        {photoPreview ? (
                            <div className="relative w-full h-full">
                                <Image src={photoPreview} alt="Photo preview" layout="fill" objectFit="cover" className="rounded-lg" />
                                <button type="button" onClick={clearPhoto} className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white hover:bg-black/80 z-20">
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                                {/* --- THIS IS THE NEW CHECKMARK --- */}
                                {isFileValid && (
                                    <div className="absolute top-1 left-1 p-0.5 bg-green-500 rounded-full z-10">
                                        <CheckIcon className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <PhotoIcon className="w-8 h-8 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500 dark:text-zinc-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500 dark:text-zinc-400">PNG, JPG, or WEBP (MAX. {MAX_FILE_SIZE_MB}MB)</p>
                            </div>
                        )}
                        <input id="photo" name="photo" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/heic" onChange={handlePhotoChange} />
                    </label>
                    {(photoError || state.errors?.photo) && <p className="text-sm text-red-500 mt-1">{photoError || state.errors?.photo?.[0]}</p>}
                </div>

                {/* --- "Watched With" Tagger (Optional) --- */}
                <div className="space-y-2">
                    <label htmlFor="tagSearch" className="block text-sm font-medium text-gray-900 dark:text-zinc-200">Watched With (Optional)</label>
                    {taggedUsers.map(user => (
                        <input key={user.id} type="hidden" name="watched_with" value={user.id} />
                    ))}
                    {taggedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {taggedUsers.map(user => (
                                <div key={user.id} className="flex items-center gap-2 pl-1 pr-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded-full">
                                    <Image src={user.profile_pic_url || '/default-avatar.png'} alt={user.username} width={24} height={24} className="rounded-full" />
                                    <span className="text-sm font-medium">{user.username}</span>
                                    <button type="button" onClick={() => handleRemoveUser(user.id)} className="text-gray-400 hover:text-red-500">
                                        <XCircleIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="relative">
                        <UserPlusIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input id="tagSearch" type="text" value={tagSearchQuery} onChange={(e) => setTagSearchQuery(e.target.value)} placeholder="Tag friends..." autoComplete="off" className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 pl-10 pr-3 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"/>
                        {(isTagSearching || tagResults.length > 0) && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg dark:bg-zinc-800 dark:border-zinc-700 max-h-48 overflow-y-auto">
                                {isTagSearching ? (
                                    <li className="p-4 text-center"><LoadingSpinner /></li>
                                ) : (
                                    tagResults.map(user => (
                                        <li key={user.id} className="flex items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700" onClick={() => handleSelectUser(user)}>
                                            <Image src={user.profile_pic_url || '/default-avatar.png'} alt={user.username} width={32} height={32} className="object-cover mr-3 rounded-full" />
                                            <div>
                                                <p className="font-semibold text-sm">{user.display_name}</p>
                                                <p className="text-xs text-gray-500">@{user.username}</p>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}
                    </div>
                </div>

                {/* --- Submission Errors & Button --- */}
                {state.message && state.message !== 'Success' && <p className="text-sm text-red-500">{state.message}</p>}
                <SubmitButton />
            </form>
        </div>
    );
}