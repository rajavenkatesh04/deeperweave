'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { updateTimelineEntry, type LogMovieState } from '@/lib/actions/timeline-actions';
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
    CheckIcon
} from '@heroicons/react/24/solid';
import LoadingSpinner from '@/app/ui/loading-spinner';

// --- Star Rating Component ---
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
                                        else if (rating === ratingValue - 0.5) setRating(0);
                                        else setRating(ratingValue);
                                    }}
                                    className="hidden"
                                />
                                <StarIcon
                                    className="h-7 w-7 transition-all duration-150"
                                    style={{
                                        clipPath: (hover || rating) >= ratingValue
                                            ? 'none'
                                            : (hover || rating) >= ratingValue - 0.5
                                                ? 'inset(0 50% 0 0)'
                                                : 'none'
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
                    <button
                        type="button"
                        onClick={() => setRating(0)}
                        className="text-xs text-gray-500 hover:text-red-500"
                        title="Clear rating"
                    >
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

// --- Submit Button ---
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-rose-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
        >
            {pending ? (
                <>
                    <LoadingSpinner className="mr-2"/>
                    Saving...
                </>
            ) : 'Save Changes'}
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
    const initialState: LogMovieState = { message: null, errors: {} };
    const [state, formAction] = useActionState(updateTimelineEntry, initialState);

    const formRef = useRef<HTMLFormElement>(null);

    // Core Entry State (initialized from entryToEdit)
    const [rating, setRating] = useState(entryToEdit.rating ?? 0);
    const [watchedOn, setWatchedOn] = useState(entryToEdit.watched_on);

    // Viewing context state
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

    // Photo state
    const [photoPreview, setPhotoPreview] = useState<string | null>(entryToEdit.photo_url ?? null);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [removePhoto, setRemovePhoto] = useState(false);
    const [isFileValid, setIsFileValid] = useState(!!entryToEdit.photo_url);

    // Tag state
    const [tagSearchQuery, setTagSearchQuery] = useState('');
    const [isTagSearching, setIsTagSearching] = useState(false);
    const [tagResults, setTagResults] = useState<ProfileSearchResult[]>([]);
    const [taggedUsers, setTaggedUsers] = useState<ProfileSearchResult[]>(
        entryToEdit.timeline_collaborators.map(c => ({
            id: c.profiles.id,
            username: c.profiles.username,
            display_name: '',
            profile_pic_url: c.profiles.profile_pic_url ?? null
        }))
    );

    // User tag search effect
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
                setPhotoError('Invalid file type. Please use JPG, PNG, or WEBP.');
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

    return (
        <div className="w-full max-w-lg mx-auto rounded-lg border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Link
                href={`/profile/${username}/timeline`}
                className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Timeline
            </Link>

            <h2 className="text-xl font-bold mb-4">Edit Log Entry</h2>

            <form ref={formRef} action={formAction} className="space-y-6">
                {/* Hidden fields */}
                <input type="hidden" name="entryId" value={entryToEdit.id} />
                <input type="hidden" name="remove_photo" value={String(removePhoto)} />
                <input type="hidden" name="movieApiId" value={entryToEdit.movies.tmdb_id} />

                {/* Movie Display (Locked) */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-zinc-200">
                        Film
                    </label>
                    <div className="p-3 rounded-md border border-gray-300 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800">
                        <div className="flex items-center gap-3">
                            {entryToEdit.movies.poster_url && (
                                <Image
                                    src={entryToEdit.movies.poster_url.startsWith('https')
                                        ? entryToEdit.movies.poster_url
                                        : `https://image.tmdb.org/t/p/w92${entryToEdit.movies.poster_url}`
                                    }
                                    alt={entryToEdit.movies.title}
                                    width={40}
                                    height={60}
                                    className="rounded object-cover"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                    {entryToEdit.movies.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-zinc-400">
                                    {entryToEdit.movies.release_date?.split('-')[0]}
                                </p>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
                            The movie cannot be changed when editing an entry
                        </p>
                    </div>
                </div>

                {/* Watched On & Rating */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="watched_on"
                            className="block text-sm font-medium text-gray-900 dark:text-zinc-200"
                        >
                            Watched On *
                        </label>
                        <input
                            type="date"
                            id="watched_on"
                            name="watched_on"
                            value={watchedOn}
                            onChange={(e) => setWatchedOn(e.target.value)}
                            className={`block w-full rounded-md bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800 ${
                                state.errors?.watched_on ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {state.errors?.watched_on && (
                            <p className="text-sm text-red-500 mt-1">
                                {state.errors.watched_on[0]}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-zinc-200">
                            Rating *
                        </label>
                        <StarRatingInput
                            rating={rating}
                            setRating={setRating}
                            error={state.errors?.rating?.[0]}
                        />
                        <input type="hidden" name="rating" value={rating} />
                    </div>
                </div>

                {/* Viewing Medium */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-900 dark:text-zinc-200">
                        Where did you watch? (Optional)
                    </label>
                    {viewingMedium && (
                        <input type="hidden" name="viewing_medium" value={viewingMedium} />
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setViewingMedium(v => v === 'theatre' ? null : 'theatre')}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                                viewingMedium === 'theatre'
                                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50'
                                    : 'border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500'
                            }`}
                        >
                            <BuildingLibraryIcon
                                className={`w-6 h-6 ${
                                    viewingMedium === 'theatre' ? 'text-rose-600' : 'text-gray-400'
                                }`}
                            />
                            <span className="font-medium text-sm">In Theatres</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setViewingMedium(v => v === 'ott' ? null : 'ott')}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                                viewingMedium === 'ott'
                                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50'
                                    : 'border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500'
                            }`}
                        >
                            <DevicePhoneMobileIcon
                                className={`w-6 h-6 ${
                                    viewingMedium === 'ott' ? 'text-rose-600' : 'text-gray-400'
                                }`}
                            />
                            <span className="font-medium text-sm">At Home (OTT)</span>
                        </button>
                    </div>
                    {state.errors?.viewing_medium && (
                        <p className="text-sm text-red-500 mt-1">
                            {state.errors.viewing_medium[0]}
                        </p>
                    )}
                </div>

                {/* OTT Platform Selector */}
                {viewingMedium === 'ott' && (
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-900 dark:text-zinc-200">
                            On which platform?
                        </label>
                        <input type="hidden" name="ott_platform" value={selectedPlatform} />
                        <div className="flex flex-wrap gap-2">
                            {ottPlatforms.map(platform => (
                                <button
                                    type="button"
                                    key={platform.name}
                                    onClick={() => setSelectedPlatform(p => p === platform.name ? '' : platform.name)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all ${
                                        selectedPlatform === platform.name
                                            ? 'border-transparent ring-2 ring-rose-500'
                                            : 'border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500'
                                    }`}
                                    style={selectedPlatform === platform.name ? {
                                        backgroundColor: platform.color,
                                        color: platform.name === 'Hulu' ? '#000' : '#fff',
                                        borderColor: platform.color
                                    } : {}}
                                >
                                    {platform.logo && (
                                        <Image
                                            src={platform.logo}
                                            alt={platform.name}
                                            width={16}
                                            height={16}
                                            className={
                                                selectedPlatform === platform.name && platform.name !== 'Hulu'
                                                    ? 'brightness-0 invert'
                                                    : ''
                                            }
                                        />
                                    )}
                                    <span className={`text-sm font-medium ${
                                        selectedPlatform === platform.name
                                            ? 'text-inherit'
                                            : 'text-gray-700 dark:text-zinc-300'
                                    }`}>
                                        {platform.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                        {state.errors?.ott_platform && (
                            <p className="text-sm text-red-500 mt-1">
                                {state.errors.ott_platform[0]}
                            </p>
                        )}
                    </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                    <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-gray-900 dark:text-zinc-200"
                    >
                        Notes (Optional)
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        placeholder="Any brief thoughts on the film?"
                        defaultValue={entryToEdit.notes ?? ''}
                        className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                    {state.errors?.notes && (
                        <p className="text-sm text-red-500 mt-1">
                            {state.errors.notes[0]}
                        </p>
                    )}
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-zinc-200">
                        Add a Photo (Optional)
                    </label>
                    <label
                        htmlFor="photo"
                        className={`cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors ${
                            state.errors?.photo || photoError ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        {photoPreview && !removePhoto ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={photoPreview}
                                    alt="Photo preview"
                                    fill
                                    className="rounded-lg object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={clearPhoto}
                                    className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white hover:bg-black/80 z-20"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                                {isFileValid && (
                                    <div className="absolute top-1 left-1 p-0.5 bg-green-500 rounded-full z-10">
                                        <CheckIcon className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <PhotoIcon className="w-8 h-8 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500 dark:text-zinc-400">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 dark:text-zinc-400">
                                    PNG, JPG, or WEBP (MAX. {MAX_FILE_SIZE_MB}MB)
                                </p>
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
                        <p className="text-sm text-red-500 mt-1">
                            {photoError || state.errors?.photo?.[0]}
                        </p>
                    )}
                </div>

                {/* Watched With Tags */}
                <div className="space-y-2">
                    <label
                        htmlFor="tagSearch"
                        className="block text-sm font-medium text-gray-900 dark:text-zinc-200"
                    >
                        Watched With (Optional)
                    </label>

                    {taggedUsers.map(user => (
                        <input
                            key={user.id}
                            type="hidden"
                            name="watched_with"
                            value={user.id}
                        />
                    ))}

                    {taggedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {taggedUsers.map(user => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-2 pl-1 pr-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded-full"
                                >
                                    <Image
                                        src={user.profile_pic_url || '/default-avatar.png'}
                                        alt={user.username}
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                    />
                                    <span className="text-sm font-medium">{user.username}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveUser(user.id)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <XCircleIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="relative">
                        <UserPlusIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="tagSearch"
                            type="text"
                            value={tagSearchQuery}
                            onChange={(e) => setTagSearchQuery(e.target.value)}
                            placeholder="Tag friends..."
                            autoComplete="off"
                            className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 pl-10 pr-3 text-sm shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800"
                        />

                        {(isTagSearching || tagResults.length > 0) && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg dark:bg-zinc-800 dark:border-zinc-700 max-h-48 overflow-y-auto">
                                {isTagSearching ? (
                                    <li className="p-4 text-center">
                                        <LoadingSpinner />
                                    </li>
                                ) : (
                                    tagResults.map(user => (
                                        <li
                                            key={user.id}
                                            className="flex items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700"
                                            onClick={() => handleSelectUser(user)}
                                        >
                                            <Image
                                                src={user.profile_pic_url || '/default-avatar.png'}
                                                alt={user.username}
                                                width={32}
                                                height={32}
                                                className="object-cover mr-3 rounded-full"
                                            />
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

                {/* Error Message */}
                {state.message && state.message !== 'Success' && (
                    <p className="text-sm text-red-500">{state.message}</p>
                )}

                {/* Submit Button */}
                <SubmitButton />
            </form>
        </div>
    );
}