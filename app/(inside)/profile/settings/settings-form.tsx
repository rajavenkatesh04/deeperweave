'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { UserProfile } from '@/lib/definitions';
import { updateProfileSettings, type SettingsState } from '@/lib/actions/profile-actions';
import {
    GlobeAmericasIcon,
    LockClosedIcon,
    EyeSlashIcon,
    ExclamationTriangleIcon,
    TrashIcon,
    UserIcon,
    IdentificationIcon
} from '@heroicons/react/24/solid'; // Using solid icons for clearer visibility
import LoadingSpinner from '@/app/ui/loading-spinner';
import PersonalInformation from "@/app/ui/user/PersonalInformation"; // Ensure this path is correct

/**
 * Loading Button Component
 */
function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="group relative px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-sm"
        >
            {pending && <LoadingSpinner className="w-3 h-3" />}
            <span>{pending ? 'Saving...' : 'Save Changes'}</span>
        </button>
    );
}

/**
 * Main Settings Form
 */
export default function SettingsForm({
                                         profile,
                                         userEmail
                                     }: {
    profile: UserProfile,
    userEmail: string
}) {
    const initialState: SettingsState = { message: null, errors: {} };
    const [state, formAction] = useActionState(updateProfileSettings, initialState);

    // Calculate age for NSFW logic
    const isOver18 = profile.date_of_birth
        ? (new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() >= 18)
        : false;

    // Local state for instant visual feedback on toggles
    const [isNsfw, setIsNsfw] = useState(profile.content_preference === 'all');

    // Format Birthday for Display
    const formattedBirthday = profile.date_of_birth
        ? new Date(profile.date_of_birth).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : null;

    return (
        <div className="space-y-12">
            {/* --- FORM START --- */}
            <form action={formAction} className="space-y-12">

                {/* --- SECTION 2: PRIVACY --- */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <LockClosedIcon className="w-4 h-4" />
                        <h3 className="text-xs font-bold uppercase tracking-wider">Privacy & Visibility</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Public */}
                        <label className="cursor-pointer group relative">
                            <input
                                type="radio"
                                name="visibility"
                                value="public"
                                defaultChecked={profile.visibility === 'public'}
                                className="peer sr-only"
                            />
                            <div className="h-full p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-600 peer-checked:border-zinc-900 dark:peer-checked:border-zinc-100 peer-checked:bg-zinc-50 dark:peer-checked:bg-zinc-900 transition-all">
                                <GlobeAmericasIcon className="w-6 h-6 text-zinc-400 mb-3 peer-checked:text-zinc-900 dark:peer-checked:text-white transition-colors" />
                                <span className="block font-bold text-zinc-900 dark:text-zinc-100 mb-1">Public Profile</span>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    Visible to everyone. Content can be searched and discovered.
                                </p>
                            </div>
                            {/* Selection Indicator */}
                            <div className="absolute top-0 right-0 p-2 opacity-0 peer-checked:opacity-100 transition-opacity">
                                <div className="w-2 h-2 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                            </div>
                        </label>

                        {/* Private */}
                        <label className="cursor-pointer group relative">
                            <input
                                type="radio"
                                name="visibility"
                                value="private"
                                defaultChecked={profile.visibility === 'private'}
                                className="peer sr-only"
                            />
                            <div className="h-full p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-600 peer-checked:border-zinc-900 dark:peer-checked:border-zinc-100 peer-checked:bg-zinc-50 dark:peer-checked:bg-zinc-900 transition-all">
                                <LockClosedIcon className="w-6 h-6 text-zinc-400 mb-3 peer-checked:text-zinc-900 dark:peer-checked:text-white transition-colors" />
                                <span className="block font-bold text-zinc-900 dark:text-zinc-100 mb-1">Private Profile</span>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    Only followers you approve can see your activity.
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 p-2 opacity-0 peer-checked:opacity-100 transition-opacity">
                                <div className="w-2 h-2 bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                            </div>
                        </label>
                    </div>
                </section>

                {/* --- SECTION 3: CONTENT --- */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <EyeSlashIcon className="w-4 h-4" />
                        <h3 className="text-xs font-bold uppercase tracking-wider">Content Preferences</h3>
                    </div>

                    <div className={`
                        flex items-center justify-between p-6 border transition-colors duration-300
                        ${isNsfw
                        ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                    }
                    `}>
                        <div className="max-w-[80%]">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`font-bold text-sm ${isNsfw ? 'text-rose-700 dark:text-rose-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                    Show Sensitive Content (NSFW)
                                </span>
                                {isNsfw && <ExclamationTriangleIcon className="w-4 h-4 text-rose-500" />}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                Enable to view content marked as explicit or mature. Requires 18+ verification.
                            </p>
                        </div>

                        {/* Toggle Switch */}
                        <div className="relative">
                            <input type="hidden" name="content_preference" value="sfw" />
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="content_preference"
                                    value="all"
                                    checked={isNsfw}
                                    disabled={!isOver18}
                                    onChange={(e) => setIsNsfw(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className={`
                                    w-11 h-6 peer-focus:outline-none rounded-full peer 
                                    bg-zinc-200 dark:bg-zinc-700 peer-checked:bg-zinc-900 dark:peer-checked:bg-white
                                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                    after:bg-white dark:after:bg-black after:border-gray-300 after:border after:rounded-full 
                                    after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white
                                    ${!isOver18 ? 'opacity-50 cursor-not-allowed' : ''}
                                `}></div>
                            </label>
                        </div>
                    </div>

                    {!isOver18 && (
                        <p className="text-[10px] text-zinc-400 italic">
                            * This setting is locked because the date of birth indicates you are under 18.
                        </p>
                    )}
                </section>

                {/* --- FEEDBACK & SUBMIT --- */}
                <div className="flex items-center justify-between pt-4">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 min-h-[20px]">
                        {state.message && (
                            <span className="flex items-center gap-2 animate-pulse">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                {state.message}
                            </span>
                        )}
                    </div>
                    <SubmitButton />
                </div>
            </form>

            <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800" />

            {/* --- SECTION 1: PERSONAL INFORMATION --- */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <IdentificationIcon className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Personal Identity</h3>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 shadow-sm">
                    {/* Reusing your existing component, wrapped for consistency */}
                    <PersonalInformation
                        email={userEmail}
                        gender={profile.gender}
                        birthday={formattedBirthday}
                        plan={profile.subscription_status}
                    />
                </div>
                <p className="text-[10px] text-zinc-400 px-1">
                    To change these details, please contact support or edit your profile page.
                </p>
            </section>

            <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800" />

            {/* --- SECTION 4: DANGER ZONE --- */}
            <section className="space-y-6 pt-2">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Danger Zone</h3>
                </div>

                <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h4 className="font-bold text-red-700 dark:text-red-400 text-sm mb-1">Delete Account</h4>
                        <p className="text-xs text-red-600/80 dark:text-red-400/70 max-w-sm leading-relaxed">
                            Permanently remove your profile, timeline entries, and all saved data. This action cannot be undone.
                        </p>
                    </div>
                    <Link
                        href="/profile/delete-account"
                        className="whitespace-nowrap px-5 py-2.5 bg-white dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-sm"
                    >
                        <span className="flex items-center gap-2">
                            <TrashIcon className="w-3 h-3" />
                            Delete Account
                        </span>
                    </Link>
                </div>
            </section>

        </div>
    );
}