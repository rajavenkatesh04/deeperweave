'use client';

import { useState, useEffect, useActionState, ChangeEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { completeProfile, OnboardingState } from '@/lib/actions/profile-actions';
import { UserProfile } from '@/lib/definitions';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon, UserIcon, TicketIcon, GlobeAmericasIcon, CheckIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';
import Link from 'next/link';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";

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
    calculateAge: (date: string) => number | null;
    handleDateChange: (date: string) => void;
};

// --- Custom Date Picker (Redesigned) ---
function CustomDatePicker({ value, onChange }: { value: string; onChange: (date: string) => void; }) {
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    useEffect(() => {
        if (value) {
            const [y, m, d] = value.split('-');
            setYear(y);
            setMonth(m);
            setDay(d);
        }
    }, [value]);

    const handleChange = (d: string, m: string, y: string) => {
        if (d && m && y && y.length === 4) {
            onChange(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
        }
    };

    const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: new Date(0, i).toLocaleString('default', { month: 'short' }),
    }));
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 18;
    const years = Array.from({ length: 100 }, (_, i) => String(startYear - i));

    // Style: Bottom border, no background, sharp focus
    const selectClasses = "block w-full h-12 border-b border-zinc-200 bg-transparent px-0 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors cursor-pointer appearance-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400";

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="relative">
                <select value={day} onChange={(e) => { setDay(e.target.value); handleChange(e.target.value, month, year); }} className={selectClasses}>
                    <option value="" disabled>Day</option>
                    {days.map(d => <option key={d} value={d} className="bg-white dark:bg-zinc-900">{d}</option>)}
                </select>
            </div>
            <div className="relative">
                <select value={month} onChange={(e) => { setMonth(e.target.value); handleChange(day, e.target.value, year); }} className={selectClasses}>
                    <option value="" disabled>Month</option>
                    {months.map(m => <option key={m.value} value={m.value} className="bg-white dark:bg-zinc-900">{m.label}</option>)}
                </select>
            </div>
            <div className="relative">
                <select value={year} onChange={(e) => { setYear(e.target.value); handleChange(day, month, e.target.value); }} className={selectClasses}>
                    <option value="" disabled>Year</option>
                    {years.map(y => <option key={y} value={y} className="bg-white dark:bg-zinc-900">{y}</option>)}
                </select>
            </div>
        </div>
    );
}

