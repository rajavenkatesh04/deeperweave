'use client';

import { useState, useEffect, useActionState, ChangeEvent, useRef, startTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { completeProfile, OnboardingState, checkUsernameAvailability } from '@/lib/actions/profile-actions';
import { UserProfile } from '@/lib/definitions';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    UserIcon,
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    GlobeAmericasIcon,
    FingerPrintIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { countries } from '@/lib/data/countries';
import Link from 'next/link';
import { geistSans } from '@/app/ui/fonts';
import clsx from 'clsx';

// --- Helpers ---

function getFlagEmoji(countryCode: string) {
    if (!countryCode) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

function getLocalDateString(date: Date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString: string): Date {
    if (!dateString) return new Date();
    const parts = dateString.split('-').map(Number);
    if (parts.length !== 3) return new Date();
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function isLegalAge(dateString: string): boolean {
    if (!dateString) return false;
    const dob = parseLocalDate(dateString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age >= 18;
}

// --- Rectified Modern Date Picker ---
function ModernDatePicker({ value, onChange }: { value: string; onChange: (date: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'days' | 'months' | 'years'>('days');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [viewDate, setViewDate] = useState(() => parseLocalDate(value));

    useEffect(() => {
        if (value) setViewDate(parseLocalDate(value));
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // Only apply click-outside logic on desktop where it's a dropdown
            if (window.innerWidth >= 768 && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setView('days');
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

    const handleSelectDay = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onChange(getLocalDateString(newDate));
        setIsOpen(false);
    };

    const handleSelectMonth = (monthIndex: number) => {
        setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
        setView('days');
    };

    const handleSelectYear = (year: number) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setView('days'); // Or 'months' if you prefer drilling down
    };

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i); // Last 100 years

    // Content for the Modal/Dropdown
    const CalendarContent = () => (
        <div className="p-4 w-full md:w-72 bg-white dark:bg-zinc-900 md:border md:border-zinc-200 md:dark:border-zinc-800 rounded-sm shadow-xl flex flex-col max-h-[400px]">

            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 shrink-0">
                {view === 'days' ? (
                    <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-sm">
                        <ChevronLeftIcon className="w-4 h-4 text-zinc-500" />
                    </button>
                ) : <div className="w-6" />} {/* Spacer */}

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setView('months')}
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-sm transition-colors ${view === 'months' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                    >
                        {monthNames[viewDate.getMonth()]}
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('years')}
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-sm transition-colors ${view === 'years' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                    >
                        {viewDate.getFullYear()}
                    </button>
                </div>

                {view === 'days' ? (
                    <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-sm">
                        <ChevronRightIcon className="w-4 h-4 text-zinc-500" />
                    </button>
                ) : <div className="w-6" />} {/* Spacer */}
            </div>

            {/* Body Views */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 min-h-[240px]">
                {view === 'days' && (
                    <>
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <span key={d} className="text-[9px] uppercase font-bold text-zinc-400">{d}</span>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateStr = getLocalDateString(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
                                const isSelected = value === dateStr;
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => handleSelectDay(day)}
                                        className={`h-8 w-8 text-xs flex items-center justify-center transition-all rounded-sm ${isSelected ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {view === 'months' && (
                    <div className="grid grid-cols-3 gap-3">
                        {monthNames.map((month, i) => (
                            <button
                                key={month}
                                type="button"
                                onClick={() => handleSelectMonth(i)}
                                className={`py-3 text-xs font-medium rounded-sm border border-transparent ${i === viewDate.getMonth() ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                            >
                                {month}
                            </button>
                        ))}
                    </div>
                )}

                {view === 'years' && (
                    <div className="grid grid-cols-3 gap-2">
                        {years.map(year => (
                            <button
                                key={year}
                                type="button"
                                onClick={() => handleSelectYear(year)}
                                className={`py-2 text-xs rounded-sm border border-transparent ${year === viewDate.getFullYear() ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile Close Button */}
            <div className="md:hidden mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-bold uppercase tracking-wide rounded-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
    );

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Input Trigger */}
            <div
                onClick={() => setIsOpen(true)}
                className="group flex items-center justify-between w-full h-11 border-b border-zinc-200 dark:border-zinc-800 bg-transparent px-0 text-sm cursor-pointer transition-colors hover:border-zinc-900 dark:hover:border-zinc-100"
            >
                <span className={`${value ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-400'}`}>
                    {value || "YYYY-MM-DD"}
                </span>
                <CalendarIcon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Mobile Overlay: Full Screen, High Z-Index, Centered */}
                        <div className="fixed inset-0 z-[100] min-h-screen w-full flex items-center justify-center bg-zinc-950/60 backdrop-blur-md p-4 md:hidden" onClick={() => setIsOpen(false)}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="w-full max-w-sm"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <CalendarContent />
                            </motion.div>
                        </div>

                        {/* Desktop Dropdown: Absolute positioning */}
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            className="hidden md:block absolute top-full left-0 mt-2 z-[70]"
                        >
                            <CalendarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Main Form Types & Components ---

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
            className="flex w-full h-12 items-center justify-center bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm rounded-sm"
        >
            {pending ? (
                <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    INITIALIZING...
                </>
            ) : (
                <>
                    COMPLETE SETUP
                </>
            )}
        </button>
    );
}

// --- Main Onboarding Form ---
export function OnboardingForm({ profile, randomMovie, email }: { profile: UserProfile | null; randomMovie: { backdrop_url: string; title: string } | null; email?: string; }) {
    const initialState: OnboardingState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(completeProfile, initialState);

    // UI State
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Username Verification State
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
    const usernameCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Age Gate Modal State
    const [showAgeError, setShowAgeError] = useState(false);

    // Legal Agreement State
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [formData, setFormData] = useState<FormDataState>({
        username: '',
        display_name: '',
        date_of_birth: '',
        gender: '',
        country: '',
    });

    useEffect(() => {
        let derivedUsername = '';
        let derivedDisplayName = '';

        if (email) {
            const emailPrefix = email.split('@')[0];
            derivedUsername = emailPrefix.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
            derivedDisplayName = emailPrefix
                .split(/[._]/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }

        const currentDbUsername = profile?.username || '';
        const isRandomDefault = currentDbUsername.startsWith('user_') || currentDbUsername.length === 0;

        const finalUsername = (!isRandomDefault && currentDbUsername) ? currentDbUsername : derivedUsername;
        const finalDisplayName = profile?.display_name || derivedDisplayName;

        setFormData(prev => ({
            ...prev,
            username: finalUsername,
            display_name: finalDisplayName,
            date_of_birth: profile?.date_of_birth || prev.date_of_birth || getLocalDateString(),
            gender: profile?.gender || prev.gender || '',
            country: profile?.country || prev.country || '',
        }));

        if (finalUsername && finalUsername.length >= 3) {
            triggerUsernameCheck(finalUsername);
        }

    }, [profile, email]);

    useEffect(() => {
        const detectCountry = async () => {
            if (formData.country) return;
            try {
                const res = await fetch('https://ipapi.co/json/');
                if (!res.ok) throw new Error('Fetch failed');
                const data = await res.json();
                if (data && data.country_code) {
                    setFormData(prev => prev.country ? prev : { ...prev, country: data.country_code });
                }
            } catch (error) {
                setFormData(prev => prev.country ? prev : { ...prev, country: 'US' });
            }
        };
        detectCountry();
    }, []);

    const triggerUsernameCheck = async (username: string) => {
        setUsernameStatus('checking');
        try {
            const result = await checkUsernameAvailability(username);
            if (result && result.available) {
                setUsernameStatus('available');
            } else {
                setUsernameStatus('taken');
            }
        } catch (err) {
            setUsernameStatus('idle');
        }
    };

    const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '');
        setFormData(prev => ({ ...prev, username: val }));
        setUsernameStatus('checking');

        if (usernameCheckTimeoutRef.current) clearTimeout(usernameCheckTimeoutRef.current);
        if (val.length < 3) {
            setUsernameStatus('invalid');
            return;
        }
        usernameCheckTimeoutRef.current = setTimeout(() => {
            triggerUsernameCheck(val);
        }, 500);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateChange = (date: string) => {
        setFormData(prev => ({ ...prev, date_of_birth: date }));
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (usernameStatus === 'taken' || usernameStatus === 'invalid') return;
        }

        if (currentStep === 2) {
            if (!isLegalAge(formData.date_of_birth)) {
                setShowAgeError(true);
                return;
            }
        }

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
        if (!termsAccepted) return;

        setIsSubmitting(true);

        const formEl = e.target as HTMLFormElement;
        const formDataToDispatch = new FormData(formEl);
        if (!formDataToDispatch.get('date_of_birth')) {
            formDataToDispatch.set('date_of_birth', formData.date_of_birth);
        }
        startTransition(() => {
            dispatch(formDataToDispatch);
        });
    };

    useEffect(() => {
        if (state.message || (state.errors && Object.keys(state.errors).length > 0)) {
            setIsSubmitting(false);
        }
    }, [state]);

    const animationVariants = {
        enter: (d: number) => ({ x: d > 0 ? 15 : -15, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? 15 : -15, opacity: 0 }),
    };

    if (isSubmitting) return <IntroScreen displayName={formData.display_name} />;

    return (
        <div className={clsx(
            "min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100",
            geistSans.className
        )}>

            {/* Age Gate Modal */}
            <AnimatePresence>
                {showAgeError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-zinc-900 p-8 rounded-sm max-w-sm text-center border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4 stroke-1" />
                            <h3 className="text-lg font-bold uppercase tracking-wide mb-2">Age Restriction</h3>
                            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">Access denied. You must be at least 18 years of age to establish an archive.</p>
                            <button onClick={() => setShowAgeError(false)} className="bg-zinc-900 text-white dark:bg-white dark:text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90">Understood</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl min-h-[550px] relative overflow-hidden">

                {/* --- Visual Side (Left) --- */}
                <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-white p-12 border-r border-zinc-800 relative overflow-hidden">
                    {randomMovie?.backdrop_url && (
                        <div className="absolute inset-0 opacity-30 grayscale mix-blend-overlay" style={{ backgroundImage: `url(${randomMovie.backdrop_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    )}

                    {/* Noise Texture */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                         style={{
                             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                         }}
                    />
                    <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/90 opacity-90" />

                    <div className="relative z-10 text-center space-y-8 max-w-xs">
                        <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                            <UserIcon className="w-10 h-10 text-zinc-400" />
                        </div>
                        <div className="space-y-3">
                            <div className="inline-block px-2 py-1 border border-zinc-700 rounded-sm">
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">System_Init_v1.0</p>
                            </div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">
                                Identify.
                            </h2>
                            <p className="text-sm font-medium text-zinc-500 italic">"The protagonist enters the scene."</p>
                        </div>
                    </div>

                    {/* Technical Footer (Left Col) */}
                    <div className="absolute bottom-6 w-full px-8 flex justify-between text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                        <span>Rec_Mode</span>
                        <span>Iso_800</span>
                    </div>
                </div>

                {/* --- Form Side (Right) --- */}
                <div className="flex flex-col h-full relative bg-white dark:bg-black">

                    {/* Segmented Progress Bar */}
                    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
                        <div className="flex gap-1.5 w-1/3">
                            {[1, 2, 3].map((step) => (
                                <div
                                    key={step}
                                    className={clsx(
                                        "h-1.5 flex-1 rounded-sm transition-all duration-300",
                                        step <= currentStep ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-100 dark:bg-zinc-800"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                            Step 0{currentStep} / 03
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col px-8 md:px-12 pt-24 pb-8 justify-center">
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 mb-3">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"/>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                    {currentStep === 1 && "Identity Verification"}
                                    {currentStep === 2 && "Profile Parameters"}
                                    {currentStep === 3 && "Final Authorization"}
                                </span>
                            </div>
                            <h1 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
                                {currentStep === 1 && "Who are you?"}
                                {currentStep === 2 && "The details."}
                                {currentStep === 3 && "Confirm & Launch."}
                            </h1>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-8 flex-1">
                            {Object.entries(formData).map(([key, value]) => <input key={key} type="hidden" name={key} value={value ?? ''} />)}

                            <div className="min-h-[180px]">
                                <AnimatePresence initial={false} custom={direction} mode="wait">
                                    <motion.div key={currentStep} custom={direction} variants={animationVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeOut" }}>

                                        {/* STEP 1 */}
                                        {currentStep === 1 && (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Handle / Username</label>
                                                    <div className="relative group">
                                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 font-medium group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors">@</span>
                                                        <input
                                                            name="username" type="text" value={formData.username} onChange={handleUsernameChange} placeholder="username"
                                                            className="block w-full h-11 border-b border-zinc-200 bg-transparent pl-5 pr-8 text-base focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                                                            required autoFocus
                                                        />
                                                        {/* Status Icon */}
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                                                            {usernameStatus === 'checking' && <LoadingSpinner className="h-4 w-4 text-zinc-400" />}
                                                            {usernameStatus === 'available' && <CheckIcon className="h-4 w-4 text-emerald-500 stroke-2" />}
                                                            {usernameStatus === 'taken' && <XMarkIcon className="h-4 w-4 text-red-500 stroke-2" />}
                                                        </div>
                                                    </div>
                                                    <div className="h-3 text-[10px] font-medium tracking-wide">
                                                        {usernameStatus === 'taken' && <span className="text-red-600 dark:text-red-400">USERNAME UNAVAILABLE</span>}
                                                        {usernameStatus === 'available' && <span className="text-emerald-600 dark:text-emerald-400">AVAILABLE</span>}
                                                        {usernameStatus === 'invalid' && <span className="text-amber-600 dark:text-amber-400">INVALID FORMAT (3+ CHARS)</span>}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Display Name</label>
                                                    <input name="display_name" type="text" value={formData.display_name} onChange={handleInputChange} placeholder="Your Name" className="block w-full h-11 border-b border-zinc-200 bg-transparent px-0 text-base focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700" required />
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 2 */}
                                        {currentStep === 2 && (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                                        Date of Birth <span className="text-[9px] text-zinc-300 font-normal normal-case">(Required for access)</span>
                                                    </label>
                                                    <ModernDatePicker value={formData.date_of_birth} onChange={handleDateChange} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Gender Identity</label>
                                                    <div className="relative">
                                                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="block w-full h-11 border-b border-zinc-200 bg-transparent px-0 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors cursor-pointer appearance-none" required>
                                                            <option value="" disabled className="text-zinc-400">Select...</option>
                                                            <option value="male" className="bg-white dark:bg-zinc-950">Male</option>
                                                            <option value="female" className="bg-white dark:bg-zinc-950">Female</option>
                                                            <option value="non-binary" className="bg-white dark:bg-zinc-950">Non-binary</option>
                                                            <option value="prefer_not_to_say" className="bg-white dark:bg-zinc-950">Prefer not to say</option>
                                                        </select>
                                                        <FingerPrintIcon className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none"/>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 3 */}
                                        {currentStep === 3 && (
                                            <div className="space-y-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Region</label>
                                                    <div className="relative">
                                                        <select name="country" value={formData.country} onChange={handleInputChange} className="block w-full h-11 border-b border-zinc-200 bg-transparent px-0 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors cursor-pointer appearance-none" required>
                                                            <option value="" disabled>Select Region</option>
                                                            {countries.sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                                                                <option key={c['alpha-2']} value={c['alpha-2']} className="bg-white dark:bg-zinc-950">{getFlagEmoji(c['alpha-2'])} {c.name}</option>
                                                            ))}
                                                        </select>
                                                        <GlobeAmericasIcon className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none"/>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-sm">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex items-center h-5">
                                                            <input
                                                                id="terms"
                                                                name="terms"
                                                                type="checkbox"
                                                                checked={termsAccepted}
                                                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                                                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:checked:bg-white"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="text-sm">
                                                            <label htmlFor="terms" className="block text-xs font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-100 mb-1">
                                                                I confirm I am of legal age.
                                                            </label>
                                                            <p className="text-zinc-500 text-xs leading-relaxed">
                                                                By verifying, I agree that I am 18+ and accept the <Link href="/policies/terms" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">Terms</Link> & <Link href="/policies/privacy" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">Privacy Policy</Link>.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="flex gap-4 items-center mt-auto">
                                <button type="button" onClick={handlePrevious} disabled={currentStep === 1} className="h-10 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-0 flex items-center gap-1">
                                    <ArrowLeftIcon className="h-3 w-3" /> Back
                                </button>

                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={currentStep === 1 && (usernameStatus !== 'available' || formData.username.length < 3)}
                                        className="ml-auto px-6 h-10 bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all rounded-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continue <ArrowRightIcon className="h-3 w-3" />
                                    </button>
                                ) : (
                                    <div className="ml-auto w-full md:w-auto min-w-[160px]">
                                        <SubmitButton />
                                    </div>
                                )}
                            </div>
                        </form>

                        {/* Error Message Toast */}
                        <div className="absolute bottom-6 left-0 w-full px-12 pointer-events-none">
                            <AnimatePresence>
                                {(state.message || Object.keys(state.errors || {}).length > 0) && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-3 rounded-sm flex items-center gap-2">
                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                        {state.message || "Please check your inputs."}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

function IntroScreen({ displayName }: { displayName: string }) {
    return (
        <div className={clsx(
            "min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white relative overflow-hidden",
            geistSans.className
        )}>
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                 style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                 }}
            />

            <div className="relative z-10 text-center p-8 max-w-lg space-y-8">
                <div className="mb-8 relative mx-auto w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-zinc-200 dark:border-zinc-800 rounded-full" />
                    <div className="absolute inset-0 border-2 border-t-zinc-900 dark:border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <div className="inline-block px-3 py-1 border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 rounded-sm mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">System_Initialization</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-zinc-900 dark:text-white">
                        Welcome, {displayName}.
                    </h1>

                    <div className="space-y-1">
                        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Constructing Archive</p>
                        <p className="text-zinc-400 text-[10px] font-mono uppercase tracking-widest">Verifying Credentials...</p>
                    </div>
                </motion.div>
            </div>

            {/* Tech Footer */}
            <div className="absolute bottom-8 w-full text-center">
                <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-[0.3em]">Deeper Weave © 2026</p>
            </div>
        </div>
    );
}