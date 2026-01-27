'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { updateTimelineEntry, type UpdateEntryState } from '@/lib/actions/timeline-actions';
import { searchProfiles } from '@/lib/actions/profile-actions';
import { type ProfileSearchResult, type TimelineEntry } from '@/lib/definitions';

import {
    StarIcon,
    XCircleIcon,
    ArrowLeftIcon,
    BuildingLibraryIcon,
    DevicePhoneMobileIcon,
    PhotoIcon,
    UserPlusIcon,
    XMarkIcon,
    CheckIcon,
    TvIcon,
    FilmIcon,
    CalendarIcon,
    LockClosedIcon
} from '@heroicons/react/24/solid';
import LoadingSpinner from '@/app/ui/loading-spinner';

// --- Star Rating Component ---
function StarRatingInput({ rating, setRating, error }: { rating: number; setRating: (rating: number) => void; error?: string }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
                <div className={`flex p-1 -ml-1 rounded-lg ${error ? 'ring-2 ring-red-500/50 bg-red-50 dark:bg-red-900/10' : ''}`}>
                    {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={ratingValue} className="cursor-pointer group relative">
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
                                    className="h-8 w-8 transition-transform duration-100 group-hover:scale-110"
                                    style={{ clipPath: (hover || rating) >= ratingValue ? 'none' : (hover || rating) >= ratingValue - 0.5 ? 'inset(0 50% 0 0)' : 'none' }}
                                    color={(hover || rating) >= ratingValue - 0.5 ? '#f59e0b' : '#e4e4e7'}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                />
                                <StarIcon className="absolute top-0 left-0 h-8 w-8 text-gray-200 dark:text-zinc-700 -z-10" />
                            </label>
                        );
                    })}
                </div>
                {rating > 0 && (
                    <button type="button" onClick={() => setRating(0)} className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">Clear</button>
                )}
            </div>
            {error ? <p className="text-xs text-red-500 font-medium">{error}</p> : null}
        </div>
    );
}

// --- Submit Button ---
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-rose-600 px-6 text-base font-semibold text-white shadow-lg shadow-rose-600/20 transition-all hover:bg-rose-700 hover:shadow-rose-700/30 disabled:cursor-not-allowed disabled:bg-rose-400 disabled:shadow-none"
        >
            {pending ? <><LoadingSpinner className="mr-2"/> Saving Changes...</> : 'Save Changes'}
        </button>
    );
}

