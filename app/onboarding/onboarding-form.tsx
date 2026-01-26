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
    CheckCircleIcon,
    ExclamationCircleIcon,
    ShieldCheckIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { countries } from '@/lib/data/countries';
import Link from 'next/link';

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

// --- Custom Modern Date Picker ---
function ModernDatePicker({ value, onChange }: { value: string; onChange: (date: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'days' | 'years'>('days');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [viewDate, setViewDate] = useState(() => parseLocalDate(value));

    useEffect(() => {
        if (value) setViewDate(parseLocalDate(value));
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

    const handleYearClick = () => setView(view === 'days' ? 'years' : 'days');
    const handleSelectYear = (year: number) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setView('days');
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

    return (
        <div className="relative">
            <div
                onClick={() => setIsOpen(true)}
                className="group flex items-center justify-between w-full h-10 border-b border-zinc-200 dark:border-zinc-800 bg-transparent px-0 text-base cursor-pointer transition-colors hover:border-zinc-400 dark:hover:border-zinc-600"
            >
                <span className={`${value ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
                    {value || "Select date"}
                </span>
                <CalendarIcon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={`
                                z-[70] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl p-4 overflow-hidden
                                fixed inset-x-4 top-[20%] md:absolute md:inset-auto md:top-full md:left-0 md:mt-2 md:w-72
                            `}
                        >
                            <div className="flex justify-end mb-2 md:hidden">
                                <button onClick={() => setIsOpen(false)} className="p-1 text-zinc-500"><XMarkIcon className="w-6 h-6" /></button>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                {view === 'days' && (
                                    <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><ChevronLeftIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" /></button>
                                )}
                                <button type="button" onClick={handleYearClick} className="text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded mx-auto text-zinc-900 dark:text-zinc-100">
                                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                                </button>
                                {view === 'days' && (
                                    <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><ChevronRightIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" /></button>
                                )}
                            </div>
                            {view === 'days' ? (
                                <>
                                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} className="text-[10px] uppercase font-bold text-zinc-400">{d}</span>)}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                                        {Array.from({ length: daysInMonth }).map((_, i) => {
                                            const day = i + 1;
                                            const dateStr = getLocalDateString(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
                                            const isSelected = value === dateStr;
                                            return (
                                                <button key={day} type="button" onClick={() => handleSelectDay(day)} className={`h-8 w-8 text-xs rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}>
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="h-48 overflow-y-auto grid grid-cols-3 gap-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 pr-1">
                                    {years.map(year => (
                                        <button key={year} type="button" onClick={() => handleSelectYear(year)} className={`py-2 text-xs rounded-md text-zinc-700 dark:text-zinc-300 ${year === viewDate.getFullYear() ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </>
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
            {pending ? (
                <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Wrapping Up...
                </>
            ) : (
                <>
                    <ShieldCheckIcon className="w-4 h-4 mr-2" />
                    Complete Setup
                </>
            )}
        </button>
    );
}

// --- Main Form Component ---
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

    // Prepopulation Logic
    useEffect(() => {
        let derivedUsername = '';
        let derivedDisplayName = '';

        if (email) {
            const emailPrefix = email.split('@')[0];
            derivedUsername = emailPrefix.replace(/[^a-zA-Z0-9._]/g, '').toLowerCase();
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

    // Auto-detect Country
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

    // Username Logic
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
        enter: (d: number) => ({ x: d > 0 ? 10 : -10, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? 10 : -10, opacity: 0 }),
    };

    if (isSubmitting) return <IntroScreen displayName={formData.display_name} />;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
            <AnimatePresence>
                {showAgeError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-zinc-900 p-8 rounded-xl max-w-sm text-center border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                            <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">Age Restriction</h3>
                            <p className="text-sm text-zinc-500 mb-6">You must be at least 18 years old to create an account on DeeperWeave.</p>
                            <button onClick={() => setShowAgeError(false)} className="bg-zinc-900 text-white dark:bg-white dark:text-black px-6 py-2 rounded-full text-sm font-bold">Understood</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xl min-h-[500px] rounded-xl relative">
                <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-white p-12 border-r border-zinc-200 dark:border-zinc-800 relative overflow-hidden md:rounded-l-xl">
                    {randomMovie?.backdrop_url && (
                        <div className="absolute inset-0 opacity-40 grayscale mix-blend-overlay" style={{ backgroundImage: `url(${randomMovie.backdrop_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    )}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/90 opacity-90" />
                    <div className="relative z-10 text-center space-y-6 max-w-xs">
                        <div className="mx-auto w-32 h-32 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                            <UserIcon className="w-16 h-16 text-zinc-200" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-white tracking-tight">The Protagonist.</h2>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Casting in progress</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col h-full relative md:rounded-r-xl">
                    <div className="absolute top-0 left-0 h-1 bg-zinc-100 dark:bg-zinc-800 w-full md:rounded-tr-xl">
                        <motion.div className="h-full bg-zinc-900 dark:bg-zinc-100" initial={{ width: "33%" }} animate={{ width: `${(currentStep / 3) * 100}%` }} transition={{ duration: 0.5, ease: "easeInOut" }} />
                    </div>

                    <div className="flex-1 flex flex-col p-8 md:p-12 justify-center">
                        <div className="mb-10">
                            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
                                {currentStep === 1 && "What should we call you?"}
                                {currentStep === 2 && "Tell us about yourself."}
                                {currentStep === 3 && "Final Touches"}
                            </h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {currentStep === 1 && "Choose a unique handle for your profile."}
                                {currentStep === 2 && "We personalise content based on this."}
                                {currentStep === 3 && "Confirm your location and policies."}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {Object.entries(formData).map(([key, value]) => <input key={key} type="hidden" name={key} value={value ?? ''} />)}

                            <div className="min-h-[160px]">
                                <AnimatePresence initial={false} custom={direction} mode="wait">
                                    <motion.div key={currentStep} custom={direction} variants={animationVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2, ease: "easeOut" }}>
                                        {currentStep === 1 && (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Username</label>
                                                    <div className="relative">
                                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">@</span>
                                                        <input
                                                            name="username" type="text" value={formData.username} onChange={handleUsernameChange} placeholder="username"
                                                            className="block w-full h-10 border-b border-zinc-200 bg-transparent pl-5 pr-8 text-base focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors text-zinc-900 dark:text-zinc-100"
                                                            required autoFocus
                                                        />
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                                                            {usernameStatus === 'checking' && <LoadingSpinner className="h-4 w-4 text-zinc-400" />}
                                                            {usernameStatus === 'available' && <CheckCircleIcon className="h-5 w-5 text-emerald-500" />}
                                                            {usernameStatus === 'taken' && <XMarkIcon className="h-5 w-5 text-red-500" />}
                                                        </div>
                                                    </div>
                                                    <div className="h-4 text-xs">
                                                        {usernameStatus === 'taken' && <span className="text-red-500 font-medium">Username is already taken.</span>}
                                                        {usernameStatus === 'available' && <span className="text-emerald-500 font-medium">Username is available!</span>}
                                                        {usernameStatus === 'invalid' && <span className="text-amber-500 font-medium">Must be 3+ chars, alphanumeric only.</span>}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Display Name</label>
                                                    <input name="display_name" type="text" value={formData.display_name} onChange={handleInputChange} placeholder="Your Name" className="block w-full h-10 border-b border-zinc-200 bg-transparent px-0 text-base focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors text-zinc-900 dark:text-zinc-100" required />
                                                </div>
                                            </div>
                                        )}

                                        {currentStep === 2 && (
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Date of Birth</label>
                                                    <ModernDatePicker value={formData.date_of_birth} onChange={handleDateChange} />
                                                    <p className="text-[10px] text-zinc-400 mt-1">* You must be 18 or older to proceed.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Gender</label>
                                                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="block w-full h-10 border-b border-zinc-200 bg-transparent px-0 text-base focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors cursor-pointer text-zinc-900 dark:text-zinc-100" required>
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
                                                    <select name="country" value={formData.country} onChange={handleInputChange} className="block w-full h-10 border-b border-zinc-200 bg-transparent px-0 text-base focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors cursor-pointer text-zinc-900 dark:text-zinc-100" required>
                                                        <option value="" disabled className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">Select Country</option>
                                                        {countries.sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                                                            <option key={c['alpha-2']} value={c['alpha-2']} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">{getFlagEmoji(c['alpha-2'])} {c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="pt-4 flex items-start space-x-3">
                                                    <div className="flex items-center h-5">
                                                        <input
                                                            id="terms"
                                                            name="terms"
                                                            type="checkbox"
                                                            checked={termsAccepted}
                                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                                            className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-white"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="text-sm">
                                                        <label htmlFor="terms" className="font-medium text-zinc-700 dark:text-zinc-300">
                                                            I confirm I am of legal age.
                                                        </label>
                                                        <p className="text-zinc-500 text-xs mt-1">
                                                            By continuing, I agree that I am 18+ and accept the <Link href="/policies/terms" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">Terms of Service</Link> and <Link href="/policies/privacy" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">Privacy Policy</Link>. We are not responsible for content viewed by minors.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={handlePrevious} disabled={currentStep === 1} className="px-6 h-12 flex items-center justify-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-0">
                                    <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back
                                </button>
                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={currentStep === 1 && (usernameStatus !== 'available' || formData.username.length < 3)}
                                        className="ml-auto px-8 h-12 bg-zinc-900 text-white dark:bg-white dark:text-black text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all rounded-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next <ArrowRightIcon className="h-4 w-4 ml-2" />
                                    </button>
                                ) : (
                                    <div className="ml-auto w-44">
                                        <SubmitButton />
                                    </div>
                                )}
                            </div>
                        </form>

                        <div className="min-h-[24px] mt-4">
                            {(state.message || Object.keys(state.errors || {}).length > 0) && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-medium text-red-600 dark:text-red-400">
                                    {state.message && <p className="flex items-center"><ExclamationCircleIcon className="w-4 h-4 mr-1"/> {state.message}</p>}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ✨ FULLY THEME-RESPONSIVE INTRO SCREEN
function IntroScreen({ displayName }: { displayName: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white relative overflow-hidden font-sans transition-colors duration-500">
            {/* Background Effects - Themed */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-200/40 via-zinc-50 to-zinc-50 dark:from-zinc-900/40 dark:via-black dark:to-black" />
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] mix-blend-multiply dark:mix-blend-normal" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            <div className="relative z-10 max-w-3xl w-full p-8 flex flex-col items-center justify-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Animated Icon - Adaptive Colors */}
                    <motion.div
                        className="mx-auto mb-8 w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm dark:shadow-none"
                        animate={{
                            boxShadow: [
                                "0 0 0px rgba(0,0,0,0)",
                                "0 0 20px rgba(120,120,120,0.1)",
                                "0 0 0px rgba(0,0,0,0)"
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <SparklesIcon className="w-5 h-5 text-zinc-900 dark:text-white" />
                    </motion.div>

                    {/* Gradient Text - Dual Theme */}
                    <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-500 dark:from-white dark:via-white dark:to-zinc-600">
                        {displayName}
                    </h1>

                    {/* Progress Bar */}
                    <div className="h-px w-24 bg-zinc-300 dark:bg-zinc-800 mx-auto overflow-hidden relative">
                        <motion.div
                            className="absolute inset-0 bg-zinc-900 dark:bg-white"
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    </div>

                    {/* Subtitle */}
                    <motion.p
                        className="mt-6 text-zinc-500 text-xs uppercase tracking-[0.3em]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    >
                        Initializing DeeperWeave
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}