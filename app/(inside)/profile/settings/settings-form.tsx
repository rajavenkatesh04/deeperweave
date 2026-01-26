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
    IdentificationIcon,
    ShieldCheckIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';
import PersonalInformation from "@/app/ui/user/PersonalInformation";
import { geistSans } from '@/app/ui/fonts';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Loading Button Component
 */
function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="group relative px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-sm rounded-sm overflow-hidden"
        >
            <div className="relative z-10 flex items-center gap-2">
                {pending ? (
                    <>
                        <LoadingSpinner className="w-3 h-3" />
                        <span>PROCESSING...</span>
                    </>
                ) : (
                    <>
                        <ShieldCheckIcon className="w-4 h-4" />
                        <span>UPDATE SYSTEM</span>
                    </>
                )}
            </div>
            {/* Hover Shine Effect */}
            <div className="absolute inset-0 bg-white/10 dark:bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
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
        <div className={clsx("space-y-16 max-w-4xl mx-auto", geistSans.className)}>

            {/* --- FORM START --- */}
            <form action={formAction} className="space-y-12">

                {/* --- SECTION: PRIVACY --- */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                            [ 01_VISIBILITY_PROTOCOL ]
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Public Card */}
                        <label className="cursor-pointer group relative">
                            <input
                                type="radio"
                                name="visibility"
                                value="public"
                                defaultChecked={profile.visibility === 'public'}
                                className="peer sr-only"
                            />
                            <div className="h-full p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-300 peer-checked:ring-1 peer-checked:ring-zinc-900 dark:peer-checked:ring-white peer-checked:bg-zinc-50 dark:peer-checked:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <GlobeAmericasIcon className="w-6 h-6 text-zinc-400 peer-checked:text-zinc-900 dark:peer-checked:text-white transition-colors" />
                                    <div className="w-3 h-3 rounded-full border border-zinc-300 dark:border-zinc-700 peer-checked:bg-zinc-900 dark:peer-checked:bg-white transition-colors" />
                                </div>
                                <span className="block text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-100 mb-2">Public Profile</span>
                                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                    Broadcast Mode. Your archive is visible to the global network. Content is searchable.
                                </p>
                            </div>
                        </label>

                        {/* Private Card */}
                        <label className="cursor-pointer group relative">
                            <input
                                type="radio"
                                name="visibility"
                                value="private"
                                defaultChecked={profile.visibility === 'private'}
                                className="peer sr-only"
                            />
                            <div className="h-full p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-300 peer-checked:ring-1 peer-checked:ring-zinc-900 dark:peer-checked:ring-white peer-checked:bg-zinc-50 dark:peer-checked:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <LockClosedIcon className="w-6 h-6 text-zinc-400 peer-checked:text-zinc-900 dark:peer-checked:text-white transition-colors" />
                                    <div className="w-3 h-3 rounded-full border border-zinc-300 dark:border-zinc-700 peer-checked:bg-zinc-900 dark:peer-checked:bg-white transition-colors" />
                                </div>
                                <span className="block text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-100 mb-2">Private Profile</span>
                                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                    Stealth Mode. Only approved connections can access your logs. Hidden from search.
                                </p>
                            </div>
                        </label>
                    </div>
                </section>

                {/* --- SECTION: CONTENT --- */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                            [ 02_CONTENT_FILTER ]
                        </span>
                    </div>

                    <div className={clsx(
                        "relative flex items-center justify-between p-6 border transition-all duration-300 rounded-sm",
                        isNsfw
                            ? "bg-rose-50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/50"
                            : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                    )}>
                        <div className="max-w-[75%] space-y-1">
                            <div className="flex items-center gap-2">
                                <span className={clsx("text-sm font-bold uppercase tracking-wide", isNsfw ? "text-rose-700 dark:text-rose-400" : "text-zinc-900 dark:text-zinc-100")}>
                                    Unrestricted Access (NSFW)
                                </span>
                                {isNsfw && <ExclamationTriangleIcon className="w-4 h-4 text-rose-500" />}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                Bypass safety filters to view content marked as explicit or mature.
                                <span className="hidden sm:inline"> Verification of age (18+) is mandatory.</span>
                            </p>
                        </div>

                        {/* Custom Rectangular Toggle */}
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
                                <div className={clsx(
                                    "w-12 h-6 border rounded-sm transition-colors duration-300 relative",
                                    isNsfw ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white" : "bg-transparent border-zinc-300 dark:border-zinc-700",
                                    !isOver18 && "opacity-50 cursor-not-allowed"
                                )}>
                                    <div className={clsx(
                                        "absolute top-0.5 left-0.5 w-4 h-4 bg-current transition-transform duration-300 rounded-sm shadow-sm",
                                        isNsfw
                                            ? "translate-x-6 text-white dark:text-black bg-white dark:bg-black"
                                            : "translate-x-0 text-zinc-400 dark:text-zinc-600 bg-zinc-400 dark:bg-zinc-600"
                                    )} />
                                </div>
                            </label>
                        </div>
                    </div>

                    {!isOver18 && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border-l-2 border-zinc-400 dark:border-zinc-600">
                            <LockClosedIcon className="w-3 h-3 text-zinc-500" />
                            <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                                Access Locked: Age Requirement Not Met
                            </p>
                        </div>
                    )}
                </section>

                {/* --- FEEDBACK & SUBMIT --- */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                    <AnimatePresence>
                        {state.message && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400"
                            >
                                <CheckCircleIcon className="w-4 h-4" />
                                {state.message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="ml-auto">
                        <SubmitButton />
                    </div>
                </div>
            </form>

            {/* --- SECTION: PERSONAL INFORMATION (Read Only) --- */}
            <section className="space-y-6 pt-8">
                <div className="flex items-center gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                        [ 03_IDENTITY_MATRIX ]
                    </span>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-2 rounded-sm">
                    {/* Wrapped PersonalInformation */}
                    <div className="opacity-90 grayscale hover:grayscale-0 transition-all duration-500">
                        <PersonalInformation
                            email={userEmail}
                            gender={profile.gender}
                            birthday={formattedBirthday}
                            plan={profile.subscription_status}
                        />
                    </div>
                </div>
                <p className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono pl-1">
                    <IdentificationIcon className="w-3 h-3" />
                    IDENTITY PARAMETERS ARE IMMUTABLE VIA THIS TERMINAL. CONTACT ADMIN FOR MODIFICATION.
                </p>
            </section>

            {/* --- SECTION: DANGER ZONE --- */}
            <section className="space-y-6 pt-12">
                <div className="flex items-center gap-3 pb-2 border-b border-red-200 dark:border-red-900/50">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/80">
                        [ 04_TERMINATION_ZONE ]
                    </span>
                </div>

                <div className="relative border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/10 p-8 rounded-sm overflow-hidden group">

                    {/* Background Warning Stripe Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                         style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}
                    />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-2">
                            <h4 className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400 text-sm uppercase tracking-wider">
                                <ExclamationTriangleIcon className="w-4 h-4" />
                                Dismantle Archive
                            </h4>
                            <p className="text-xs text-red-600/70 dark:text-red-400/60 max-w-md font-medium leading-relaxed">
                                Executing will permanently erase your profile, timeline entries, and all collected data. This action is irreversible.
                            </p>
                        </div>

                        <Link
                            href="/profile/delete-account"
                            className="group/btn relative inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-transparent border border-red-200 dark:border-red-800 text-red-600 dark:text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-sm rounded-sm"
                        >
                            <TrashIcon className="w-4 h-4 mr-2 transition-transform group-hover/btn:scale-110" />
                            Delete Account
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}