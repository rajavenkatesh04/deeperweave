// app/(inside)/profile/edit/edit-form.tsx

'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfile } from '@/lib/definitions';
import { updateProfile, EditProfileState } from '@/lib/actions/profile-actions';
import { checkUsernameAvailability } from '@/lib/actions/profile-actions';
import { PhotoIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '@/app/ui/loading-spinner';

// --- Submit Button Sub-component ---
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-900 px-6 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
            {pending ? <LoadingSpinner /> : 'Save Changes'}
        </button>
    );
}

// --- Main EditForm Component ---
export default function ProfileEditForm({ profile }: { profile: UserProfile }) {
    const initialState: EditProfileState = { message: null, errors: {} };
    const [state, formAction] = useActionState(updateProfile, initialState);

    // State for image preview
    const [previewUrl, setPreviewUrl] = useState<string | null>(profile.profile_pic_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for username availability
    const [username, setUsername] = useState(profile.username);
    const [availability, setAvailability] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [debouncedUsername, setDebouncedUsername] = useState(profile.username);

    // Debounce effect for username checking
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedUsername(username);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [username]);

    // Effect to check username availability when debounced value changes
    useEffect(() => {
        if (debouncedUsername === profile.username) {
            setAvailability('idle');
            return;
        }
        if (debouncedUsername.length < 3) {
            setAvailability('idle');
            return;
        }

        setAvailability('checking');
        checkUsernameAvailability(debouncedUsername).then(result => {
            setAvailability(result.available ? 'available' : 'taken');
        });

    }, [debouncedUsername, profile.username]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <form action={formAction} className="space-y-8">
            {/* Profile Picture Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Profile Picture</h3>
                <div className="mt-4 flex items-center gap-6">
                    <Image
                        src={previewUrl || '/placeholder-user.jpg'}
                        alt="Profile picture preview"
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-full object-cover"
                    />
                    <input
                        type="file"
                        name="profile_pic"
                        id="profile_pic"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    >
                        <PhotoIcon className="h-5 w-5" />
                        Change Picture
                    </button>
                </div>
            </div>

            {/* Profile Details Form */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Your Details</h3>
                <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                    {/* Display Name */}
                    <div>
                        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Display Name</label>
                        <input type="text" name="display_name" id="display_name" defaultValue={profile.display_name} required className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                        {state.errors?.display_name && <p className="mt-1 text-sm text-red-600">{state.errors.display_name[0]}</p>}
                    </div>

                    {/* Username */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Username</label>
                        <div className="relative mt-1">
                            <input
                                type="text"
                                name="username"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                required
                                className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                {availability === 'checking' && <LoadingSpinner className="h-5 w-5" />}
                                {availability === 'available' && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                                {availability === 'taken' && <XCircleIcon className="h-5 w-5 text-red-500" />}
                            </div>
                        </div>
                        {state.errors?.username ? (
                            <p className="mt-1 text-sm text-red-600">{state.errors.username[0]}</p>
                        ) : (
                            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">Must be unique, lowercase, and contain only letters, numbers, or underscores.</p>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="sm:col-span-2">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Bio</label>
                        <textarea name="bio" id="bio" rows={3} defaultValue={profile.bio || ''} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" placeholder="A little about yourself..."></textarea>
                        {state.errors?.bio && <p className="mt-1 text-sm text-red-600">{state.errors.bio[0]}</p>}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
                <Link href="/profile" className="flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-6 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                    Cancel
                </Link>
                <SubmitButton />
            </div>
        </form>
    );
}