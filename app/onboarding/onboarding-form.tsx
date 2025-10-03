'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { completeProfile, OnboardingState } from '@/lib/actions/profile-actions';
import { UserProfile } from '@/lib/definitions';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import LoadingSpinner from '@/app/ui/loading-spinner';
import clsx from 'clsx';

// --- Helper Data ---
// ✨ FIX: Hardcoded flag emojis for better compatibility on platforms like Windows.
const countries = [
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    // Add more countries as needed
];

// --- Sub-components for Form Logic ---

// ✨ REBRANDED & REDESIGNED: A cleaner, more minimalist stepper.
function Stepper({ currentStep }: { currentStep: number }) {
    const steps = ['Identity', 'Details', 'Location'];

    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((name, index) => {
                    const stepNumber = index + 1;
                    const status =
                        currentStep > stepNumber
                            ? 'complete'
                            : currentStep === stepNumber
                                ? 'current'
                                : 'upcoming';

                    return (
                        <li key={name} className="relative flex-1">
                            {/* Connector line */}
                            {index > 0 && <div className={clsx("absolute -left-1/2 top-1/2 -translate-y-1/2 h-0.5 w-full", status === 'complete' || status === 'current' ? 'bg-orange-500' : 'bg-gray-300 dark:bg-zinc-700')} aria-hidden="true" />}

                            <div className="relative flex flex-col items-center gap-2">
                                <div
                                    className={clsx('flex h-10 w-10 items-center justify-center rounded-full transition-all', {
                                        'bg-orange-600': status === 'complete',
                                        'border-2 border-orange-500 bg-white dark:bg-zinc-900': status === 'current',
                                        'border-2 border-gray-300 dark:border-zinc-700': status === 'upcoming',
                                    })}
                                >
                                    {status === 'complete' ? (
                                        <CheckIcon className="h-6 w-6 text-white" />
                                    ) : (
                                        <span className={clsx('font-semibold', {
                                            'text-orange-500 dark:text-orange-400': status === 'current',
                                            'text-gray-500 dark:text-zinc-500': status === 'upcoming'
                                        })}>{stepNumber}</span>
                                    )}
                                </div>
                                <p className={clsx('text-center text-sm font-medium', {
                                    'text-orange-600 dark:text-orange-400': status === 'current',
                                    'text-gray-500 dark:text-zinc-400': status !== 'current'
                                })}>{name}</p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

// ✨ REBRANDED: Button colors updated to match the theme.
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-orange-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:bg-orange-400"
        >
            {pending ? (
                <>
                    <LoadingSpinner className="mr-2" />
                    <span>Saving...</span>
                </>
            ) : (<span>Complete Profile</span>)}
        </button>
    );
}

// --- Main Onboarding Form (Client Component) ---
export function OnboardingForm({ profile }: { profile: UserProfile | null }) {
    const initialState: OnboardingState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(completeProfile, initialState);

    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        display_name: '',
        date_of_birth: '',
        gender: '',
        country: '',
    });

    // ✨ FIX: This effect now ONLY pre-populates the form. It no longer auto-advances the step.
    useEffect(() => {
        if (profile) {
            setFormData({
                username: profile.username || '',
                display_name: profile.display_name || '',
                date_of_birth: profile.date_of_birth || '',
                gender: profile.gender || '',
                country: profile.country || '',
            });
        }
    }, [profile]);

    const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNext = () => {
        // Basic validation before proceeding can be added here if needed
        if (currentStep < 3) {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setDirection(-1);
            setCurrentStep(prev => prev - 1);
        }
    };

    const animationVariants = {
        enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? '100%' : '-100%', opacity: 0 }),
    };

    return (
        // ✨ REDESIGNED: A cleaner, darker background for a more premium feel.
        <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 p-4 dark:bg-zinc-950">
            <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-2xl shadow-gray-200/40 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">
                <div className="mb-10">
                    <Stepper currentStep={currentStep} />
                </div>

                {/* We pass formData to the server action via hidden inputs */}
                <form action={dispatch}>
                    {Object.entries(formData).map(([key, value]) => (<input key={key} type="hidden" name={key} value={value ?? ''} />))}

                    <div className="min-h-[280px]"> {/* Set a fixed height to prevent layout shifts */}
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div
                                key={currentStep}
                                custom={direction}
                                variants={animationVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            >
                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Create Your Public Identity</h2>
                                            <p className="mt-1 text-gray-500 dark:text-zinc-400">Choose a unique handle and how you want to be known.</p>
                                        </div>
                                        <div>
                                            <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-800 dark:text-zinc-300">Username</label>
                                            <div className="relative"><span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">@</span>
                                                <input id="username" name="username" type="text" value={formData.username} onChange={handleInputChange} placeholder="your_unique_handle" className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 pl-7 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="display_name" className="mb-2 block text-sm font-medium text-gray-800 dark:text-zinc-300">Display Name</label>
                                            <input id="display_name" name="display_name" type="text" value={formData.display_name} onChange={handleInputChange} placeholder="Your Full Name" className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800" required />
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <div className="text-center"><h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">A Little More About You</h2><p className="mt-1 text-gray-500 dark:text-zinc-400">This helps us tailor your experience.</p></div>
                                        <div>
                                            <label htmlFor="date_of_birth" className="mb-2 block text-sm font-medium text-gray-800 dark:text-zinc-300">Date of Birth</label>
                                            <input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleInputChange} max={maxDate} className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800" required />
                                            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">You must be 18 or older to join.</p>
                                        </div>
                                        <div>
                                            <label htmlFor="gender" className="mb-2 block text-sm font-medium text-gray-800 dark:text-zinc-300">Gender</label>
                                            <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800" required><option value="" disabled>Select an option</option><option value="male">Male</option><option value="female">Female</option><option value="non-binary">Non-binary</option><option value="prefer_not_to_say">Prefer not to say</option></select>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <div className="text-center"><h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Where are you from?</h2><p className="mt-1 text-gray-500 dark:text-zinc-400">Select your country of residence.</p></div>
                                        <div>
                                            <label htmlFor="country" className="mb-2 block text-sm font-medium text-gray-800 dark:text-zinc-300">Country</label>
                                            <select id="country" name="country" value={formData.country} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800" required><option value="" disabled>Select a country</option>{countries.map(c => (<option key={c.code} value={c.code}>{c.flag} {c.name}</option>))}</select>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-700">
                        {/* Error Message Display */}
                        <div className="min-h-[40px] text-center mb-4 text-sm text-red-600 dark:text-red-500">
                            {state.message && <p>{state.message}</p>}
                            {state.errors && Object.values(state.errors).flat().map((error, i) => <p key={i}>{error}</p>)}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between">
                            <button type="button" onClick={handlePrevious} disabled={currentStep === 1} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"><ArrowLeftIcon className="h-4 w-4" /><span>Back</span></button>
                            {currentStep < 3 ? (<button type="button" onClick={handleNext} className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-950 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"><span>Next</span><ArrowRightIcon className="h-4 w-4" /></button>) : <SubmitButton />}
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}