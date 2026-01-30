'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { FilmIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Handle scroll for transparent -> blur effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    return (
        <>
            <nav className={clsx(
                "fixed top-0 w-full z-50 transition-all duration-300 border-b",
                scrolled
                    ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-zinc-200 dark:border-zinc-800 py-3 md:py-4"
                    : "bg-transparent border-transparent py-4 md:py-6"
            )}>
                {/* Safe Area Spacer (for notches) is handled by padding, but we ensure the content stays within bounds */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group relative z-50">
                        <div className="h-7 w-7 md:h-8 md:w-8 bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 rounded-md shadow-sm group-hover:scale-105 transition-transform">
                            <FilmIcon className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={2.5} />
                        </div>
                        <span className="text-xs md:text-sm font-bold tracking-tight uppercase text-zinc-900 dark:text-white">
                            Deeper Weave
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Discover', 'Features', 'Community'].map((item) => (
                            <Link
                                key={item}
                                href={`/${item.toLowerCase()}`}
                                className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/auth/login" className="text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                            Log in
                        </Link>
                        <Link href="/auth/sign-up" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity rounded-md shadow-sm">
                            Join Archive
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden p-2 -mr-2 text-zinc-900 dark:text-white active:scale-95 transition-transform"
                        aria-label="Open Menu"
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-0 z-[60] bg-white dark:bg-zinc-950 md:hidden flex flex-col h-[100dvh]"
                    >
                        {/* Header inside Menu */}
                        <div className="px-4 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900">
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Navigation</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 -mr-2 text-zinc-900 dark:text-white active:scale-95 transition-transform"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Menu Links */}
                        <div className="flex-1 flex flex-col justify-center px-8 gap-8">
                            {['Discover', 'Features', 'Community'].map((item) => (
                                <Link
                                    key={item}
                                    href={`/${item.toLowerCase()}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-100 hover:pl-4 transition-all duration-300"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>

                        {/* Footer Actions inside Menu */}
                        <div className="p-8 pb-12 border-t border-zinc-100 dark:border-zinc-900 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                            <Link
                                href="/auth/sign-up"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold uppercase tracking-widest text-xs rounded-lg"
                            >
                                Create Account
                            </Link>
                            <Link
                                href="/auth/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center w-full py-4 border border-zinc-200 dark:border-zinc-800 font-bold uppercase tracking-widest text-xs rounded-lg text-zinc-600 dark:text-zinc-400"
                            >
                                Log In
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}