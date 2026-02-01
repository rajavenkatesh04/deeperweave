'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { logEntry, type LogEntryState } from '@/lib/actions/timeline-actions';
import {
    searchCinematic,
    type CinematicSearchResult,
    getSeriesDetails,
    getMovieDetails
} from '@/lib/actions/cinematic-actions';
import { searchProfiles } from '@/lib/actions/profile-actions';
import { type ProfileSearchResult } from '@/lib/definitions';
import { geistSans } from "@/app/ui/fonts";
import {
    XMarkIcon,
    ArrowLeftIcon,
    PhotoIcon,
    MagnifyingGlassIcon,
    TvIcon,
    TicketIcon,
    UserPlusIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';
import clsx from 'clsx';
import StarRatingInput from "@/app/ui/timeline/StarRatingInput";
import ModernDatePicker from "@/app/ui/ModernDatePicker";

// --- Constants ---
const ottPlatforms = [
    { name: 'Netflix', color: 'bg-[#E50914]' },
    { name: 'Prime', color: 'bg-[#00A8E1]' },
    { name: 'Disney+', color: 'bg-[#011c70]' },
    { name: 'Hulu', color: 'bg-[#1CE783]' },
    { name: 'Max', color: 'bg-[#002be7]' },
    { name: 'Apple', color: 'bg-[#000000]' },
];

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full h-12 flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide shadow-sm"
        >
            {pending ? <LoadingSpinner className="w-5 h-5" /> : 'Log Entry'}
        </button>
    );
}

