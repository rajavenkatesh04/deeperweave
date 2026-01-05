// app/(inside)/profile/settings/settings-form.tsx

'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { UserProfile } from '@/lib/definitions';
import { updateProfileSettings, type SettingsState } from '@/lib/actions/profile-actions';
import {
    GlobeAmericasIcon,
    LockClosedIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/solid';
// 👇 Import the spinner
import LoadingSpinner from '@/app/ui/loading-spinner';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="group relative px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 font-medium text-sm tracking-widest uppercase transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden min-w-[200px]"
        >
            {/* Content Container (Z-Index ensures it stays above the hover effect) */}
            <span className="relative z-10 flex items-center justify-center gap-3">
                {pending ? (
                    <>
                        {/* 👇 Spinner added here with specific sizing */}
                        <LoadingSpinner className="w-4 h-4 text-zinc-50 dark:text-zinc-900" />
                        <span>Saving...</span>
                    </>
                ) : (
                    <span>Save Configuration</span>
                )}
            </span>

            {/* Hover Slide Effect */}
            {!pending && (
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            )}
        </button>
    );
}

export default function SettingsForm({ profile }: { profile: UserProfile }) {
    const initialState: SettingsState = { message: null, errors: {} };
    const [state, formAction] = useActionState(updateProfileSettings, initialState);

    // Determine if user is 18+
    const isOver18 = new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() >= 18;

    // Initialize state based on current profile preference
    const [isNsfw, setIsNsfw] = useState(profile.content_preference === 'all');

    return (
        <form action={formAction} className="space-y-16">

            {/* 1. VISIBILITY SECTION */}
            <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                        Signal Transmission
                    </h3>
                    <span className="text-[10px] uppercase text-zinc-400 font-mono">
                        Step 01
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Public Option */}
                    <label className="cursor-pointer group">
                        <input
                            type="radio"
                            name="visibility"
                            value="public"
                            defaultChecked={profile.visibility === 'public'}
                            className="peer sr-only"
                        />
                        <div className="h-full border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-600 peer-checked:border-zinc-900 dark:peer-checked:border-zinc-100 peer-checked:bg-zinc-50 dark:peer-checked:bg-zinc-900 transition-all duration-300 relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900 dark:bg-zinc-100 scale-x-0 peer-checked:scale-x-100 transition-transform duration-300 origin-left" />
                            <GlobeAmericasIcon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 peer-checked:text-zinc-900 dark:peer-checked:text-zinc-100 mb-4 transition-colors" />
                            <span className="block text-lg font-light text-zinc-900 dark:text-zinc-100 mb-2">Public</span>
                            <p className="text-sm text-zinc-500 leading-relaxed font-light">
                                Your profile, logs, and lists are visible to all users.
                            </p>
                            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                                Impact: Searchable
                            </div>
                        </div>
                    </label>

                    {/* Private Option */}
                    <label className="cursor-pointer group">
                        <input
                            type="radio"
                            name="visibility"
                            value="private"
                            defaultChecked={profile.visibility === 'private'}
                            className="peer sr-only"
                        />
                        <div className="h-full border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-600 peer-checked:border-zinc-900 dark:peer-checked:border-zinc-100 peer-checked:bg-zinc-50 dark:peer-checked:bg-zinc-900 transition-all duration-300 relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900 dark:bg-zinc-100 scale-x-0 peer-checked:scale-x-100 transition-transform duration-300 origin-left" />
                            <LockClosedIcon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 peer-checked:text-zinc-900 dark:peer-checked:text-zinc-100 mb-4 transition-colors" />
                            <span className="block text-lg font-light text-zinc-900 dark:text-zinc-100 mb-2">Private</span>
                            <p className="text-sm text-zinc-500 leading-relaxed font-light">
                                Only approved followers can view your activity.
                            </p>
                            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                                Impact: Hidden from Search
                            </div>
                        </div>
                    </label>
                </div>
            </section>

            {/* 2. NSFW / SENSITIVE CONTENT */}
            <section className="space-y-6">
                <div className={`flex items-center justify-between border-b pb-2 transition-colors duration-500 ${isNsfw ? 'border-rose-200 dark:border-rose-900/30' : 'border-zinc-200 dark:border-zinc-800'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${isNsfw ? 'text-rose-600' : 'text-zinc-400'}`}>
                        Content Classification
                    </h3>
                    <span className={`text-[10px] uppercase font-mono transition-colors duration-500 ${isNsfw ? 'text-rose-400' : 'text-zinc-400'}`}>
                        Step 02
                    </span>
                </div>

                <div className={`
                    relative border p-8 transition-all duration-500 group
                    ${isNsfw
                    ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-500 dark:border-rose-700'
                    : 'bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800'
                }
                    ${!isOver18 ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                `}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3 max-w-lg">
                            <div className="flex items-center gap-3">
                                {isNsfw ? (
                                    <ExclamationTriangleIcon className="w-5 h-5 text-rose-600 animate-pulse" />
                                ) : (
                                    <ShieldCheckIcon className="w-5 h-5 text-zinc-400" />
                                )}
                                <span className={`text-lg font-medium transition-colors duration-300 ${isNsfw ? 'text-rose-700 dark:text-rose-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                    NSFW Content
                                </span>
                            </div>
                            <p className={`text-sm font-light transition-colors duration-300 ${isNsfw ? 'text-rose-600/80 dark:text-rose-400/80' : 'text-zinc-500'}`}>
                                Unrestricted access to content classified as graphic, mature, or explicit.
                                {isNsfw && <span className="font-medium ml-1">Viewer discretion advised.</span>}
                            </p>
                        </div>

                        {/* Custom Toggle Switch */}
                        <div className="relative flex items-center">
                            <input type="hidden" name="content_preference" value="sfw" />
                            <label className="relative inline-flex items-center cursor-pointer">
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
                                    w-14 h-7 border-2 peer-focus:outline-none transition-colors duration-300
                                    ${isNsfw
                                    ? 'bg-rose-600 border-rose-600'
                                    : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600'
                                }
                                `}></div>
                                <div className={`
                                    absolute top-[4px] left-[4px] bg-white border border-zinc-300 dark:border-zinc-500 h-5 w-5 transition-all duration-300
                                    ${isNsfw ? 'translate-x-7 border-white' : 'translate-x-0'}
                                `}></div>
                            </label>
                        </div>
                    </div>

                    {!isOver18 && (
                        <div className="mt-6 pt-4 border-t border-dashed border-zinc-300 dark:border-zinc-700">
                            <p className="text-xs text-zinc-500 font-mono uppercase tracking-tight">
                                [RESTRICTED] User age verified as under 18. Setting locked.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer / Actions */}
            <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-6">
                {state.message && (
                    <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest animate-pulse">
                        &gt; {state.message}
                    </div>
                )}
                <SubmitButton />
            </div>
        </form>
    );
}