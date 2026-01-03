'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { logEntry, type LogEntryState } from '@/lib/actions/timeline-actions';
import { searchCinematic, type CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import { searchProfiles } from '@/lib/actions/profile-actions';
import { type ProfileSearchResult } from '@/lib/definitions';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts"; // Ensure this import exists

import {
    FilmIcon,
    StarIcon,
    XMarkIcon,
    ArrowLeftIcon,
    BuildingLibraryIcon,
    DevicePhoneMobileIcon,
    PhotoIcon,
    UserPlusIcon,
    CheckIcon,
    TvIcon,
    CalendarIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import LoadingSpinner from '@/app/ui/loading-spinner';

// --- Constants & Utilities ---
const ottPlatforms = [
    { name: 'Netflix', logo: '/logos/netflix.svg', color: '#E50914' },
    { name: 'Prime Video', logo: '/logos/prime-video.svg', color: '#00A8E1' },
    { name: 'Disney+', logo: '/logos/disney-plus.svg', color: '#011c70' },
    { name: 'Hulu', logo: '/logos/hulu.svg', color: '#1CE783' },
    { name: 'Max', logo: '/logos/max.svg', color: '#002be7' },
    { name: 'Apple TV+', logo: '/logos/apple-tv.svg', color: '#000000' },
    { name: 'Other', logo: null, color: '#6b7280' },
];

// --- Sub-Components ---

function FilmGrain() {
    return (
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
             style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
             }}
        />
    );
}

