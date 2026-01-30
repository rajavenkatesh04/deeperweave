'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { UserProfile } from '@/lib/definitions';
import { updateProfileSettings, type SettingsState } from '@/lib/actions/profile-actions';
import {
    GlobeAmericasIcon,
    LockClosedIcon,
    ExclamationTriangleIcon,
    TrashIcon,
    CheckCircleIcon,
    KeyIcon,
    EyeSlashIcon,
    ArrowRightIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';
import PersonalInformation from "@/app/ui/user/PersonalInformation";
import { geistSans } from '@/app/ui/fonts';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// --- Reusable iOS-style Toggle Row Component ---
function ToggleRow({
                       label,
                       description,
                       icon: Icon,
                       name,
                       value,
                       checked,
                       defaultChecked,
                       disabled,
                       onChange,
                       type = 'checkbox',
                       variant = 'default'
                   }: {
    label: string;
    description?: string | React.ReactNode;
    icon: any;
    name: string;
    value: string;
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: 'checkbox' | 'radio';
    variant?: 'default' | 'danger';
}) {
    // Determine active styling based on variant
    const isDanger = variant === 'danger';

    // We check if it is checked to apply border colors to the container
    const isChecked = checked || defaultChecked;

    return (
        <label className={clsx(
            "flex items-center justify-between p-4 border rounded-2xl transition-all duration-300",
            // Base Colors
            "bg-white dark:bg-zinc-950",
            // Border Logic: If Danger & Checked => Red Border, else Standard Zinc
            (isDanger && isChecked)
                ? "border-red-200 dark:border-red-900/50 bg-red-50/10"
                : "border-zinc-200 dark:border-zinc-800",
            // Hover states
            disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700"
        )}>
            <div className="flex items-center gap-4 pr-4">
                <div className={clsx(
                    "p-2.5 rounded-xl transition-colors",
                    (isDanger && isChecked)
                        ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-zinc-50 dark:bg-zinc-900 text-zinc-500"
                )}>
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                    <p className={clsx(
                        "text-sm font-bold transition-colors",
                        (isDanger && isChecked) ? "text-red-700 dark:text-red-400" : "text-zinc-900 dark:text-zinc-100"
                    )}>{label}</p>
                    {description && <div className={clsx(
                        "text-xs mt-0.5 leading-snug",
                        (isDanger && isChecked) ? "text-red-600/70 dark:text-red-400/60" : "text-zinc-500"
                    )}>{description}</div>}
                </div>
            </div>

            {/* The Switch Container */}
            <div className="relative inline-flex items-center cursor-pointer">
                <input
                    type={type}
                    name={name}
                    value={value}
                    checked={checked}
                    defaultChecked={defaultChecked}
                    disabled={disabled}
                    onChange={onChange}
                    className="sr-only peer"
                />

                {/* The Track & Knob */}
                <div className={clsx(
                    // Base Shape
                    "w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-2 transition-colors duration-300 ease-in-out",

                    // Unchecked State (Gray)
                    "bg-zinc-200 dark:bg-zinc-800 peer-focus:ring-zinc-300 dark:peer-focus:ring-zinc-600",

                    // CHECKED STATE LOGIC

                    // 1. DANGER Variant (Red Track)
                    isDanger && "peer-checked:bg-red-600",

                    // 2. DEFAULT Variant (Brand Colors)
                    // Light Mode: Black Track
                    // Dark Mode: White Track
                    !isDanger && "peer-checked:bg-zinc-900 dark:peer-checked:bg-zinc-100",

                    // THE KNOB (After Pseudo-element)
                    "after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm",
                    "peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full",

                    // KNOB COLOR ADJUSTMENT
                    // If Standard Variant + Dark Mode => Track is White, so Knob must be Black
                    !isDanger && "dark:peer-checked:after:bg-zinc-900"
                )}></div>
            </div>
        </label>
    );
}

/**
 * Loading Button Component - Clean Style
 */
function SaveChangesButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full sm:w-auto ml-auto px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-sm font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
            {pending ? (
                <>
                    <LoadingSpinner className="w-4 h-4" />
                    <span>Saving...</span>
                </>
            ) : (
                <span>Save Changes</span>
            )}
        </button>
    );
}

/**
 * Main Settings Form Page layout
 */
