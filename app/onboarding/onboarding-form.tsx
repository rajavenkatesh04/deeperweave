'use client';

import { useState, useEffect, useActionState, ChangeEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { completeProfile, OnboardingState } from '@/lib/actions/profile-actions';
import {Movie, UserProfile} from '@/lib/definitions';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/20/solid';
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

// --- Custom Date Picker Component ---
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
        label: new Date(0, i).toLocaleString('default', { month: 'long' }),
    }));
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 18;
    const years = Array.from({ length: 100 }, (_, i) => String(startYear - i));

    const inputClasses = "block w-full rounded-xl border-2 border-white/20 bg-black/30 py-3 px-3 text-white shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all hover:border-orange-500/70 appearance-none";

    return (
        <div className="grid grid-cols-3 gap-3">
            <select
                value={day}
                onChange={(e) => {
                    setDay(e.target.value);
                    handleChange(e.target.value, month, year);
                }}
                className={inputClasses}
            >
                <option value="">Day</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
                value={month}
                onChange={(e) => {
                    setMonth(e.target.value);
                    handleChange(day, e.target.value, year);
                }}
                className={inputClasses}
            >
                <option value="">Month</option>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select
                value={year}
                onChange={(e) => {
                    setYear(e.target.value);
                    handleChange(day, month, e.target.value);
                }}
                className={inputClasses}
            >
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
    );
}