// --- Minimal Stepper ---
function Stepper({ currentStep }: { currentStep: number }) {
    const steps = ['Identity', 'Details', 'Location'];
    return (
        <div className="flex items-center gap-2 mb-10">
            {steps.map((name, index) => {
                const stepNumber = index + 1;
                const isActive = currentStep === stepNumber;
                const isCompleted = currentStep > stepNumber;
                return (
                    <div key={name} className="flex-1">
                        <div className={`h-1 w-full rounded-full transition-all duration-500 ${
                            isActive ? 'bg-zinc-900 dark:bg-zinc-100' :
                                isCompleted ? 'bg-zinc-400 dark:bg-zinc-600' : 'bg-zinc-200 dark:bg-zinc-800'
                        }`} />
                        <span className={`text-[10px] uppercase tracking-wider font-bold mt-2 block text-center transition-colors ${
                            isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-300 dark:text-zinc-600'
                        }`}>
                            {name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// --- Submit Button (Monotone) ---
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex w-full h-12 items-center justify-center bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
            {pending ? <><LoadingSpinner className="mr-2 h-4 w-4"/>Finishing...</> : <span>Complete Profile</span>}
        </button>
    );
}

// --- Main Form Component ---
export function OnboardingForm({ profile, randomMovie }: { profile: UserProfile | null; randomMovie: { backdrop_url: string; title: string } | null }) {
    const initialState: OnboardingState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(completeProfile, initialState);

    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<FormDataState>({
        username: '',
        display_name: '',
        date_of_birth: '',
        gender: '',
        country: '',
    });

    useEffect(() => {
        const defaultDob = new Date();
        defaultDob.setFullYear(defaultDob.getFullYear() - 18);
        const defaultDobString = defaultDob.toISOString().split("T")[0];

        if (profile) {
            setFormData({
                username: profile.username || '',
                display_name: profile.display_name || '',
                date_of_birth: profile.date_of_birth || defaultDobString,
                gender: profile.gender || '',
                country: profile.country || 'US',
            });
        } else {
            setFormData(prev => ({...prev, date_of_birth: defaultDobString, country: 'US'}));
        }
    }, [profile]);

    const calculateAge = (date: string): number | null => {
        if (!date || date.split('-').some(part => !part || part.length < 1)) return null;
        try {
            const today = new Date();
            const birthDate = new Date(date);
            if (isNaN(birthDate.getTime())) return null;
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        } catch {
            return null;
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateChange = (date: string) => {
        setFormData(prev => ({ ...prev, date_of_birth: date }));
    };

    const handleNext = () => {
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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            const formEl = e.target as HTMLFormElement;
            const formDataToDispatch = new FormData(formEl);
            dispatch(formDataToDispatch);
        }, 1500);
    };

    const animationVariants = {
        enter: (d: number) => ({ x: d > 0 ? 20 : -20, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? 20 : -20, opacity: 0 }),
    };

    // If submitting, show the Intro/Success screen style
    if (isSubmitting) {
        return <IntroScreen displayName={formData.display_name} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative">

            {/* Split Layout Container */}
            <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-sm md:shadow-2xl overflow-hidden min-h-[600px]">

                {/* Left Column: Visual/Thematic Area */}
                <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-white p-12 border-r border-zinc-200 dark:border-zinc-800 relative overflow-hidden">

                    {/* Dynamic Background Image (Monotone) */}
                    {randomMovie?.backdrop_url && (
                        <div className="absolute inset-0 opacity-40 grayscale mix-blend-overlay"
                             style={{ backgroundImage: `url(${randomMovie.backdrop_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                    )}

                    {/* Film Grain Texture */}
                    <div className="absolute inset-0 opacity-10"
                         style={{
                             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                         }}
                    />
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/90 opacity-90" />

                    <div className="relative z-10 text-center space-y-8 max-w-sm">
                        <div className="mx-auto w-40 h-40 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                            <UserIcon className="w-20 h-20 text-zinc-200" />
                        </div>

                        <div className="space-y-4">
                            <h2 className={`${PlayWriteNewZealandFont.className} text-5xl font-bold text-white tracking-tight`}>
                                The Protagonist.
                            </h2>
                            <p className="text-sm font-medium text-zinc-400 italic">
                                "Every story needs a hero. Tell us yours."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="flex flex-col h-full">

                    {/* Mobile Header */}
                    <div className="md:hidden relative bg-zinc-950 text-white py-10 px-6 text-center border-b border-zinc-800 overflow-hidden shrink-0">
                        {/* Mobile Grain */}
                        <div className="absolute inset-0 opacity-10"
                             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                        />
                        <div className="relative z-10">
                            <h2 className={`${PlayWriteNewZealandFont.className} text-2xl font-bold text-white mb-1`}>
                                The Protagonist.
                            </h2>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                                Profile Creation
                            </p>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 flex-1 flex flex-col">
                        <div className="mb-8">
                            <Stepper currentStep={currentStep} />
                            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                                {currentStep === 1 && "Who are you?"}
                                {currentStep === 2 && "The Details."}
                                {currentStep === 3 && "The Setting."}
                            </h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                {currentStep === 1 && "Establish your identity in the weave."}
                                {currentStep === 2 && "A bit of backstory for the audience."}
                                {currentStep === 3 && "Where does this story take place?"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                            {Object.entries(formData).map(([key, value]) => (
                                <input key={key} type="hidden" name={key} value={value ?? ''} />
                            ))}

                            <div className="flex-1 relative">
                                <AnimatePresence initial={false} custom={direction} mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        custom={direction}
                                        variants={animationVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        {currentStep === 1 && <Step1 formData={formData} handleInputChange={handleInputChange} />}
                                        {currentStep === 2 && <Step2 formData={formData} handleInputChange={handleInputChange} calculateAge={calculateAge} handleDateChange={handleDateChange} />}
                                        {currentStep === 3 && <Step3 formData={formData} handleInputChange={handleInputChange} />}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="min-h-[24px] text-center mb-4 text-xs font-medium text-red-600 dark:text-red-400">
                                    {state.message && <p>{state.message}</p>}
                                    {state.errors && Object.values(state.errors).flat().map((error, i) => <p key={i}>{error}</p>)}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={handlePrevious}
                                        disabled={currentStep === 1}
                                        className="flex-1 h-12 flex items-center justify-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ArrowLeftIcon className="h-4 w-4" />
                                        <span>Back</span>
                                    </button>

                                    {currentStep < 3 ? (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="flex-[2] h-12 flex items-center justify-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-black text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
                                        >
                                            <span>Continue</span>
                                            <ArrowRightIcon className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <div className="flex-[2]">
                                            <SubmitButton />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Intro/Processing Screen ---
function IntroScreen({ displayName }: { displayName: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white relative overflow-hidden">
            {/* Fullscreen Grain */}
            <div className="absolute inset-0 opacity-10"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />
            <div className="relative z-10 text-center p-8 max-w-lg">
                <LoadingSpinner className="mx-auto mb-8 h-8 w-8 text-white" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
                        Welcome to the cast, <span className="font-bold">{displayName}</span>.
                    </h1>
                    <p className="text-zinc-400 text-sm tracking-widest uppercase">
                        Preparing your timeline...
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

// --- Step Components (Redesigned) ---
const Step1 = ({ formData, handleInputChange }: StepProps) => (
    <div className="space-y-6 pt-2">
        <div className="space-y-2">
            <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Username
            </label>
            <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">@</span>
                <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="username"
                    className="block w-full h-12 border-b border-zinc-200 bg-transparent pl-5 pr-0 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors"
                    required
                />
            </div>
        </div>
        <div className="space-y-2">
            <label htmlFor="display_name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Display Name
            </label>
            <input
                id="display_name"
                name="display_name"
                type="text"
                value={formData.display_name}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="block w-full h-12 border-b border-zinc-200 bg-transparent px-0 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors"
                required
            />
        </div>
    </div>
);

const Step2 = ({ formData, handleInputChange, calculateAge, handleDateChange }: Step2Props) => {
    const age = calculateAge(formData.date_of_birth);

    return (
        <div className="space-y-8 pt-2">
            <div className="space-y-2">
                <label htmlFor="date_of_birth" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                    Date of Birth
                </label>
                <CustomDatePicker
                    value={formData.date_of_birth}
                    onChange={handleDateChange}
                />
                <div className="h-6 mt-1">
                    {age !== null && (
                        <p className={`text-xs ${age >= 18 ? 'text-zinc-500 dark:text-zinc-400' : 'text-red-500'}`}>
                            {age >= 18 ? `${age} years old` : 'Must be 18+ to join.'}
                        </p>
                    )}
                </div>
            </div>
            <div className="space-y-2">
                <label htmlFor="gender" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Gender
                </label>
                <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="block w-full h-12 border-b border-zinc-200 bg-transparent px-0 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors cursor-pointer appearance-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                    required
                >
                    <option value="" disabled>Select gender</option>
                    <option value="male" className="bg-white dark:bg-zinc-900">Male</option>
                    <option value="female" className="bg-white dark:bg-zinc-900">Female</option>
                    <option value="non-binary" className="bg-white dark:bg-zinc-900">Non-binary</option>
                    <option value="prefer_not_to_say" className="bg-white dark:bg-zinc-900">Prefer not to say</option>
                </select>
            </div>
        </div>
    );
};

const Step3 = ({ formData, handleInputChange }: StepProps) => (
    <div className="space-y-6 pt-2">
        <div className="space-y-2">
            <label htmlFor="country" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Location
            </label>
            <div className="relative">
                <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="block w-full h-12 border-b border-zinc-200 bg-transparent px-0 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors cursor-pointer appearance-none text-zinc-900 dark:text-zinc-100"
                    required
                >
                    <option value="" disabled>Select Country</option>
                    {countries.map(c => (
                        <option key={c.code} value={c.code} className="bg-white dark:bg-zinc-900">
                            {c.flag} {c.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    </div>
);