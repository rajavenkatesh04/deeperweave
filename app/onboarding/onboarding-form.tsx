'use client';

import { useState, useEffect, useActionState, ChangeEvent, useRef, startTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { completeProfile, OnboardingState } from '@/lib/actions/profile-actions';
import { UserProfile } from '@/lib/definitions';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    UserIcon,
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { countries } from '@/lib/data/countries';

// --- Helpers ---

function getFlagEmoji(countryCode: string) {
    if (!countryCode) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

// FIXED: Robust way to get local YYYY-MM-DD
function getLocalDateString(date: Date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Parse a YYYY-MM-DD string as a LOCAL date (at 00:00:00)
function parseLocalDate(dateString: string): Date {
    if (!dateString) return new Date();
    const parts = dateString.split('-').map(Number);
    if (parts.length !== 3) return new Date();

    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
}

// --- Custom Modern Date Picker (With Year Selection) ---
function ModernDatePicker({ value, onChange }: { value: string; onChange: (date: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'days' | 'years'>('days');
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial State from Value
    const [viewDate, setViewDate] = useState(() => parseLocalDate(value));

    useEffect(() => {
        if (value) {
            setViewDate(parseLocalDate(value));
        }
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setView('days');
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Logic ---
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const handleSelectDay = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onChange(getLocalDateString(newDate));
        setIsOpen(false);
    };

    const handleYearClick = () => {
        setView(view === 'days' ? 'years' : 'days');
    };

    const handleSelectYear = (year: number) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1)); // Keep month, switch year
        setView('days');
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Generate Year Range (1900 - Current Year + 1)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

    return (
        <div className="relative" ref={containerRef}>
            {/* Input Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center justify-between w-full h-10 border-b border-zinc-200 dark:border-zinc-800 bg-transparent px-0 text-base cursor-pointer transition-colors hover:border-zinc-400 dark:hover:border-zinc-600"
            >
                <span className={`${value ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
                    {value || "Select date"}
                </span>
                <CalendarIcon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
            </div>

            {/* Calendar Popup */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 z-50 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl p-4 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            {view === 'days' && (
                                <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                    <ChevronLeftIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleYearClick}
                                className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded transition-colors mx-auto"
                            >
                                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </button>

                            {view === 'days' && (
                                <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                    <ChevronRightIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                                </button>
                            )}
                        </div>

                        {/* Views */}
                        {view === 'days' ? (
                            <>
                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <span key={d} className="text-[10px] uppercase font-bold text-zinc-400">{d}</span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const dateLoop = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                                        const currentLoopDateStr = getLocalDateString(dateLoop);
                                        const isSelected = value === currentLoopDateStr;
                                        const isToday = currentLoopDateStr === getLocalDateString();

                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => handleSelectDay(day)}
                                                className={`
                                                    h-8 w-8 text-xs rounded-full flex items-center justify-center transition-all
                                                    ${isSelected
                                                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold'
                                                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}
                                                    ${isToday && !isSelected ? 'border border-zinc-300 dark:border-zinc-700' : ''}
                                                `}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="h-48 overflow-y-auto grid grid-cols-3 gap-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 pr-1">
                                {years.map(year => (
                                    <button
                                        key={year}
                                        type="button"
                                        onClick={() => handleSelectYear(year)}
                                        className={`
                                            py-2 text-xs rounded-md transition-colors
                                            ${year === viewDate.getFullYear()
                                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold'
                                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}
                                        `}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

type FormDataState = {
    username: string;
    display_name: string;
    date_of_birth: string;
    gender: string;
    country: string;
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex w-full h-12 items-center justify-center bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
            {pending ? <><LoadingSpinner className="mr-2 h-4 w-4"/>Processing...</> : <span>Complete Setup</span>}
        </button>
    );
}

export function OnboardingForm({ profile, randomMovie }: { profile: UserProfile | null; randomMovie: { backdrop_url: string; title: string } | null }) {
    const initialState: OnboardingState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(completeProfile, initialState);

    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const todayLocal = getLocalDateString();

    const [formData, setFormData] = useState<FormDataState>({
        username: '',
        display_name: '',
        date_of_birth: '',
        gender: '',
        country: 'US',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                username: profile.username || '',
                display_name: profile.display_name || '',
                date_of_birth: profile.date_of_birth || todayLocal,
                gender: profile.gender || '',
                country: profile.country || 'US',
            });
        } else {
            setFormData(prev => ({
                ...prev,
                date_of_birth: todayLocal,
                country: 'US'
            }));
        }
    }, [profile]); // Removed todayLocal from deps to prevent re-renders

    // --- FIX: STOP LOADING IF ERROR OCCURS ---
    useEffect(() => {
        if (state.message || (state.errors && Object.keys(state.errors).length > 0)) {
            setIsSubmitting(false);
        }
    }, [state]);

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
            if (!formDataToDispatch.get('date_of_birth')) {
                formDataToDispatch.set('date_of_birth', formData.date_of_birth);
            }
            startTransition(() => {
                dispatch(formDataToDispatch);
            });
        }, 1000);
    };

    const animationVariants = {
        enter: (d: number) => ({ x: d > 0 ? 10 : -10, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? 10 : -10, opacity: 0 }),
    };

    if (isSubmitting) {
        return <IntroScreen displayName={formData.display_name} />;
    }

    // ... (JSX RETURN - REMAINS THE SAME AS BEFORE)
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

            <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden min-h-[500px] rounded-xl">

                {/* Left Column */}
                <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-white p-12 border-r border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
                    {randomMovie?.backdrop_url && (
                        <div className="absolute inset-0 opacity-40 grayscale mix-blend-overlay"
                             style={{ backgroundImage: `url(${randomMovie.backdrop_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                    )}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/90 opacity-90" />

                    <div className="relative z-10 text-center space-y-6 max-w-xs">
                        <div className="mx-auto w-32 h-32 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                            <UserIcon className="w-16 h-16 text-zinc-200" />
                        </div>
                        <div className="space-y-2">
                            <h2 className={`${PlayWriteNewZealandFont.className} text-4xl font-bold text-white tracking-tight`}>
                                The Protagonist.
                            </h2>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
                                Casting in progress
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col h-full relative">

                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 h-1 bg-zinc-100 dark:bg-zinc-800 w-full">
                        <motion.div
                            className="h-full bg-zinc-900 dark:bg-zinc-100"
                            initial={{ width: "33%" }}
                            animate={{ width: `${(currentStep / 3) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>

                    <div className="flex-1 flex flex-col p-8 md:p-12 justify-center">
                        <div className="mb-10">
                            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
                                {currentStep === 1 && "What should we call you?"}
                                {currentStep === 2 && "Tell us about yourself."}
                                {currentStep === 3 && "Where are you based?"}
                            </h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {currentStep === 1 && "This is how you'll appear in the credits."}
                                {currentStep === 2 && "We use this to personalize your recommendations."}
                                {currentStep === 3 && "Helps us find movies available in your region."}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {Object.entries(formData).map(([key, value]) => (
                                <input key={key} type="hidden" name={key} value={value ?? ''} />
                            ))}

                            <div className="min-h-[160px]">
                                <AnimatePresence initial={false} custom={direction} mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        custom={direction}
                                        variants={animationVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                    >
                                        {currentStep === 1 && (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Username</label>
                                                    <div className="relative">
                                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">@</span>
                                                        <input
                                                            name="username"
                                                            type="text"
                                                            value={formData.username}
                                                            onChange={handleInputChange}
                                                            placeholder="username"
                                                            className="block w-full h-10 border-b border-zinc-200 bg-transparent pl-5 text-base focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors"
                                                            required
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Display Name</label>
                                                    <input
                                                        name="display_name"
                                                        type="text"
                                                        value={formData.display_name}
                                                        onChange={handleInputChange}
                                                        placeholder="Your Name"
                                                        className="block w-full h-10 border-b border-zinc-200 bg-transparent px-0 text-base focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {currentStep === 2 && (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Date of Birth</label>

                                                        {/* Age Calculation & Warning Logic */}
                                                        {(() => {
                                                            if (!formData.date_of_birth) return null;
                                                            // Calculate Age
                                                            const dob = new Date(formData.date_of_birth);
                                                            const today = new Date();
                                                            let age = today.getFullYear() - dob.getFullYear();
                                                            const m = today.getMonth() - dob.getMonth();
                                                            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                                                                age--;
                                                            }
                                                            const isUnderage = age < 18;

                                                            return (
                                                                <span className={`text-xs font-medium transition-colors ${
                                                                    isUnderage
                                                                        ? 'text-red-600 dark:text-red-400'
                                                                        : 'text-emerald-600 dark:text-emerald-400'
                                                                }`}>
                                                                    {isUnderage ? 'Minimum 18 years required' : `${age} years old`}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>

                                                    <ModernDatePicker
                                                        value={formData.date_of_birth}
                                                        onChange={handleDateChange}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Gender</label>
                                                    <select
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleInputChange}
                                                        className="block w-full h-10 border-b border-zinc-200 bg-transparent px-0 text-base focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors cursor-pointer"
                                                        required
                                                    >
                                                        <option value="" disabled className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">Select gender</option>
                                                        <option value="male" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">Male</option>
                                                        <option value="female" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">Female</option>
                                                        <option value="non-binary" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">Non-binary</option>
                                                        <option value="prefer_not_to_say" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">Prefer not to say</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {currentStep === 3 && (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Country</label>
                                                    <select
                                                        name="country"
                                                        value={formData.country}
                                                        onChange={handleInputChange}
                                                        className="block w-full h-10 border-b border-zinc-200 bg-transparent px-0 text-base focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors cursor-pointer"
                                                        required
                                                    >
                                                        {countries
                                                            .sort((a, b) => a.name.localeCompare(b.name))
                                                            .map((c) => (
                                                                <option key={c['alpha-2']} value={c['alpha-2']} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
                                                                    {getFlagEmoji(c['alpha-2'])} {c.name}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    disabled={currentStep === 1}
                                    className="px-6 h-12 flex items-center justify-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-0"
                                >
                                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                    Back
                                </button>

                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="ml-auto px-8 h-12 bg-zinc-900 text-white dark:bg-white dark:text-black text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all rounded-none flex items-center"
                                    >
                                        Next
                                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                                    </button>
                                ) : (
                                    <div className="ml-auto w-44">
                                        <SubmitButton />
                                    </div>
                                )}
                            </div>
                        </form>

                        <div className="min-h-[20px] mt-4 text-xs font-medium text-red-600 dark:text-red-400">
                            {state.message && <p>{state.message}</p>}
                            {state.errors && Object.values(state.errors).flat().map((error, i) => <span key={i} className="block">{error}</span>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function IntroScreen({ displayName }: { displayName: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            <div className="relative z-10 text-center p-8 max-w-lg">
                <LoadingSpinner className="mx-auto mb-8 h-8 w-8 text-white" />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
                        Welcome to the family, <span className="font-bold">{displayName}</span>.
                    </h1>
                </motion.div>
            </div>
        </div>
    );
}