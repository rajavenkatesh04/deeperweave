// app/(inside)/profile/settings/settings-form.tsx

'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { UserProfile } from '@/lib/definitions';
import { updateProfileSettings, type SettingsState } from '@/lib/actions/profile-actions';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="flex h-10 items-center justify-center rounded-lg bg-gray-900 px-6 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
            {pending ? 'Saving...' : 'Save Changes'}
        </button>
    );
}

export default function SettingsForm({ profile }: { profile: UserProfile }) {
    const initialState: SettingsState = { message: null, errors: {} };
    const [state, formAction] = useActionState(updateProfileSettings, initialState);

    const isOver18 = new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() >= 18;

    return (
        <form action={formAction} className="space-y-8">
            {/* Account Visibility Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Profile Visibility</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">Control who can see your profile and activity.</p>
                <fieldset className="mt-4 space-y-4">
                    <div>
                        <label className="flex cursor-pointer items-start gap-4 rounded-md p-3 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                            <input type="radio" name="visibility" value="public" defaultChecked={profile.visibility === 'public'} className="mt-1 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:bg-zinc-700 dark:border-zinc-600" />
                            <div>
                                <span className="font-medium text-gray-900 dark:text-zinc-100">Public</span>
                                <p className="text-sm text-gray-500 dark:text-zinc-400">Anyone can view your profile and posts.</p>
                            </div>
                        </label>
                    </div>
                    <div>
                        <label className="flex cursor-pointer items-start gap-4 rounded-md p-3 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                            <input type="radio" name="visibility" value="private" defaultChecked={profile.visibility === 'private'} className="mt-1 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:bg-zinc-700 dark:border-zinc-600" />
                            <div>
                                <span className="font-medium text-gray-900 dark:text-zinc-100">Private</span>
                                <p className="text-sm text-gray-500 dark:text-zinc-400">Only followers you approve can see your posts.</p>
                            </div>
                        </label>
                    </div>
                </fieldset>
            </div>

            {/* Content Preference Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Content Preference</h3>
                <div className={`mt-4 ${!isOver18 ? 'opacity-50' : ''}`}>
                    <label className="flex cursor-pointer items-center justify-between">
                        <div>
                            <span className="font-medium text-gray-900 dark:text-zinc-100">Show Sensitive Content</span>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Opt-in to view content marked as sensitive (18+).</p>
                        </div>
                        <input type="checkbox" name="content_preference" value="all" defaultChecked={profile.content_preference === 'all'} disabled={!isOver18} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                    </label>
                    {!isOver18 && <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">This setting is disabled as you must be 18 or older.</p>}
                </div>
                {/* Hidden input to ensure 'sfw' is sent if checkbox is unchecked */}
                <input type="hidden" name="content_preference" value="sfw" />
            </div>

            {/* Subscription Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Subscription</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">You are on the <span className="font-bold capitalize text-indigo-600 dark:text-indigo-400">{profile.subscription_status}</span> plan.</p>
                    </div>
                    <a href="#" className="flex h-10 w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 sm:w-auto">
                        Manage Subscription
                    </a>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4">
                {state.message && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>{state.message}</span>
                    </div>
                )}
                <Link href="/profile" className="flex h-10 items-center justify-center rounded-lg px-6 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-800">
                    Cancel
                </Link>
                <SubmitButton />
            </div>
        </form>
    );
}