function CinematicSearchResults({ results, onSelect, isLoading }: {
    results: CinematicSearchResult[];
    onSelect: (item: CinematicSearchResult) => void;
    isLoading: boolean;
}) {
    if (isLoading) return <div className="absolute z-50 w-full mt-2 p-4 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl"><LoadingSpinner /></div>;
    if (results.length === 0) return null;

    return (
        <ul className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
            {results.map((item) => (
                <li key={item.id} className="flex items-center p-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group" onClick={() => onSelect(item)}>
                    {item.poster_path ? (
                        <Image src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.title} width={40} height={60} className="object-cover mr-4 shadow-sm" />
                    ) : (
                        <div className="w-10 h-[60px] mr-4 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400"><FilmIcon className="w-5 h-5"/></div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-amber-600 transition-colors">{item.title}</p>
                        <p className="text-xs text-zinc-500 uppercase tracking-wide">{item.release_date?.split('-')[0] || 'Unknown'} · {item.media_type === 'movie' ? 'Movie' : 'Series'}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

function StarRatingInput({ rating, setRating, error }: { rating: number; setRating: (rating: number) => void; error?: string }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    const isFilled = (hover || rating) >= ratingValue;
                    const isHalf = (hover || rating) >= ratingValue - 0.5 && (hover || rating) < ratingValue;

                    return (
                        <label key={ratingValue} className="cursor-pointer group relative p-1">
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
                            {isFilled ? (
                                <StarIconSolid className="h-8 w-8 text-zinc-900 dark:text-zinc-100 transition-transform group-hover:scale-110" />
                            ) : (
                                <StarIcon className="h-8 w-8 text-zinc-300 dark:text-zinc-700 transition-transform group-hover:scale-110 group-hover:text-zinc-400" />
                            )}
                            {/* Half Star Logic can be added here with clip-path if strict half-star visual is needed,
                                but simpler UI often toggles full stars or uses a specific half-icon */}
                        </label>
                    );
                })}
                {rating > 0 && (
                    <button type="button" onClick={() => setRating(0)} className="ml-2 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-red-600 transition-colors">Clear</button>
                )}
            </div>
            {error ? <p className="text-xs text-red-600 font-medium">{error}</p> : null}
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-14 w-full items-center justify-center bg-zinc-900 text-white text-sm font-bold uppercase tracking-widest hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? <><LoadingSpinner className="mr-2"/> Archiving...</> : 'Log Entry'}
        </button>
    );
}

// --- Main Component ---

export default function TimeLineEntryForm({ username }: { username: string }) {
    const initialState: LogEntryState = { message: null, errors: {} };
    const [state, formAction] = useActionState(logEntry, initialState);

    const formRef = useRef<HTMLFormElement>(null);
    const justSelectedItem = useRef(false);

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<CinematicSearchResult[]>([]);
    const [selectedItem, setSelectedItem] = useState<CinematicSearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [rating, setRating] = useState(0);
    const today = new Date().toISOString().split('T')[0];
    const [watchedOn, setWatchedOn] = useState(today);
    const [viewingMedium, setViewingMedium] = useState<'theatre' | 'ott' | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState<string>('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [tagSearchQuery, setTagSearchQuery] = useState('');
    const [isTagSearching, setIsTagSearching] = useState(false);
    const [tagResults, setTagResults] = useState<ProfileSearchResult[]>([]);
    const [taggedUsers, setTaggedUsers] = useState<ProfileSearchResult[]>([]);
    const [isFileValid, setIsFileValid] = useState(false);

    // Reset Effect
    useEffect(() => {
        if (state.message === 'Success' || state.message === 'Entry deleted successfully!') {
            formRef.current?.reset();
            setSearchQuery('');
            setSelectedItem(null);
            setRating(0);
            setWatchedOn(today);
            setViewingMedium(null);
            setSelectedPlatform('');
            setPhotoPreview(null);
            setPhotoError(null);
            setIsFileValid(false);
            setTagSearchQuery('');
            setTagResults([]);
            setTaggedUsers([]);
            const fileInput = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        }
    }, [state, today]);

    // Search Logic
    useEffect(() => {
        if (justSelectedItem.current) { justSelectedItem.current = false; return; }
        const handler = setTimeout(async () => {
            if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
            setIsSearching(true);
            try {
                const results = await searchCinematic(searchQuery);
                setSearchResults(results);
            } catch (error) { console.error(error); } finally { setIsSearching(false); }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Tag Search Logic
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (tagSearchQuery.trim().length < 2) { setTagResults([]); return; }
            setIsTagSearching(true);
            try {
                const results = await searchProfiles(tagSearchQuery);
                setTagResults(results.filter(user => !taggedUsers.some(tagged => tagged.id === user.id)));
            } catch (error) { console.error(error); } finally { setIsTagSearching(false); }
        }, 300);
        return () => clearTimeout(handler);
    }, [tagSearchQuery, taggedUsers]);

    // Handlers
    const handleSelectItem = (item: CinematicSearchResult) => {
        justSelectedItem.current = true;
        setSelectedItem(item);
        setSearchQuery(item.title);
        setSearchResults([]);
    };

    const clearSelectedItem = () => {
        setSelectedItem(null);
        setSearchQuery('');
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setIsFileValid(false);
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setPhotoError('Max size 5MB.'); setPhotoPreview(null); e.target.value = ''; return;
            }
            if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(file.type)) {
                setPhotoError('Invalid file type.'); setPhotoPreview(null); e.target.value = ''; return;
            }
            setPhotoError(null);
            setPhotoPreview(URL.createObjectURL(file));
            setIsFileValid(true);
        } else {
            setPhotoPreview(null);
            setPhotoError(null);
        }
    };

    const handleSelectUser = (user: ProfileSearchResult) => {
        setTaggedUsers(prev => [...prev, user]);
        setTagSearchQuery('');
        setTagResults([]);
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative">

            {/* Nav Back - Absolute */}
            <div className="absolute top-6 left-6 z-20">
                <Link href={`/profile/${username}/timeline`} className="group flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors bg-white/50 dark:bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back
                </Link>
            </div>

            <div className="flex flex-col md:flex-row min-h-screen">

                {/* --- LEFT COLUMN: The Visual --- */}
                <div className={`
                    relative md:w-1/2 lg:w-5/12 bg-zinc-900 text-white overflow-hidden flex flex-col items-center justify-center transition-all duration-500
                    ${selectedItem ? 'min-h-[400px] md:h-auto' : 'h-[300px] md:h-auto'}
                `}>
                    <FilmGrain />

                    {selectedItem ? (
                        <>
                            {/* Backdrop Image */}
                            <div className="absolute inset-0 z-0">
                                {selectedItem.poster_path && (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/original${selectedItem.poster_path}`}
                                        alt="Backdrop"
                                        fill
                                        className="object-cover opacity-40 blur-xl scale-110"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-zinc-900/50" />
                            </div>

                            {/* Poster Display */}
                            <div className="relative z-10 p-8 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                                <div className="relative w-48 h-72 md:w-64 md:h-96 shadow-2xl mb-6 group">
                                    {selectedItem.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w780${selectedItem.poster_path}`}
                                            alt={selectedItem.title}
                                            fill
                                            className="object-cover border-4 border-white/10"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center border-4 border-white/10"><FilmIcon className="w-16 h-16 text-zinc-600"/></div>
                                    )}
                                    <button
                                        onClick={clearSelectedItem}
                                        className="absolute -top-3 -right-3 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <h1 className={`${PlayWriteNewZealandFont.className} text-3xl md:text-4xl font-bold leading-tight`}>{selectedItem.title}</h1>
                                <p className="mt-2 text-zinc-400 font-medium tracking-wide">
                                    {selectedItem.release_date?.split('-')[0]}
                                    <span className="mx-2">·</span>
                                    {selectedItem.media_type === 'movie' ? 'Film' : 'Series'}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="relative z-10 text-center space-y-6 p-8">
                            <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                <FilmIcon className="w-10 h-10 text-zinc-400" />
                            </div>
                            <div className="space-y-2">
                                <h2 className={`${PlayWriteNewZealandFont.className} text-4xl font-bold tracking-tight`}>
                                    The Archive.
                                </h2>
                                <p className="text-sm text-zinc-500 uppercase tracking-widest">
                                    Log your cinematic journey
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- RIGHT COLUMN: The Form --- */}
                <div className="flex-1 bg-white dark:bg-zinc-950 flex flex-col">
                    <div className="flex-1 py-12 px-6 md:px-12 lg:px-20 max-w-2xl mx-auto w-full">

                        <form ref={formRef} action={formAction} className="space-y-12">

                            {/* 1. Selection (Search) */}
                            <div className="space-y-4">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    I Watched
                                </label>
                                {!selectedItem ? (
                                    <div className="relative">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search for a title..."
                                                autoComplete="off"
                                                className="block w-full border-b-2 border-zinc-100 bg-transparent py-4 pl-0 pr-10 text-xl md:text-2xl font-light placeholder:text-zinc-300 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors"
                                            />
                                            <div className="absolute right-0 top-5 text-zinc-400">
                                                {isSearching ? <LoadingSpinner className="w-5 h-5"/> : <MagnifyingGlassIcon className="w-6 h-6"/>}
                                            </div>
                                        </div>
                                        <CinematicSearchResults results={searchResults} onSelect={handleSelectItem} isLoading={false} />
                                        {state.errors?.cinematicApiId && <p className="text-sm text-red-600 mt-2">{state.errors.cinematicApiId[0]}</p>}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">Selection Locked</span>
                                        <button type="button" onClick={clearSelectedItem} className="text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-red-600">Change</button>
                                        <input type="hidden" name="cinematicApiId" value={selectedItem.id} />
                                        <input type="hidden" name="media_type" value={selectedItem.media_type} />
                                    </div>
                                )}
                            </div>

                            {/* 2. Core Details (Grid) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Date Watched
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="watched_on"
                                            value={watchedOn}
                                            onChange={(e) => setWatchedOn(e.target.value)}
                                            className="block w-full border-b border-zinc-200 bg-transparent py-2 text-base focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors"
                                        />
                                        <CalendarIcon className="w-5 h-5 text-zinc-400 absolute right-0 top-2 pointer-events-none"/>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Rating
                                    </label>
                                    <StarRatingInput rating={rating} setRating={setRating} error={state.errors?.rating?.[0]} />
                                    <input type="hidden" name="rating" value={rating} />
                                </div>
                            </div>

                            {/* 3. The Medium */}
                            <div className="space-y-6">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Viewing Experience
                                </label>
                                <input type="hidden" name="viewing_medium" value={viewingMedium || ''} />

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setViewingMedium(v => v === 'theatre' ? null : 'theatre')}
                                        className={`flex-1 flex items-center justify-center gap-3 p-4 border transition-all ${viewingMedium === 'theatre' ? 'border-zinc-900 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black dark:border-zinc-100' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'}`}
                                    >
                                        <BuildingLibraryIcon className="w-5 h-5" />
                                        <span className="font-medium">Theatre</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewingMedium(v => v === 'ott' ? null : 'ott')}
                                        className={`flex-1 flex items-center justify-center gap-3 p-4 border transition-all ${viewingMedium === 'ott' ? 'border-zinc-900 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black dark:border-zinc-100' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'}`}
                                    >
                                        <TvIcon className="w-5 h-5" />
                                        <span className="font-medium">Digital</span>
                                    </button>
                                </div>

                                {viewingMedium === 'ott' && (
                                    <div className="pt-2 animate-in slide-in-from-top-2">
                                        <input type="hidden" name="ott_platform" value={selectedPlatform} />
                                        <div className="flex flex-wrap gap-2">
                                            {ottPlatforms.map(platform => (
                                                <button
                                                    type="button"
                                                    key={platform.name}
                                                    onClick={() => setSelectedPlatform(p => p === platform.name ? '' : platform.name)}
                                                    className={`
                                                        px-3 py-1.5 text-xs font-medium border transition-all
                                                        ${selectedPlatform === platform.name
                                                        ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-black'
                                                        : 'bg-transparent text-zinc-500 border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:text-zinc-400'
                                                    }
                                                    `}
                                                >
                                                    {platform.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 4. Notes & Thoughts */}
                            <div className="space-y-4">
                                <label htmlFor="notes" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Critique & Notes
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={4}
                                    placeholder="Write your review..."
                                    className="block w-full bg-transparent border-b border-zinc-200 py-3 px-0 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 dark:placeholder:text-zinc-700 resize-none leading-relaxed"
                                ></textarea>
                            </div>

                            {/* 5. Memory & Company */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Photo Upload */}
                                <div className="space-y-4">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Ticket / Memory
                                    </label>
                                    <label htmlFor="photo" className={`relative cursor-pointer flex flex-col items-center justify-center w-full aspect-video border border-dashed transition-all group overflow-hidden ${photoPreview ? 'border-zinc-900 dark:border-zinc-100' : 'border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'}`}>
                                        {photoPreview ? (
                                            <>
                                                <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <p className="text-white text-xs font-medium uppercase tracking-widest">Change</p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-zinc-400">
                                                <PhotoIcon className="w-6 h-6 mb-2" />
                                                <span className="text-[10px] uppercase tracking-widest">Upload Image</span>
                                            </div>
                                        )}
                                        <input id="photo" name="photo" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                    </label>
                                    {photoError && <p className="text-xs text-red-600">{photoError}</p>}
                                </div>

                                {/* Tagging */}
                                <div className="space-y-4">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Watched With
                                    </label>
                                    <div className="relative">
                                        <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 py-2 focus-within:border-zinc-900 dark:focus-within:border-zinc-100">
                                            <UserPlusIcon className="w-5 h-5 text-zinc-400 mr-3" />
                                            <input
                                                type="text"
                                                value={tagSearchQuery}
                                                onChange={(e) => setTagSearchQuery(e.target.value)}
                                                placeholder="Add friends..."
                                                className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                                            />
                                        </div>

                                        {/* Dropdown */}
                                        {(isTagSearching || tagResults.length > 0) && (
                                            <ul className="absolute z-20 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg max-h-48 overflow-y-auto">
                                                {tagResults.map(user => (
                                                    <li key={user.id} className="flex items-center p-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => handleSelectUser(user)}>
                                                        <Image src={user.profile_pic_url || '/default-avatar.png'} alt={user.username} width={24} height={24} className="rounded-full mr-3" />
                                                        <span className="text-sm font-medium">@{user.username}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {taggedUsers.map(user => (
                                            <div key={user.id} className="flex items-center gap-2 pl-1 pr-2 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-sm">
                                                <input type="hidden" name="watched_with" value={user.id} />
                                                <Image src={user.profile_pic_url || '/default-avatar.png'} alt={user.username} width={16} height={16} className="rounded-full" />
                                                <span>{user.username}</span>
                                                <button type="button" onClick={() => setTaggedUsers(p => p.filter(u => u.id !== user.id))} className="hover:text-red-600"><XMarkIcon className="w-3 h-3" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-8">
                                {state.message && state.message !== 'Success' && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/20">
                                        {state.message}
                                    </div>
                                )}
                                <SubmitButton />
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}