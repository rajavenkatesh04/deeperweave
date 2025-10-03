'use client';

import { useState, useEffect, useActionState, ChangeEvent } from 'react'; // ✨ FIX: Imported ChangeEvent
import { useFormStatus } from 'react-dom';
import { completeProfile, OnboardingState } from '@/lib/actions/profile-actions';
import { UserProfile } from '@/lib/definitions';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import LoadingSpinner from '@/app/ui/loading-spinner';
import Link from 'next/link';

// --- Helper Data ---
const countries = [
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
];

// ✨ FIX: Defined specific types for the form data and component props to remove 'any'.
type FormDataState = {
    username: string;
    display_name: string;
    date_of_birth: string;
    gender: string;
    country: string;
};

type StepProps = {
    formData: FormDataState;
    handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

type Step2Props = StepProps & {
    maxDate: string;
};


// --- Sub-components for Form Logic ---

function Stepper({ currentStep }: { currentStep: number }) {
    const steps = ['Identity', 'Details', 'Location'];
    // ... (rest of Stepper component is fine)
    return (
        <div className="flex space-x-8">
            {steps.map((name, index) => {
                const stepNumber = index + 1;
                const isActive = currentStep === stepNumber;
                return (
                    <div key={name} className="relative flex flex-col items-center gap-2">
                        <span className={isActive ? 'font-bold text-orange-500' : 'font-medium text-gray-500 dark:text-zinc-500'}>
                            {name}
                        </span>
                        {isActive && (
                            <motion.div
                                className="absolute -bottom-2 h-0.5 w-full bg-orange-500"
                                layoutId="underline"
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    // ... (rest of SubmitButton component is fine)
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-orange-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:bg-orange-400"
        >
            {pending ? <><LoadingSpinner className="mr-2" /><span>Saving...</span></> : <span>Complete Profile</span>}
        </button>
    );
}

// --- Main Onboarding Form (Client Component) ---
export function OnboardingForm({ profile }: { profile: UserProfile | null }) {
    const initialState: OnboardingState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(completeProfile, initialState);

    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [formData, setFormData] = useState<FormDataState>({
        username: '',
        display_name: '',
        date_of_birth: '',
        gender: '',
        country: '',
    });

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
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleNext = () => { if (currentStep < 3) { setDirection(1); setCurrentStep(prev => prev + 1); } };
    const handlePrevious = () => { if (currentStep > 1) { setDirection(-1); setCurrentStep(prev => prev - 1); } };

    const animationVariants = {
        enter: (d: number) => ({ x: d > 0 ? '50%' : '-50%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? '50%' : '-50%', opacity: 0 }),
    };

    return (
        <main className="min-h-screen w-full bg-white dark:bg-zinc-950 md:grid md:grid-cols-2">
            {/* Left Panel (Branding) - Hidden on mobile */}
            <div className="hidden md:flex flex-col justify-between p-8 bg-gray-50 dark:bg-zinc-900">
                <div className="text-2xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                    <Link href="/">Deeper Weave</Link>
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-zinc-100">Let&apos;s weave your profile.</h1>
                    <p className="text-gray-600 dark:text-zinc-400">A complete profile helps you connect with a community that shares your passion for the craft of cinema.</p>
                </div>
                <div className="text-sm text-gray-500 dark:text-zinc-500">
                    © {new Date().getFullYear()} Deeper Weave
                </div>
            </div>

            {/* Right Panel (Form) */}
            <div className="flex flex-col justify-center p-6 sm:p-8">
                <div className="w-full max-w-md mx-auto">
                    <div className="mb-12">
                        <Stepper currentStep={currentStep} />
                    </div>

                    <form action={dispatch}>
                        {Object.entries(formData).map(([key, value]) => (<input key={key} type="hidden" name={key} value={value ?? ''} />))}

                        <div className="min-h-[320px]">
                            <AnimatePresence initial={false} custom={direction} mode="wait">
                                <motion.div
                                    key={currentStep}
                                    custom={direction}
                                    variants={animationVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                >
                                    {currentStep === 1 && ( <Step1 formData={formData} handleInputChange={handleInputChange} /> )}
                                    {currentStep === 2 && ( <Step2 formData={formData} handleInputChange={handleInputChange} maxDate={maxDate} /> )}
                                    {currentStep === 3 && ( <Step3 formData={formData} handleInputChange={handleInputChange} /> )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800">
                            <div className="min-h-[40px] text-center mb-4 text-sm text-red-600 dark:text-red-500">
                                {state.message && <p>{state.message}</p>}
                                {state.errors && Object.values(state.errors).flat().map((error, i) => <p key={i}>{error}</p>)}
                            </div>
                            <div className="flex items-center justify-between">
                                <button type="button" onClick={handlePrevious} disabled={currentStep === 1} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"><ArrowLeftIcon className="h-4 w-4" /><span>Back</span></button>
                                {currentStep < 3 ? (<button type="button" onClick={handleNext} className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700"><span>Next</span><ArrowRightIcon className="h-4 w-4" /></button>) : <SubmitButton />}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

// ✨ FIX: Applied the specific prop types to each step component.
const Step1 = ({ formData, handleInputChange }: StepProps) => (
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
);

const Step2 = ({ formData, handleInputChange, maxDate }: Step2Props) => (
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
);

const Step3 = ({ formData, handleInputChange }: StepProps) => (
    <div className="space-y-6">
        <div className="text-center"><h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Where are you from?</h2><p className="mt-1 text-gray-500 dark:text-zinc-400">Select your country of residence.</p></div>
        <div>
            <label htmlFor="country" className="mb-2 block text-sm font-medium text-gray-800 dark:text-zinc-300">Country</label>
            <select id="country" name="country" value={formData.country} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-zinc-700 dark:bg-zinc-800" required><option value="" disabled>Select a country</option>{countries.map(c => (<option key={c.code} value={c.code}>{c.flag} {c.name}</option>))}</select>
        </div>
    </div>
);