'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { updateTimelineEntry, type UpdateEntryState } from '@/lib/actions/timeline-actions';
import { searchProfiles } from '@/lib/actions/profile-actions';
import { type ProfileSearchResult, type TimelineEntry } from '@/lib/definitions';
import { geistSans } from "@/app/ui/fonts";
import {
    ArrowLeftIcon,
    PhotoIcon,
    TvIcon,
    TicketIcon,
    UserPlusIcon,
    XMarkIcon,
    LockClosedIcon
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

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

// --- Submit Button ---
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full h-12 flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide shadow-sm"
        >
            {pending ? <LoadingSpinner className="w-5 h-5" /> : 'Save Changes'}
        </button>
    );
}

// --- Main Edit Form Component ---
export default function TimeLineEditForm({
                                             username,
                                             entryToEdit
                                         }: {
    username: string,
    entryToEdit: TimelineEntry;
}) {
    const initialState: UpdateEntryState = { message: null, errors: {} };
    const [state, formAction] = useActionState(updateTimelineEntry, initialState);

    const formRef = useRef<HTMLFormElement>(null);

    const cinematicItem = entryToEdit.movies || entryToEdit.series;
    const mediaType = entryToEdit.movies ? 'movie' : 'tv';

    // Core Entry State
    const [rating, setRating] = useState(entryToEdit.rating ?? 0);
    const [watchedOn, setWatchedOn] = useState(entryToEdit.watched_on);

    // Viewing Context State
    const getInitialMedium = () => {
        if (!entryToEdit.viewing_context) return null;
        if (entryToEdit.viewing_context === 'Theatre') return 'theatre';
        return 'ott';
    };
    const getInitialPlatform = () => {
        if (!entryToEdit.viewing_context || entryToEdit.viewing_context === 'Theatre') return '';
        // Map old values like "Prime Video" to "Prime" if necessary, or ensure backend matches frontend constants
        const found = ottPlatforms.find(p => p.name === entryToEdit.viewing_context || entryToEdit.viewing_context?.includes(p.name));
        return found ? found.name : '';
    };

    const [viewingMedium, setViewingMedium] = useState<'theatre' | 'ott' | null>(getInitialMedium());
    const [selectedPlatform, setSelectedPlatform] = useState<string>(getInitialPlatform());

    // Photo State
    const [photoPreview, setPhotoPreview] = useState<string | null>(entryToEdit.photo_url ?? null);
    const [removePhoto, setRemovePhoto] = useState(false);

    // Tag State
    const [tagSearchQuery, setTagSearchQuery] = useState('');
    const [tagResults, setTagResults] = useState<ProfileSearchResult[]>([]);

    // Initialize tagged users from existing collaborators
    const [taggedUsers, setTaggedUsers] = useState<ProfileSearchResult[]>(
        entryToEdit.timeline_collaborators.map(c => ({
            id: c.profiles.id,
            username: c.profiles.username,
            display_name: c.profiles.username || '',
            profile_pic_url: c.profiles.profile_pic_url ?? null,
            role: 'user',
            visibility: 'public',
            follow_status: 'not_following',
            bio: null
        }))
    );

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

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                alert(`File is too large (max ${MAX_FILE_SIZE_MB}MB).`);
                e.target.value = '';
                return;
            }
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                alert('Invalid file type.');
                e.target.value = '';
                return;
            }
            setPhotoPreview(URL.createObjectURL(file));
            setRemovePhoto(false);
        }
    };

    if (!cinematicItem) return <div>Error loading entry.</div>;

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
                        <h1 className="text-xl font-bold">Edit Entry</h1>
                        <p className="text-sm text-zinc-500">Update your watch history.</p>
                    </div>
                </div>

                <form ref={formRef} action={formAction} className="space-y-8">
                    <input type="hidden" name="entryId" value={entryToEdit.id} />
                    <input type="hidden" name="remove_photo" value={String(removePhoto)} />
                    <input type="hidden" name="cinematicApiId" value={cinematicItem.tmdb_id} />
                    <input type="hidden" name="media_type" value={mediaType} />

                    {/* 1. MEDIA CARD (LOCKED) */}
                    <section className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">Reviewing</label>

                        <div className="relative flex gap-4 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                            {/* Poster */}
                            <div className="relative w-16 h-24 flex-shrink-0 bg-zinc-200 dark:bg-zinc-800 rounded-md overflow-hidden shadow-sm">
                                {cinematicItem.poster_url ? (
                                    <Image
                                        src={cinematicItem.poster_url.startsWith('https')
                                            ? cinematicItem.poster_url
                                            : `https://image.tmdb.org/t/p/w185${cinematicItem.poster_url}`
                                        }
                                        alt={cinematicItem.title}
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
                                <h3 className="font-bold text-lg leading-tight line-clamp-1">{cinematicItem.title}</h3>
                                <p className="text-sm text-zinc-500 mt-1">
                                    {cinematicItem.release_date?.split('-')[0] || 'Unknown Year'} • {mediaType === 'movie' ? 'Film' : 'TV Series'}
                                </p>
                            </div>

                            {/* Lock Icon */}
                            <div className="absolute top-3 right-3 text-zinc-300 dark:text-zinc-600" title="Cannot change item">
                                <LockClosedIcon className="w-4 h-4" />
                            </div>
                        </div>
                    </section>

                    {/* 2. RATING & DATE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* Rating */}
                        <section className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">Rating</label>
                            <StarRatingInput rating={rating} setRating={setRating} />
                            {state.errors?.rating && <p className="text-xs text-red-500">{state.errors.rating[0]}</p>}
                        </section>

                        {/* Date */}
                        <section className="space-y-1">
                            <ModernDatePicker
                                value={watchedOn}
                                onChange={setWatchedOn}
                                label="Watched On"
                            />
                            {state.errors?.watched_on && <p className="text-xs text-red-500 mt-1">{state.errors.watched_on[0]}</p>}
                        </section>
                    </div>

                    {/* 3. REVIEW */}
                    <section className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">Thoughts</label>
                        <textarea
                            name="notes"
                            rows={3}
                            defaultValue={entryToEdit.notes ?? ''}
                            placeholder="Add a review or note..."
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:border-zinc-400 transition-colors resize-none leading-relaxed"
                        />
                        {state.errors?.notes && <p className="text-xs text-red-500">{state.errors.notes[0]}</p>}
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
                            <span className="text-sm font-medium">{photoPreview && !removePhoto ? "Change Image" : "Add Ticket/Photo"}</span>
                            <input type="file" name="photo" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </label>

                        {/* Image Preview - SQUARE, OBJECT-COVER */}
                        {photoPreview && !removePhoto && (
                            <div className="relative w-32 h-32 mb-6 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm group">
                                <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPhotoPreview(null);
                                        setRemovePhoto(true);
                                        const fileInput = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
                                        if(fileInput) fileInput.value = '';
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
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