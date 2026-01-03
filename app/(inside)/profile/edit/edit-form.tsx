'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfile, Movie, Series } from '@/lib/definitions';
import { updateProfile, EditProfileState, checkUsernameAvailability } from '@/lib/actions/profile-actions';
import { searchCinematic, type CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import {
    PhotoIcon, CheckCircleIcon, XCircleIcon, FilmIcon,
    XMarkIcon, MagnifyingGlassIcon, ArrowLeftIcon, PlusIcon,
    ArrowPathIcon, TrashIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { clsx } from 'clsx';

// --- SUB-COMPONENTS ---

// 1. Search Modal (Unchanged)
function SearchModal({
                         isOpen,
                         onClose,
                         onSelect
                     }: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: CinematicSearchResult) => void;
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CinematicSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (query.trim().length < 2) { setResults([]); return; }
            setLoading(true);
            try {
                const data = await searchCinematic(query);
                setResults(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }, 500);
        return () => clearTimeout(handler);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
                    <h3 className={`${PlayWriteNewZealandFont.className} text-lg font-bold`}>Search Archives</h3>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 relative">
                    <MagnifyingGlassIcon className="absolute left-7 top-7 w-5 h-5 text-zinc-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a movie or show title..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 bg-zinc-100 dark:bg-zinc-900 border-none rounded-lg focus:ring-2 focus:ring-zinc-500 placeholder:text-zinc-400 text-lg"
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <div className="py-10 text-center"><LoadingSpinner /></div>
                    ) : results.length > 0 ? (
                        results.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { onSelect(item); onClose(); setQuery(''); setResults([]); }}
                                className="w-full flex items-center gap-4 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors group text-left"
                            >
                                {item.poster_path ? (
                                    <Image src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.title} width={48} height={72} className="rounded-md object-cover shadow-sm" />
                                ) : (
                                    <div className="w-12 h-[72px] bg-zinc-200 dark:bg-zinc-800 rounded-md flex items-center justify-center"><FilmIcon className="w-6 h-6 text-zinc-400"/></div>
                                )}
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 transition-colors">{item.title}</h4>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide">
                                        {item.release_date?.split('-')[0]} • {item.media_type}
                                    </p>
                                </div>
                            </button>
                        ))
                    ) : query.length > 2 ? (
                        <div className="text-center py-10 text-zinc-500">No records found.</div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

// 2. Responsive Favorite Slot (List on Mobile, Grid on Desktop)
function FavoriteSlot({
                          item,
                          index,
                          onOpenSearch,
                          onRemove,
                          dragStart,
                          dragOver,
                          drop,
                          isDragging
                      }: {
    item: CinematicSearchResult | null;
    index: number;
    onOpenSearch: () => void;
    onRemove: () => void;
    dragStart: () => void;
    dragOver: (e: React.DragEvent) => void;
    drop: () => void;
    isDragging: boolean;
}) {
    return (
        <div
            className={clsx(
                "relative group overflow-hidden border transition-all duration-300 rounded-lg",
                // Mobile: List Layout (Horizontal flex)
                "flex flex-row items-center h-28 w-full p-2 gap-4",
                // Desktop: Grid Layout (Vertical column, Aspect Ratio)
                "md:flex-col md:items-stretch md:h-auto md:p-0 md:gap-0 md:aspect-[2/3]",

                item
                    ? "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    : "border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-100 dark:hover:bg-zinc-900",
                isDragging && "opacity-50 scale-95 ring-2 ring-zinc-500"
            )}
            draggable={!!item}
            onDragStart={dragStart}
            onDragOver={dragOver}
            onDrop={drop}
        >
            {/* Rank Badge */}
            <div className="absolute top-2 left-2 md:top-3 md:left-3 z-20 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border border-white dark:border-zinc-900 text-xs md:text-sm font-black rounded-full shadow-md">
                #{index + 1}
            </div>

            {item ? (
                <>
                    {/* Poster Image */}
                    <div className="relative shrink-0 w-16 h-24 md:w-full md:h-full md:absolute md:inset-0 rounded-md md:rounded-none overflow-hidden shadow-sm md:shadow-none">
                        {item.poster_path ? (
                            <Image src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={item.title} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><FilmIcon className="w-8 h-8 text-zinc-600"/></div>
                        )}
                        {/* Desktop Gradient Overlay */}
                        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 md:absolute md:bottom-0 md:inset-x-0 md:p-4 md:translate-y-2 md:group-hover:translate-y-0 md:transition-transform">
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 md:text-white text-base md:text-lg leading-tight line-clamp-1 md:line-clamp-2">
                            {item.title}
                        </h4>
                        <p className="text-zinc-500 dark:text-zinc-400 md:text-zinc-300 text-xs mt-1">
                            {item.release_date?.split('-')[0]} <span className="md:hidden">• {item.media_type === 'movie' ? 'Film' : 'TV'}</span>
                        </p>
                    </div>

                    {/* Desktop Actions (Hover) */}
                    <div className="hidden md:flex absolute inset-0 items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                        <button type="button" onClick={onOpenSearch} className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-xl" title="Replace">
                            <ArrowPathIcon className="w-5 h-5" />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-xl" title="Remove">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mobile Actions (Visible) */}
                    <div className="md:hidden flex flex-col gap-2">
                        <button type="button" onClick={onOpenSearch} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                            <ArrowPathIcon className="w-5 h-5" />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-2 text-zinc-400 hover:text-red-600">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </>
            ) : (
                /* Empty State */
                <button
                    type="button"
                    onClick={onOpenSearch}
                    className="w-full h-full flex md:flex-col items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors gap-2 md:gap-0"
                >
                    <PlusIcon className="w-8 h-8 md:w-10 md:h-10 md:mb-2 opacity-50" />
                    <span className="text-xs font-semibold uppercase tracking-widest">Add Favorite</span>
                </button>
            )}
        </div>
    );
}

// --- MAIN FORM ---

export default function ProfileEditForm({ profile, favoriteItems }: {
    profile: UserProfile;
    favoriteItems: { rank: number; movies: Movie | null, series: Series | null }[]
}) {
    const initialState: EditProfileState = { message: null, errors: {} };
    const [state, formAction] = useActionState(updateProfile, initialState);

    // Profile & Availability State
    const [previewUrl, setPreviewUrl] = useState<string | null>(profile.profile_pic_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [username, setUsername] = useState(profile.username);
    const [availability, setAvailability] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

    // Favorites State
    const [favItems, setFavItems] = useState<(CinematicSearchResult | null)[]>([null, null, null]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);

    // Drag & Drop Refs
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // --- Load Data ---
    useEffect(() => {
        const initialItems: (CinematicSearchResult | null)[] = [null, null, null];
        favoriteItems.forEach(fav => {
            const item = fav.movies || fav.series;
            if (fav.rank >= 1 && fav.rank <= 3 && item) {
                initialItems[fav.rank - 1] = {
                    id: item.tmdb_id,
                    title: item.title,
                    release_date: item.release_date,
                    poster_path: item.poster_url?.replace('https://image.tmdb.org/t/p/w500', '') || null,
                    media_type: fav.movies ? 'movie' : 'tv'
                };
            }
        });
        setFavItems(initialItems);
    }, [favoriteItems]);

    // --- Logic ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreviewUrl(URL.createObjectURL(file));
    };

    const handleOpenSearch = (index: number) => {
        setActiveSlotIndex(index);
        setIsSearchOpen(true);
    };

    const handleSelectFavorite = (item: CinematicSearchResult) => {
        if (favItems.some(f => f?.id === item.id)) {
            alert("You've already added this title!");
            return;
        }
        const newItems = [...favItems];
        newItems[activeSlotIndex] = item;
        setFavItems(newItems);
    };

    const handleRemoveFavorite = (index: number) => {
        const newItems = [...favItems];
        newItems[index] = null;
        setFavItems(newItems);
    };

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newFilms = [...favItems];
        const draggedItemContent = newFilms[dragItem.current];
        newFilms[dragItem.current] = newFilms[dragOverItem.current];
        newFilms[dragOverItem.current] = draggedItemContent;
        dragItem.current = null;
        dragOverItem.current = null;
        setFavItems(newFilms);
    };

    useEffect(() => {
        if (username === profile.username || username.length < 3) { setAvailability('idle'); return; }
        const handler = setTimeout(() => {
            setAvailability('checking');
            checkUsernameAvailability(username).then(r => setAvailability(r.available ? 'available' : 'taken'));
        }, 500);
        return () => clearTimeout(handler);
    }, [username, profile.username]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20">
            {/* Search Modal (Portal) */}
            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelect={handleSelectFavorite}
            />

            {/* STICKY HEADER */}
            <header className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-all">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/profile" className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to Profile
                    </Link>
                    <span className="text-sm font-medium text-zinc-400 opacity-50 hidden md:block">Editing Profile</span>
                </div>
            </header>

            {/* Main Content (Padded for Header) */}
            <div className="pt-16">

                {/* Aesthetic Hero */}
                <div className="relative h-64 bg-zinc-900 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-10"
                         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />
                    <div className="relative z-10 text-center animate-in fade-in zoom-in duration-700 px-4">
                        <h1 className={`${PlayWriteNewZealandFont.className} text-4xl font-bold text-white mb-2`}>
                            Director's Cut.
                        </h1>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest">
                            Refine Your Persona
                        </p>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 to-transparent" />
                </div>

                {/* Form Container */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
                    <form action={formAction} className="space-y-12">

                        {/* 1. Avatar */}
                        <div className="flex justify-center">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-900 shadow-xl overflow-hidden bg-zinc-200 relative">
                                    <Image src={previewUrl || '/placeholder-user.jpg'} alt="Profile" fill className="object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <PhotoIcon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <input type="file" name="profile_pic" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            </div>
                        </div>

                        {/* 2. Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Display Name</label>
                                <input type="text" name="display_name" defaultValue={profile.display_name} required className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-2 focus:border-zinc-900 dark:focus:border-white outline-none transition-colors rounded-none" />
                                {state.errors?.display_name && <p className="text-xs text-red-500">{state.errors.display_name[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Username</label>
                                    {availability === 'taken' && <span className="text-xs text-red-500 flex items-center gap-1"><XCircleIcon className="w-3 h-3"/> Taken</span>}
                                    {availability === 'available' && <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircleIcon className="w-3 h-3"/> Available</span>}
                                </div>
                                <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} required className={`w-full bg-transparent border-b py-2 outline-none transition-colors rounded-none ${availability === 'taken' ? 'border-red-500 text-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white'}`} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Bio</label>
                            <textarea name="bio" rows={3} defaultValue={profile.bio || ''} className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-2 focus:border-zinc-900 dark:focus:border-white outline-none resize-none rounded-none" placeholder="Your story..." />
                        </div>

                        {/* 3. Favorites Section (Responsive Grid/List) */}
                        <div className="space-y-6 pt-6">
                            <div className="text-center md:text-left">
                                <h3 className={`${PlayWriteNewZealandFont.className} text-3xl font-bold`}>Top 3 Favorites</h3>
                                <p className="text-sm text-zinc-500 mt-1">Select the films that define you.</p>
                            </div>

                            {/* Container adapts via Flex/Grid classes in Sub-component, but here we just need a flex container or grid container wrapper.
                                Since the sub-component handles its own width/height, a simple grid wrapper works best for layout structure. */}
                            <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">
                                {[0, 1, 2].map((i) => (
                                    <FavoriteSlot
                                        key={i}
                                        index={i}
                                        item={favItems[i]}
                                        onOpenSearch={() => handleOpenSearch(i)}
                                        onRemove={() => handleRemoveFavorite(i)}
                                        dragStart={() => dragItem.current = i}
                                        dragOver={(e) => { e.preventDefault(); dragOverItem.current = i; }}
                                        drop={handleDragSort}
                                        isDragging={dragItem.current === i}
                                    />
                                ))}
                            </div>

                            {/* Hidden Inputs for Server Action */}
                            {[0, 1, 2].map((i) => (
                                <div key={`hidden-${i}`}>
                                    <input type="hidden" name={`fav_${i + 1}_id`} value={favItems[i]?.id || ''} />
                                    <input type="hidden" name={`fav_${i + 1}_type`} value={favItems[i]?.media_type || ''} />
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-4 pb-8">
                            <Link href="/profile" className="px-8 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">Cancel</Link>
                            <button type="submit" disabled={state.message === 'Success'} className="px-8 py-3 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-black text-sm font-bold hover:opacity-90 transition-opacity shadow-lg">
                                {state.message === 'Success' ? 'Saved' : 'Save Changes'}
                            </button>
                        </div>

                        {state.message && (
                            <p className={`text-center text-sm font-medium ${state.message === 'Success' ? 'text-green-600' : 'text-red-600'}`}>{state.message}</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}