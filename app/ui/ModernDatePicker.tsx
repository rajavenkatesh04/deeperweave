'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { geistSans } from '@/app/ui/fonts';
import clsx from 'clsx';

// --- Helpers ---
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

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    label?: string;
    required?: boolean;
}

export default function ModernDatePicker({ value, onChange, label, required }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'days' | 'months' | 'years'>('days');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [viewDate, setViewDate] = useState(() => parseLocalDate(value));

    // Sync internal state if prop changes
    useEffect(() => {
        if (value) setViewDate(parseLocalDate(value));
    }, [value]);

    // Click Outside Logic
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
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
        setView('days');
    };

    // Quick Select Handlers
    const setToday = () => {
        const d = new Date();
        onChange(getLocalDateString(d));
        setViewDate(d);
        setIsOpen(false);
    };

    const setYesterday = () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        onChange(getLocalDateString(d));
        setViewDate(d);
        setIsOpen(false);
    };

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const CalendarContent = () => (
        <div className={clsx("p-4 w-full md:w-72 bg-white dark:bg-zinc-950 md:border md:border-zinc-200 md:dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col max-h-[420px]", geistSans.className)}>

            {/* Quick Actions */}
            <div className="flex gap-2 mb-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={setToday} className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400 transition-colors">
                    Today
                </button>
                <button type="button" onClick={setYesterday} className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400 transition-colors">
                    Yesterday
                </button>
            </div>

            {/* SideBar */}
            <div className="flex items-center justify-between mb-4">
                {view === 'days' ? (
                    <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md">
                        <ChevronLeftIcon className="w-4 h-4 text-zinc-500" />
                    </button>
                ) : <div className="w-6" />}

                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => setView('months')}
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-colors ${view === 'months' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}
                    >
                        {monthNames[viewDate.getMonth()]}
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('years')}
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-colors ${view === 'years' ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}
                    >
                        {viewDate.getFullYear()}
                    </button>
                </div>

                {view === 'days' ? (
                    <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md">
                        <ChevronRightIcon className="w-4 h-4 text-zinc-500" />
                    </button>
                ) : <div className="w-6" />}
            </div>

            {/* Grid Views */}
            <div className="flex-1 overflow-y-auto min-h-[240px]">
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
                                        className={`h-8 w-8 text-xs flex items-center justify-center transition-all rounded-md ${isSelected ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold shadow-md' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {view === 'months' && (
                    <div className="grid grid-cols-3 gap-2">
                        {monthNames.map((month, i) => (
                            <button
                                key={month}
                                type="button"
                                onClick={() => handleSelectMonth(i)}
                                className={`py-3 text-xs font-medium rounded-md border border-transparent ${i === viewDate.getMonth() ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'}`}
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
                                className={`py-2 text-xs rounded-md border border-transparent ${year === viewDate.getFullYear() ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'}`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile Cancel */}
            <div className="md:hidden mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold uppercase tracking-widest rounded-md">Cancel</button>
            </div>
        </div>
    );

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {label && <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1 mb-2">{label}</label>}
            <div
                onClick={() => setIsOpen(true)}
                className={clsx(
                    "group flex items-center justify-between w-full h-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-sm cursor-pointer transition-all hover:border-zinc-400 dark:hover:border-zinc-600",
                    isOpen && "border-zinc-900 dark:border-zinc-100 ring-1 ring-zinc-900 dark:ring-zinc-100"
                )}
            >
                <span className={`${value ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-400'}`}>
                    {value || "Select Date..."}
                </span>
                <CalendarIcon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Mobile Overlay */}
                        <div className="fixed inset-0 z-[100] min-h-screen w-full flex items-center justify-center bg-zinc-950/60 backdrop-blur-md p-4 md:hidden" onClick={() => setIsOpen(false)}>
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                                <CalendarContent />
                            </motion.div>
                        </div>
                        {/* Desktop Dropdown */}
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className="hidden md:block absolute top-full left-0 mt-2 z-[70]">
                            <CalendarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {/* Hidden input for form submission if needed */}
            <input type="hidden" name={label ? label.toLowerCase().replace(/\s/g, '_') : 'date'} value={value} required={required} />
        </div>
    );
}