// --- Constants ---
const ottPlatforms = [
    { name: 'Netflix', logo: '/logos/netflix.svg', color: '#E50914' },
    { name: 'Prime Video', logo: '/logos/prime-video.svg', color: '#00A8E1' },
    { name: 'Disney+', logo: '/logos/disney-plus.svg', color: '#011c70' },
    { name: 'Hulu', logo: '/logos/hulu.svg', color: '#1CE783' },
    { name: 'Max', logo: '/logos/max.svg', color: '#002be7' },
    { name: 'Apple TV+', logo: '/logos/apple-tv.svg', color: '#000000' },
    { name: 'Other', logo: null, color: '#6b7280' },
];

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

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
        return entryToEdit.viewing_context;
    };
    const [viewingMedium, setViewingMedium] = useState<'theatre' | 'ott' | null>(getInitialMedium());
    const [selectedPlatform, setSelectedPlatform] = useState<string>(getInitialPlatform());

    // Photo State
    const [photoPreview, setPhotoPreview] = useState<string | null>(entryToEdit.photo_url ?? null);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [removePhoto, setRemovePhoto] = useState(false);
    const [isFileValid, setIsFileValid] = useState(!!entryToEdit.photo_url);

    // Tag State
    const [tagSearchQuery, setTagSearchQuery] = useState('');
    const [isTagSearching, setIsTagSearching] = useState(false);
    const [tagResults, setTagResults] = useState<ProfileSearchResult[]>([]);

    // ✨ FIX: Updated taggedUsers initialization to match new ProfileSearchResult type
    const [taggedUsers, setTaggedUsers] = useState<ProfileSearchResult[]>(
        entryToEdit.timeline_collaborators.map(c => ({
            id: c.profiles.id,
            username: c.profiles.username,
            display_name: c.profiles.username || '', // Use actual name if available
            profile_pic_url: c.profiles.profile_pic_url ?? null,
            // Default values for fields not present in timeline_collaborators join
            role: 'user',
            visibility: 'public',
            follow_status: 'not_following',
            bio: null
        }))
    );

    // Effects & Handlers
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (tagSearchQuery.trim().length < 2) {
                setTagResults([]);
                return;
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

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (photoPreview && !photoPreview.startsWith('http')) {
            URL.revokeObjectURL(photoPreview);
        }
        setIsFileValid(false);
        setRemovePhoto(false);
        if (file) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setPhotoError(`File is too large (max ${MAX_FILE_SIZE_MB}MB).`);
                setPhotoPreview(null);
                e.target.value = '';
                return;
            }
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                setPhotoError('Invalid file type.');
                setPhotoPreview(null);
                e.target.value = '';
                return;
            }
            setPhotoError(null);
            setPhotoPreview(URL.createObjectURL(file));
            setIsFileValid(true);
        } else {
            setPhotoPreview(null);
            setPhotoError(null);
        }
    };

    const clearPhoto = () => {
        if (photoPreview && !photoPreview.startsWith('http')) {
            URL.revokeObjectURL(photoPreview);
        }
        setPhotoPreview(null);
        setPhotoError(null);
        setIsFileValid(false);
        const fileInput = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        if (entryToEdit.photo_url) {
            setRemovePhoto(true);
        }
    };

    const handleSelectUser = (user: ProfileSearchResult) => {
        setTaggedUsers(prev => [...prev, user]);
        setTagSearchQuery('');
        setTagResults([]);
    };
    const handleRemoveUser = (userId: string) => {
        setTaggedUsers(prev => prev.filter(user => user.id !== userId));
    };

    if (!cinematicItem) return <div>Error loading entry.</div>;

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Header / Nav */}
            <div className="mb-6 px-1">
                <Link
                    href={`/profile/${username}/timeline`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Timeline
                </Link>
                <h2 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">Edit Entry</h2>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <form ref={formRef} action={formAction}>
                    <input type="hidden" name="entryId" value={entryToEdit.id} />
                    <input type="hidden" name="remove_photo" value={String(removePhoto)} />
                    <input type="hidden" name="cinematicApiId" value={cinematicItem.tmdb_id} />
                    <input type="hidden" name="media_type" value={mediaType} />

                    {/* Responsive Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-zinc-800">

                        {/* --- LEFT COLUMN: The "Facts" (Locked Item, Date, Rating) --- */}
                        <div className="lg:col-span-5 p-4 md:p-8 space-y-8">

                            {/* Locked Item Card */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-900 dark:text-zinc-100">
                                    Reviewing
                                </label>
                                <div className="relative group overflow-hidden">
                                    <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 dark:bg-zinc-800/50 dark:border-zinc-700">
                                        {cinematicItem.poster_url && (
                                            <Image
                                                src={cinematicItem.poster_url.startsWith('https')
                                                    ? cinematicItem.poster_url
                                                    : `https://image.tmdb.org/t/p/w154${cinematicItem.poster_url}`
                                                }
                                                alt={cinematicItem.title}
                                                width={70}
                                                height={105}
                                                className="rounded-lg shadow-sm object-cover"
                                            />
                                        )}
                                        <div className="flex-1 py-1">
                                            <h3 className="font-bold text-lg leading-tight text-gray-900 dark:text-white">{cinematicItem.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">{cinematicItem.release_date?.split('-')[0]}</p>

                                            <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                                                mediaType === 'movie'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800'
                                                    : 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800'
                                            }`}>
                                                {mediaType === 'movie' ? <FilmIcon className="w-3 h-3" /> : <TvIcon className="w-3 h-3" />}
                                                <span className="uppercase tracking-wide">{mediaType === 'movie' ? 'Movie' : 'TV'}</span>
                                            </div>
                                        </div>
                                        {/* Lock Indicator */}
                                        <div className="absolute top-3 right-3 text-gray-400" title="Item cannot be changed">
                                            <LockClosedIcon className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-zinc-800 pt-6 space-y-6">
                                {/* Date & Rating Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="watched_on" className="block text-sm font-semibold text-gray-900 dark:text-zinc-100">Date <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                id="watched_on"
                                                name="watched_on"
                                                value={watchedOn}
                                                onChange={(e) => setWatchedOn(e.target.value)}
                                                className={`block w-full rounded-lg bg-gray-50 py-2.5 px-3 text-sm shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-rose-500 dark:bg-zinc-800 dark:text-white ${state.errors?.watched_on ? 'ring-red-300 dark:ring-red-900' : 'ring-gray-200 dark:ring-zinc-700'}`}
                                            />
                                            <CalendarIcon className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none"/>
                                        </div>
                                        {state.errors?.watched_on && <p className="text-sm text-red-500 mt-1">{state.errors.watched_on[0]}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-900 dark:text-zinc-100">Rating <span className="text-rose-500">*</span></label>
                                        <StarRatingInput rating={rating} setRating={setRating} error={state.errors?.rating?.[0]} />
                                        <input type="hidden" name="rating" value={rating} />
                                    </div>
                                </div>

                                {/* Viewing Medium */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-900 dark:text-zinc-100">Where did you watch?</label>
                                    {viewingMedium && <input type="hidden" name="viewing_medium" value={viewingMedium} />}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button" onClick={() => setViewingMedium(v => v === 'theatre' ? null : 'theatre')} className={`flex flex-row items-center justify-center gap-3 p-3 rounded-xl border transition-all ${viewingMedium === 'theatre' ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-200' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'}`}>
                                            <BuildingLibraryIcon className="w-5 h-5" />
                                            <span className="font-medium text-sm">Theatre</span>
                                        </button>
                                        <button type="button" onClick={() => setViewingMedium(v => v === 'ott' ? null : 'ott')} className={`flex flex-row items-center justify-center gap-3 p-3 rounded-xl border transition-all ${viewingMedium === 'ott' ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-200' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'}`}>
                                            <DevicePhoneMobileIcon className="w-5 h-5" />
                                            <span className="font-medium text-sm">Digital / Home</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Platform (Conditional) */}
                                {viewingMedium === 'ott' && (
                                    <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-200">
                                        <label className="block text-sm font-semibold text-gray-900 dark:text-zinc-100">Platform</label>
                                        <input type="hidden" name="ott_platform" value={selectedPlatform} />
                                        <div className="flex flex-wrap gap-2">
                                            {ottPlatforms.map(platform => (
                                                <button type="button" key={platform.name} onClick={() => setSelectedPlatform(p => p === platform.name ? '' : platform.name)}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${selectedPlatform === platform.name ? 'border-transparent ring-2 ring-offset-1 ring-rose-500 dark:ring-offset-zinc-900' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'}`}
                                                        style={selectedPlatform === platform.name ? { backgroundColor: platform.color, color: platform.name === 'Hulu' ? '#000' : '#fff' } : {}}
                                                >
                                                    {platform.logo && <Image src={platform.logo} alt={platform.name} width={16} height={16} className={selectedPlatform === platform.name && platform.name !== 'Hulu' ? 'brightness-0 invert' : ''} />}
                                                    <span className={`text-xs font-medium ${selectedPlatform === platform.name ? 'text-inherit' : 'text-gray-700 dark:text-zinc-300'}`}>{platform.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- RIGHT COLUMN: The "Experience" (Notes, Photo, Tags) --- */}
                        <div className="lg:col-span-7 p-4 md:p-8 space-y-8 bg-gray-50/50 dark:bg-black/20">

                            {/* Notes */}
                            <div className="space-y-3">
                                <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 dark:text-zinc-100">Notes & Thoughts</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={4}
                                    defaultValue={entryToEdit.notes ?? ''}
                                    placeholder="Update your review..."
                                    className="block w-full rounded-xl border-gray-200 bg-white py-3 px-4 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white resize-none"
                                />
                                {state.errors?.notes && <p className="text-sm text-red-500 mt-1">{state.errors.notes[0]}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Photo Upload */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-900 dark:text-zinc-100">Memory (Photo)</label>
                                    <label htmlFor="photo" className={`relative cursor-pointer flex flex-col items-center justify-center w-full aspect-square md:aspect-video rounded-xl border-2 border-dashed transition-all overflow-hidden ${state.errors?.photo || photoError ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 bg-white hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700'}`}>
                                        {photoPreview && !removePhoto ? (
                                            <>
                                                <Image
                                                    src={photoPreview}
                                                    alt="Photo preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <p className="text-white text-xs font-medium">Change Photo</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {e.preventDefault(); clearPhoto();}}
                                                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-600 transition-colors z-20"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                                {isFileValid && (
                                                    <div className="absolute top-2 left-2 p-1 bg-green-500 rounded-full z-10 shadow-sm">
                                                        <CheckIcon className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-4 text-center">
                                                <PhotoIcon className="w-8 h-8 mb-2 text-gray-400" />
                                                <p className="text-xs text-gray-500 dark:text-zinc-400">Upload Ticket or Moment</p>
                                            </div>
                                        )}
                                        <input
                                            id="photo"
                                            name="photo"
                                            type="file"
                                            className="hidden"
                                            accept="image/png, image/jpeg, image/webp, image/heic"
                                            onChange={handlePhotoChange}
                                        />
                                    </label>
                                    {(photoError || state.errors?.photo) && (
                                        <p className="text-xs text-red-500">{photoError || state.errors?.photo?.[0]}</p>
                                    )}
                                </div>

                                {/* Tagging */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-900 dark:text-zinc-100">Watched With</label>
                                    <div className="relative">
                                        <div className="flex items-center w-full rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-3 py-2 focus-within:ring-2 focus-within:ring-rose-500 focus-within:border-transparent">
                                            <UserPlusIcon className="w-5 h-5 text-gray-400 mr-2" />
                                            <input
                                                type="text"
                                                value={tagSearchQuery}
                                                onChange={(e) => setTagSearchQuery(e.target.value)}
                                                placeholder="Search friends..."
                                                className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 placeholder:text-gray-400 dark:text-white"
                                            />
                                        </div>

                                        {(isTagSearching || tagResults.length > 0) && (
                                            <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-zinc-800 dark:border-zinc-700 max-h-48 overflow-y-auto">
                                                {isTagSearching ? (
                                                    <li className="p-4 text-center">
                                                        <LoadingSpinner />
                                                    </li>
                                                ) : (
                                                    tagResults.map(user => (
                                                        <li
                                                            key={user.id}
                                                            className="flex items-center p-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700/50"
                                                            onClick={() => handleSelectUser(user)}
                                                        >
                                                            <Image
                                                                src={user.profile_pic_url || '/default-avatar.png'}
                                                                alt={user.username}
                                                                width={28}
                                                                height={28}
                                                                className="object-cover mr-3 rounded-full"
                                                            />
                                                            <div className="overflow-hidden">
                                                                <p className="font-semibold text-sm truncate">{user.display_name}</p>
                                                                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                                                            </div>
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        )}
                                    </div>

                                    {/* Selected Tags List */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {taggedUsers.map(user => (
                                            <div
                                                key={user.id}
                                                className="flex items-center gap-2 pl-1 pr-2 py-1 bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200 rounded-full text-xs font-medium animate-in zoom-in duration-200"
                                            >
                                                <input type="hidden" name="watched_with" value={user.id} />
                                                <Image
                                                    src={user.profile_pic_url || '/default-avatar.png'}
                                                    alt={user.username}
                                                    width={20}
                                                    height={20}
                                                    className="rounded-full"
                                                />
                                                <span>{user.username}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveUser(user.id)}
                                                    className="hover:text-red-600"
                                                >
                                                    <XCircleIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Submit & Status */}
                            <div className="pt-4 border-t border-gray-200 dark:border-zinc-700">
                                {state.message && state.message !== 'Success' && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 dark:bg-red-900/20 dark:border-red-900/50">
                                        {state.message}
                                    </div>
                                )}
                                <SubmitButton />
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}