export default function TimeLineEntryForm({
                                              username,
                                              initialId,
                                              initialType
                                          }: {
    username: string;
    initialId?: string;
    initialType?: string;
}) {
    // --- Initial Fetch Logic ---
    useEffect(() => {
        const fetchInitialItem = async () => {
            if (initialId && initialType && !selectedItem && !searchQuery) {
                try {
                    const numericId = parseInt(initialId);
                    let fetchedDetails;
                    let normalizedItem: CinematicSearchResult | undefined;

                    if (initialType === 'movie') {
                        fetchedDetails = await getMovieDetails(numericId);
                        // @ts-ignore
                        normalizedItem = { ...fetchedDetails, media_type: 'movie', id: numericId };
                    } else if (initialType === 'tv') {
                        fetchedDetails = await getSeriesDetails(numericId);
                        // @ts-ignore
                        normalizedItem = { ...fetchedDetails, media_type: 'tv', id: numericId };
                    } else return;

                    if (normalizedItem) {
                        setSelectedItem(normalizedItem);
                        setSearchQuery(normalizedItem.title);
                        justSelectedItem.current = true;
                    }
                } catch (error) { console.error(error); }
            }
        };
        fetchInitialItem();
    }, [initialId, initialType]);

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
    const [tagSearchQuery, setTagSearchQuery] = useState('');
    const [tagResults, setTagResults] = useState<ProfileSearchResult[]>([]);
    const [taggedUsers, setTaggedUsers] = useState<ProfileSearchResult[]>([]);

    // Reset Effect
    useEffect(() => {
        if (state.message === 'Success') {
            formRef.current?.reset();
            setSearchQuery(''); setSelectedItem(null); setRating(0); setWatchedOn(today);
            setViewingMedium(null); setSelectedPlatform(''); setPhotoPreview(null);
            setTaggedUsers([]);
        }
    }, [state, today]);

    // Cinematic Search Effect
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

    // Tag Search Effect
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (tagSearchQuery.trim().length < 2) { setTagResults([]); return; }
            try {
                const results = await searchProfiles(tagSearchQuery);
                setTagResults(results.filter(u => !taggedUsers.some(t => t.id === u.id)));
            } catch (error) { console.error(error); }
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

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPhotoPreview(URL.createObjectURL(file));
        else setPhotoPreview(null);
    };

    return (
        <div className={`min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 pb-24 pt-8 ${geistSans.className}`}>

            <div className="max-w-xl mx-auto px-4 md:px-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/profile/${username}/timeline`}
                        className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">New Entry</h1>
                        <p className="text-sm text-zinc-500">Record your watch history.</p>
                    </div>
                </div>

                <form ref={formRef} action={formAction} className="space-y-8">

                    {/* 1. MOVIE SELECTION - UPDATED WITH CARD PREVIEW */}
                    <section className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">Title</label>

                        {selectedItem ? (
                            // --- PREVIEW CARD ---
                            <div className="relative flex gap-4 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                                {/* Poster */}
                                <div className="relative w-16 h-24 flex-shrink-0 bg-zinc-200 dark:bg-zinc-800 rounded-md overflow-hidden shadow-sm">
                                    {selectedItem.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w185${selectedItem.poster_path}`}
                                            alt={selectedItem.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                            <TvIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 py-1 pr-8">
                                    <h3 className="font-bold text-lg leading-tight line-clamp-1">{selectedItem.title}</h3>
                                    <p className="text-sm text-zinc-500 mt-1">
                                        {selectedItem.release_date?.split('-')[0] || 'Unknown Year'} • {selectedItem.media_type === 'movie' ? 'Film' : 'TV Series'}
                                    </p>
                                    <p className="text-xs text-zinc-400 mt-2 line-clamp-1">{selectedItem.overview}</p>
                                </div>

                                {/* Close Button */}
                                <button
                                    type="button"
                                    onClick={() => { setSelectedItem(null); setSearchQuery(''); }}
                                    className="absolute top-2 right-2 p-1.5 bg-white dark:bg-black hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-600 rounded-full border border-zinc-200 dark:border-zinc-700 transition-colors shadow-sm z-10"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>

                                {/* Hidden Inputs */}
                                <input type="hidden" name="cinematicApiId" value={selectedItem.id} />
                                <input type="hidden" name="media_type" value={selectedItem.media_type} />
                            </div>
                        ) : (
                            // --- SEARCH INPUT ---
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {isSearching ? <LoadingSpinner className="w-4 h-4" /> : <MagnifyingGlassIcon className="w-5 h-5 text-zinc-400" />}
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search film or series..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                                />

                                {/* Dropdown Results */}
                                {searchResults.length > 0 && (
                                    <ul className="absolute z-30 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {searchResults.map((item) => (
                                            <li
                                                key={item.id}
                                                onClick={() => handleSelectItem(item)}
                                                className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                                            >
                                                {item.poster_path ? (
                                                    <Image src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" width={32} height={48} className="rounded-sm object-cover shadow-sm" />
                                                ) : (
                                                    <div className="w-8 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-sm flex-shrink-0" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.title}</p>
                                                    <p className="text-xs text-zinc-500">{item.release_date?.split('-')[0] || 'Unknown'} • {item.media_type === 'movie' ? 'Film' : 'TV'}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </section>

                    {/* 2. RATING & DATE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* Rating */}
                        <section className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">Rating</label>
                            <StarRatingInput rating={rating} setRating={setRating} />
                        </section>

                        {/* Date */}
                        <section className="space-y-1">
                            <ModernDatePicker
                                value={watchedOn}
                                onChange={setWatchedOn}
                                label="Watched On"
                            />
                        </section>
                    </div>

                    {/* 3. REVIEW */}
                    <section className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">Thoughts</label>
                        <textarea
                            name="notes"
                            rows={3}
                            placeholder="Add a review or note..."
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:border-zinc-400 transition-colors resize-none leading-relaxed"
                        />
                    </section>

                    {/* 4. PLATFORM & TAGS */}
                    <div className="space-y-6 pt-2">
                        {/* Medium Selector */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setViewingMedium('theatre'); setSelectedPlatform(''); }}
                                className={clsx(
                                    "flex-1 py-3 rounded-xl border text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all",
                                    viewingMedium === 'theatre' ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                )}
                            >
                                <TicketIcon className="w-4 h-4" /> Theatre
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewingMedium('ott')}
                                className={clsx(
                                    "flex-1 py-3 rounded-xl border text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all",
                                    viewingMedium === 'ott' ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                )}
                            >
                                <TvIcon className="w-4 h-4" /> Digital
                            </button>
                            <input type="hidden" name="viewing_medium" value={viewingMedium || ''} />
                        </div>

                        {/* OTT List */}
                        {viewingMedium === 'ott' && (
                            <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2">
                                {ottPlatforms.map(p => (
                                    <button
                                        key={p.name}
                                        type="button"
                                        onClick={() => setSelectedPlatform(p.name)}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                                            selectedPlatform === p.name ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900" : "bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                                        )}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                                <input type="hidden" name="ott_platform" value={selectedPlatform} />
                            </div>
                        )}

                        {/* Friends Tagging */}
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <UserPlusIcon className="w-4 h-4 text-zinc-400" />
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">With Friends</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl min-h-[48px]">
                                {taggedUsers.map(user => (
                                    <div key={user.id} className="flex items-center gap-1 pl-1 pr-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-sm">
                                        <input type="hidden" name="watched_with" value={user.id} />
                                        <Image src={user.profile_pic_url || '/default-avatar.png'} alt="" width={16} height={16} className="rounded-full" />
                                        <span className="text-xs font-medium">{user.username}</span>
                                        <button type="button" onClick={() => setTaggedUsers(p => p.filter(u => u.id !== user.id))} className="text-zinc-400 hover:text-red-500"><XMarkIcon className="w-3 h-3" /></button>
                                    </div>
                                ))}
                                <input
                                    type="text"
                                    value={tagSearchQuery}
                                    onChange={(e) => setTagSearchQuery(e.target.value)}
                                    placeholder="Add..."
                                    className="bg-transparent text-sm focus:outline-none min-w-[60px] flex-1 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                                />
                            </div>

                            {/* Friend Results */}
                            {tagResults.length > 0 && (
                                <ul className="absolute z-20 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg">
                                    {tagResults.map(user => (
                                        <li key={user.id} onClick={() => { setTaggedUsers(p => [...p, user]); setTagSearchQuery(''); setTagResults([]); }} className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">
                                            <Image src={user.profile_pic_url || '/default-avatar.png'} alt="" width={24} height={24} className="rounded-full" />
                                            <span className="text-sm">@{user.username}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* 5. PHOTO & SUBMIT */}
                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                        <label className="flex items-center gap-3 w-max cursor-pointer text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-6 group">
                            <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full group-hover:scale-110 transition-transform">
                                <PhotoIcon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium">{photoPreview ? "Change Image" : "Add Ticket/Photo"}</span>
                            <input type="file" name="photo" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </label>

                        {photoPreview && (
                            <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                                <button type="button" onClick={() => setPhotoPreview(null)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors"><XMarkIcon className="w-4 h-4" /></button>
                            </div>
                        )}

                        {state.message && state.message !== 'Success' && (
                            <p className="text-sm text-red-600 mb-4 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-800/20">{state.message}</p>
                        )}

                        <SubmitButton />
                    </div>

                </form>
            </div>
        </div>
    );
}