// --- UI Sub-components ---
function Stepper({ currentStep }: { currentStep: number }) {
    const steps = ['Identity', 'Details', 'Location'];
    return (
        <div className="relative flex justify-between mb-12 px-4">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10 -z-10">
                <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
            </div>
            {steps.map((name, index) => {
                const stepNumber = index + 1;
                const isActive = currentStep === stepNumber;
                const isCompleted = currentStep > stepNumber;
                return (
                    <div key={name} className="relative flex flex-col items-center gap-2 z-10">
                        <motion.div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                                isCompleted
                                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md'
                                    : isActive
                                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg ring-4 ring-orange-500/30'
                                        : 'bg-black/20 text-zinc-300 border-2 border-white/20'
                            }`}
                            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            {isCompleted ? <CheckIcon className="w-5 h-5" /> : stepNumber}
                        </motion.div>
                        <span className={`text-xs font-medium ${isActive ? 'text-orange-400' : 'text-zinc-400'}`}>
                            {name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <motion.button
            type="submit"
            disabled={pending}
            className="relative flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-orange-700 px-6 text-base font-semibold text-white shadow-lg overflow-hidden group disabled:cursor-not-allowed disabled:opacity-60"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <span className="relative z-10 flex items-center gap-2">
                {pending ? <LoadingSpinner /> : 'Complete Profile'}
            </span>
        </motion.button>
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
            if (isNaN(birthDate.getTime())) return null; // Invalid date
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
        }, 2500);
    };

    const animationVariants = {
        enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? '100%' : '-100%', opacity: 0 }),
    };

    const backgroundStyle = randomMovie?.backdrop_url
        ? { backgroundImage: `url(${randomMovie.backdrop_url})` }
        : { backgroundColor: '#111827' }; // Fallback dark gray

    if (isSubmitting) {
        return <IntroScreen displayName={formData.display_name} backgroundStyle={backgroundStyle} />;
    }

    return (
        <main
            className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
            style={backgroundStyle}
        >
            <div className="min-h-screen w-full bg-black/75 md:grid md:grid-cols-2 relative overflow-hidden backdrop-blur-[2px]">
                {/* Left Panel - Content */}
                <div className="hidden md:flex flex-col justify-between p-12 relative z-10">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-12" />
                        <span className="text-xl font-bold text-white">
                        Deeper Weave
                    </span>
                    </Link>
                    <div className="space-y-4">
                        <h1 className="text-5xl font-bold text-white leading-tight">Complete your profile</h1>
                        <p className="text-zinc-300 text-lg">Help us personalize your experience and connect you with the right community.</p>
                    </div>
                    <div className="text-sm text-zinc-400">
                        © {new Date().getFullYear()} Deeper Weave
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="flex flex-col justify-center p-4 sm:p-8 min-h-screen relative z-10">
                    <div className="md:hidden text-center mb-6">
                        <Link href="/" className="inline-flex items-center gap-2 group">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg" />
                            <span className="text-xl font-bold text-white">
                            Deeper Weave
                        </span>
                        </Link>
                    </div>

                    <div className="w-full max-w-md mx-auto bg-black/30 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 shadow-2xl">
                        <Stepper currentStep={currentStep} />

                        <form onSubmit={handleSubmit}>
                            {Object.entries(formData).map(([key, value]) => (
                                <input key={key} type="hidden" name={key} value={value ?? ''} />
                            ))}

                            <div className="min-h-[380px] relative">
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
                                        {currentStep === 1 && <Step1 formData={formData} handleInputChange={handleInputChange} />}
                                        {currentStep === 2 && <Step2 formData={formData} handleInputChange={handleInputChange} calculateAge={calculateAge} handleDateChange={handleDateChange} />}
                                        {currentStep === 3 && <Step3 formData={formData} handleInputChange={handleInputChange} />}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="mt-6">
                                <div className="min-h-[24px] text-center mb-4 text-sm text-red-400">
                                    {state.message && <p>{state.message}</p>}
                                    {state.errors && Object.values(state.errors).flat().map((error, i) => <p key={i}>{error}</p>)}
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <motion.button
                                        type="button"
                                        onClick={handlePrevious}
                                        disabled={currentStep === 1}
                                        className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-zinc-100 bg-white/10 border-2 border-white/20 transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <ArrowLeftIcon className="h-4 w-4" />
                                        <span>Back</span>
                                    </motion.button>
                                    {currentStep < 3 ? (
                                        <motion.button
                                            type="button"
                                            onClick={handleNext}
                                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span>{currentStep === 1 && formData.display_name ? `Next, ${formData.display_name.split(' ')[0]}` : "Continue"}</span>
                                            <ArrowRightIcon className="h-4 w-4" />
                                        </motion.button>
                                    ) : (
                                        <div className="flex-1">
                                            <SubmitButton />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}

// --- Intro Screen ---
function IntroScreen({ displayName, backgroundStyle }: { displayName: string; backgroundStyle: React.CSSProperties }) {
    return (
        <div
            className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
            style={backgroundStyle}
        >
            <div className="flex items-center justify-center min-h-screen w-full bg-black/80 text-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center p-8"
                >
                    <motion.h1
                        className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                    >
                        Welcome, {displayName}!
                    </motion.h1>
                    <motion.p
                        className="text-lg md:text-xl text-zinc-300 mb-8"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                    >
                        Crafting your personalized space...
                    </motion.p>
                    <LoadingSpinner />
                </motion.div>
            </div>
        </div>
    );
}


// --- Step Components (Updated Styles for dark bg) ---
const Step1 = ({ formData, handleInputChange }: StepProps) => (
    <div className="space-y-6 px-2">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Your Identity</h2>
            <p className="text-zinc-300">Choose how you&apos;ll be known in the community.</p>
        </div>
        <div>
            <label htmlFor="username" className="mb-2 block text-sm font-semibold text-zinc-200">
                Username
            </label>
            <div className="relative group">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                    @
                </span>
                <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="your_unique_username"
                    className="block w-full rounded-xl border-2 border-white/20 bg-black/30 py-3 pl-10 pr-4 text-white shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all group-hover:border-orange-500/70"
                    required
                />
            </div>
        </div>
        <div>
            <label htmlFor="display_name" className="mb-2 block text-sm font-semibold text-zinc-200">
                Display Name
            </label>
            <input
                id="display_name"
                name="display_name"
                type="text"
                value={formData.display_name}
                onChange={handleInputChange}
                placeholder="Your Full Name"
                className="block w-full rounded-xl border-2 border-white/20 bg-black/30 py-3 px-4 text-white shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all hover:border-orange-500/70"
                required
            />
        </div>
    </div>
);

const Step2 = ({ formData, handleInputChange, calculateAge, handleDateChange }: Step2Props) => {
    const age = calculateAge(formData.date_of_birth);

    return (
        <div className="space-y-6 px-2">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Personal Details</h2>
                <p className="text-zinc-300">Help us understand you better.</p>
            </div>
            <div>
                <label htmlFor="date_of_birth" className="mb-3 block text-sm font-semibold text-zinc-200">
                    Date of Birth
                </label>
                <CustomDatePicker
                    value={formData.date_of_birth}
                    onChange={handleDateChange}
                />
                <div className="min-h-[24px] mt-2 text-center">
                    {age !== null && age >= 18 ? (
                        <motion.p
                            key={age}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm font-medium text-orange-400"
                        >
                            You&apos;re {age} years young!
                        </motion.p>
                    ) : (
                        <p className="text-sm text-red-400 font-semibold tracking-wider">You must be 18 or older to join.</p>
                    )}
                </div>
            </div>
            <div>
                <label htmlFor="gender" className="mb-2 block text-sm font-semibold text-zinc-200">
                    Gender
                </label>
                <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="block w-full rounded-xl border-2 border-white/20 bg-black/30 py-3 px-4 text-white shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all hover:border-orange-500/70 appearance-none"
                    required
                >
                    <option value="" disabled>Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
            </div>
        </div>
    );
};

const Step3 = ({ formData, handleInputChange }: StepProps) => (
    <div className="space-y-6 px-2">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Your Location</h2>
            <p className="text-zinc-300">Where are you from?</p>
        </div>
        <div>
            <label htmlFor="country" className="mb-2 block text-sm font-semibold text-zinc-200">
                Country
            </label>
            <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="block w-full rounded-xl border-2 border-white/20 bg-black/30 py-3 px-4 text-white shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all hover:border-orange-500/70 appearance-none"
                required
            >
                <option value="" disabled>Select your country</option>
                {countries.map(c => (
                    <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                    </option>
                ))}
            </select>
        </div>
    </div>
);