export default function SettingsFormPage({
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
    // We use local state for radios to ensure the iOS toggles reflect the current selection visually
    const [visibility, setVisibility] = useState(profile.visibility);

    // Format Birthday for Display
    const formattedBirthday = profile.date_of_birth
        ? new Date(profile.date_of_birth).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : null;

    return (
        <div className={`w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative z-10 max-w-4xl mx-auto md:px-6 ${geistSans.className}`}>
            {/* Header */}
            <div className="mb-10">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h2>
                <p className="text-sm text-zinc-500 mt-1">Manage your archive preferences.</p>
            </div>

            <div className="space-y-10">
                {/* --- FORM START --- */}
                <form action={formAction}>

                    {/* --- SECTION: VISIBILITY --- */}
                    <section className="mb-10">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-1">Visibility</h3>
                        <div className="space-y-3">
                            <ToggleRow
                                type="radio"
                                label="Public Profile"
                                description="Visible to everyone on the network."
                                icon={GlobeAmericasIcon}
                                name="visibility"
                                value="public"
                                checked={visibility === 'public'}
                                onChange={() => setVisibility('public')}
                            />
                            <ToggleRow
                                type="radio"
                                label="Private Profile"
                                description="Only approved connections can see your logs."
                                icon={LockClosedIcon}
                                name="visibility"
                                value="private"
                                checked={visibility === 'private'}
                                onChange={() => setVisibility('private')}
                            />
                        </div>
                    </section>

                    {/* --- SECTION: CONTENT --- */}
                    <section className="mb-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-1">Content</h3>
                        {/* Hidden input for default 'sfw' state if checkbox is unchecked */}
                        <input type="hidden" name="content_preference" value="sfw" />

                        <ToggleRow
                            type="checkbox"
                            variant="danger" // Pass the danger variant here
                            label="Include 18+ Content"
                            description={
                                isOver18
                                    ? "Show mature content in feeds."
                                    : <span className="flex items-center gap-1 text-zinc-400"><LockClosedIcon className="w-3 h-3" /> Age verification (18+) required.</span>
                            }
                            icon={isNsfw ? ExclamationTriangleIcon : EyeSlashIcon}
                            name="content_preference"
                            value="all"
                            checked={isNsfw}
                            disabled={!isOver18}
                            onChange={(e) => setIsNsfw(e.target.checked)}
                        />
                    </section>

                    {/* --- FEEDBACK & SUBMIT --- */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <AnimatePresence>
                            {state.message ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 rounded-xl w-full sm:w-auto"
                                >
                                    <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                                    {state.message}
                                </motion.div>
                            ) : <div className="flex-1" />}
                        </AnimatePresence>
                        <SaveChangesButton />
                    </div>
                </form>

                <hr className="border-zinc-200 dark:border-zinc-800" />

                {/* --- SECTION: SECURITY (Updated) --- */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-1">Security</h3>

                    {/* Replaced Link with Static Div Instructions */}
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-500">
                                <KeyIcon className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Change Password</p>
                                <p className="text-xs text-zinc-500 mt-0.5 max-w-md leading-relaxed">
                                    To update your password, please <span className="font-semibold text-zinc-700 dark:text-zinc-300">log out</span> of your account, go to the login page, and click <span className="font-semibold text-zinc-700 dark:text-zinc-300">"Forgot Password"</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- SECTION: IDENTITY (Read Only) --- */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-1">Identity Parameter</h3>
                    <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-2 rounded-2xl opacity-90 hover:opacity-100 transition-opacity">
                        <PersonalInformation
                            email={userEmail}
                            gender={profile.gender}
                            birthday={formattedBirthday}
                            plan={profile.subscription_status}
                        />
                    </div>
                    <p className="flex items-center gap-2 text-[10px] text-zinc-400 mt-3 px-1 font-medium">
                        <ShieldCheckIcon className="w-3 h-3" />
                        Identity details are immutable. Contact admin for modification.
                    </p>
                </section>

                {/* --- SECTION: DANGER ZONE --- */}
                <section className="pt-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-red-500/80 mb-4 px-1">Danger Zone</h3>

                    <div className="p-5 bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <p className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                    Account Deletion
                                </p>
                                <p className="text-xs text-red-600/70 dark:text-red-400/60 mt-1 leading-relaxed max-w-md">
                                    Permanently erase your profile, timeline entries, and all collected data. This action is irreversible.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/profile/delete-account"
                            className="w-full flex items-center justify-center gap-2 h-11 bg-white dark:bg-transparent border border-red-200 dark:border-red-900/50 hover:bg-red-600 hover:border-red-600 hover:text-white dark:hover:bg-red-600 text-red-600 dark:text-red-500 rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-sm active:scale-[0.99]"
                        >
                            <TrashIcon className="w-4 h-4" />
                            Delete Account
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
}