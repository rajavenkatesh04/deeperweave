'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import Image from "next/image";
import {
    FilmIcon, TvIcon, SparklesIcon, HeartIcon,
    MagnifyingGlassIcon, ArrowRightIcon, StarIcon,
    PlusIcon, XMarkIcon, Bars3Icon, UserIcon,
    ListBulletIcon, ChatBubbleLeftIcon, ShareIcon
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { searchCinematic, CinematicSearchResult } from "@/lib/actions/cinematic-actions";
import clsx from "clsx";

// --- Types ---
interface HeroItem { label: string; bg: string; }
interface BentoItemData { title: string; href: string; img: string; description?: string; }

interface LandingPageClientProps {
    heroPosters: string[];
    heroItems: HeroItem[];
    searchDemoItems?: any[];
    bentoItems: {
        anime: BentoItemData;
        movie: BentoItemData;
        kdrama: BentoItemData;
        tv: BentoItemData;
    };
}

// --- Helper: Debounce ---
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

// --- Components: Feature Mockups ---
const RatingCardMockup = ({ poster }: { poster: string }) => (
    <div className="bg-white dark:bg-zinc-900 shadow-sm p-5 w-full max-w-xs border border-zinc-200 dark:border-zinc-800 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex gap-4">
            <div className="w-14 h-20 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden shrink-0">
                <Image src={`https://image.tmdb.org/t/p/w200${poster}`} alt="Poster" fill className="object-cover" />
            </div>
            <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                <div className="flex text-zinc-900 dark:text-white">
                    <StarIcon className="w-3.5 h-3.5" />
                    <StarIcon className="w-3.5 h-3.5" />
                    <StarIcon className="w-3.5 h-3.5" />
                    <StarIcon className="w-3.5 h-3.5" />
                    <StarIcon className="w-3.5 h-3.5 text-zinc-200 dark:text-zinc-700" />
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">Oct 24, 2024</div>
            </div>
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">"Visually stunning. A masterclass in cinematography."</p>
        </div>
    </div>
);

const ListStackMockup = ({ posters }: { posters: string[] }) => (
    <div className="relative w-full max-w-xs h-44 group cursor-pointer">
        {posters.slice(0, 3).map((poster, i) => (
            <div
                key={i}
                className={clsx(
                    "absolute top-0 w-40 h-28 bg-zinc-800 shadow-md border border-white dark:border-zinc-900 overflow-hidden transition-all duration-300 ease-out",
                    i === 0 && "z-30 left-0 top-0 group-hover:-translate-y-1.5",
                    i === 1 && "z-20 left-3 top-3 group-hover:translate-x-1.5",
                    i === 2 && "z-10 left-6 top-6 group-hover:translate-x-3 group-hover:translate-y-1.5"
                )}
            >
                <Image src={`https://image.tmdb.org/t/p/w500${poster}`} alt="List Item" fill className="object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                    {i === 0 && <span className="text-white font-medium text-xs">Essential Sci-Fi</span>}
                </div>
            </div>
        ))}
    </div>
);

export default function LandingPageClient({
                                              heroPosters,
                                              bentoItems
                                          }: LandingPageClientProps) {
    // --- State ---
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<CinematicSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const debouncedQuery = useDebounce(searchQuery, 300);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Scroll listener for navbar style
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Search Logic
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const results = await searchCinematic(debouncedQuery);
                setSearchResults(results.slice(0, 5));
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        };
        performSearch();
    }, [debouncedQuery]);

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
            {/* Global Scrollbar Hide */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* --- Navigation --- */}
            <nav className={clsx(
                "fixed top-0 w-full z-50 transition-all duration-300 border-b",
                scrolled
                    ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-lg border-zinc-200 dark:border-zinc-800 py-3"
                    : "bg-transparent border-transparent py-4"
            )}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-6 w-6 bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 group-hover:rotate-180 transition-transform duration-500">
                            <FilmIcon className="w-3 h-3" />
                        </div>
                        <span className="text-base font-normal tracking-tight">
                            Deeper Weave
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Discover', 'Features', 'Community'].map((item) => (
                            <Link key={item} href={`/${item.toLowerCase()}`} className="text-sm font-light text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                                {item}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/auth/login" className="text-sm font-medium hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Log in</Link>
                        <Link href="/auth/sign-up" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium hover:-translate-y-0.5 transition-transform">
                            Sign up
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2">
                        <Bars3Icon className="w-5 h-5" />
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
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed inset-0 z-[60] bg-white dark:bg-zinc-950 p-6 md:hidden"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <span className="text-lg">Menu</span>
                            <button onClick={() => setIsMobileMenuOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="flex flex-col gap-8 text-xl font-light">
                            <Link href="/discover" onClick={() => setIsMobileMenuOpen(false)}>Discover</Link>
                            <Link href="/features" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
                            <Link href="/community" onClick={() => setIsMobileMenuOpen(false)}>Community</Link>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-4" />
                            <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                            <Link href="/auth/sign-up" onClick={() => setIsMobileMenuOpen(false)} className="font-medium">Sign Up</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main>
                {/* --- Hero Section --- */}
                <section className="relative pt-20 pb-12 md:pt-32 md:pb-20 overflow-hidden">
                    {/* Minimalist geometric background */}
                    <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none">
                        <div className="absolute top-20 right-0 w-[600px] h-[600px] border border-zinc-900 dark:border-white rounded-full" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] border border-zinc-900 dark:border-white rounded-full" />
                    </div>

                    <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6 md:space-y-8"
                        >
                            <div className="inline-block">
                                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    <div className="h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
                                    Cinematic Archiving Redefined
                                </div>
                            </div>

                            <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-light tracking-tight text-zinc-900 dark:text-white leading-[1.1] max-w-4xl">
                                Your personal film diary,
                                <br />
                                <span className="font-semibold italic">designed to last</span>
                            </h1>

                            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed font-light">
                                A thoughtfully crafted space for tracking what you watch. Rate films, curate lists, and discover new favorites—without the noise.
                            </p>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4">
                                <Link href="/auth/sign-up" className="group inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:gap-3 transition-all">
                                    Start Your Archive
                                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                                <Link href="/discover" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 hover:decoration-zinc-900 dark:hover:decoration-zinc-100 transition-colors">
                                    Browse the catalog
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* --- Search Feature Showcase --- */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24 md:mb-32 relative z-20">
                    <div
                        ref={searchContainerRef}
                        className={clsx(
                            "bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300 border border-zinc-200 dark:border-zinc-800 overflow-hidden",
                            isSearchFocused ? "ring-1 ring-zinc-900 dark:ring-white" : ""
                        )}
                    >
                        <div className="flex items-center p-1">
                            <div className="pl-4 pr-3 text-zinc-400">
                                <MagnifyingGlassIcon className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search titles, people, genres..."
                                className="flex-1 h-12 md:h-14 bg-transparent outline-none text-base md:text-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-light"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                            />
                            {isSearching && (
                                <div className="pr-4">
                                    <div className="w-4 h-4 border border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Search Dropdown */}
                        <AnimatePresence>
                            {(isSearchFocused && searchResults.length > 0) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-zinc-100 dark:border-zinc-800"
                                >
                                    {searchResults.map((item) => (
                                        <Link
                                            href={`/discover/${item.media_type}/${item.id}`}
                                            key={item.id}
                                            className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <div className="w-8 h-12 bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative shrink-0">
                                                {item.poster_path && <Image src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" fill className="object-cover" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">{item.title}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] uppercase font-mono tracking-wide px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                                        {item.media_type}
                                                    </span>
                                                    <span className="text-xs text-zinc-400">{item.release_date?.split('-')[0]}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* --- Feature 1: Tracking --- */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                        <div className="space-y-5 order-2 md:order-1">
                            <div className="flex items-center gap-3">
                                <div className="h-px w-6 bg-zinc-300 dark:bg-zinc-700" />
                                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Feature 01</span>
                            </div>
                            <h2 className="text-[clamp(1.75rem,5vw,3rem)] font-light tracking-tight leading-tight">
                                Every viewing,
                                <br />
                                <span className="italic font-normal">meticulously logged</span>
                            </h2>
                            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
                                Track your watch history with precision. Star ratings, watch dates, personal notes—all organized in one elegant timeline.
                            </p>
                            <div className="pt-2 space-y-2">
                                {['Detailed watch history', 'Custom rating system', 'Private or public logs'].map((item) => (
                                    <div key={item} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        <div className="w-1 h-1 rounded-full bg-zinc-400 mt-2 shrink-0" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="order-1 md:order-2 relative">
                            <div className="relative max-w-sm mx-auto md:ml-auto">
                                <RatingCardMockup poster={heroPosters[0]} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Feature 2: Lists --- */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                        <div className="relative">
                            <div className="relative max-w-sm mx-auto md:mr-auto">
                                <ListStackMockup posters={[heroPosters[1], heroPosters[2], heroPosters[3]]} />
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="h-px w-6 bg-zinc-300 dark:bg-zinc-700" />
                                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Feature 02</span>
                            </div>
                            <h2 className="text-[clamp(1.75rem,5vw,3rem)] font-light tracking-tight leading-tight">
                                Curate with
                                <br />
                                <span className="italic font-normal">intention</span>
                            </h2>
                            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
                                Build collections that matter. Weekend favorites, underrated gems, films to revisit. Your taste, your rules.
                            </p>
                        </div>
                    </div>
                </section>

                {/* --- Bento Grid Discovery --- */}
                <section className="py-20 md:py-32">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="mb-12 md:mb-16 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-px w-6 bg-zinc-300 dark:bg-zinc-700" />
                                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Browse by Type</span>
                            </div>
                            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-light tracking-tight leading-tight max-w-2xl">
                                Millions of titles. <br className="hidden sm:block"/>
                                <span className="italic font-normal">Every format imaginable.</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 md:gap-4">
                            {/* Anime - Large */}
                            <Link href={bentoItems.anime.href} className="lg:col-span-7 group relative overflow-hidden min-h-[280px] sm:min-h-[360px] border border-zinc-200 dark:border-zinc-800">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.anime.img}`} alt={bentoItems.anime.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
                                    <div className="text-[10px] font-mono uppercase tracking-widest mb-3 text-white/60">Anime</div>
                                    <h3 className="text-2xl md:text-4xl font-light tracking-tight">{bentoItems.anime.title}</h3>
                                </div>
                            </Link>

                            {/* Movie - Tall */}
                            <Link href={bentoItems.movie.href} className="lg:col-span-5 group relative overflow-hidden min-h-[280px] sm:min-h-[360px] border border-zinc-200 dark:border-zinc-800">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.movie.img}`} alt={bentoItems.movie.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
                                    <div className="text-[10px] font-mono uppercase tracking-widest mb-3 text-white/60">Films</div>
                                    <h3 className="text-2xl md:text-3xl font-light tracking-tight">{bentoItems.movie.title}</h3>
                                </div>
                            </Link>

                            {/* KDrama */}
                            <Link href={bentoItems.kdrama.href} className="lg:col-span-5 group relative overflow-hidden min-h-[240px] border border-zinc-200 dark:border-zinc-800">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.kdrama.img}`} alt={bentoItems.kdrama.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-6 text-white">
                                    <div className="text-[10px] font-mono uppercase tracking-widest mb-2 text-white/60">Drama</div>
                                    <h3 className="text-xl md:text-2xl font-light tracking-tight">{bentoItems.kdrama.title}</h3>
                                </div>
                            </Link>

                            {/* TV */}
                            <Link href={bentoItems.tv.href} className="lg:col-span-7 group relative overflow-hidden min-h-[240px] border border-zinc-200 dark:border-zinc-800">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.tv.img}`} alt={bentoItems.tv.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-6 text-white">
                                    <div className="text-[10px] font-mono uppercase tracking-widest mb-2 text-white/60">Television</div>
                                    <h3 className="text-xl md:text-2xl font-light tracking-tight">{bentoItems.tv.title}</h3>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* --- Final CTA --- */}
                <section className="py-20 md:py-32 bg-zinc-900 dark:bg-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-96 h-96 border border-white dark:border-black rounded-full" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 border border-white dark:border-black rounded-full" />
                    </div>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                        <div className="space-y-8 text-center">
                            <h2 className="text-[clamp(2.5rem,7vw,5rem)] font-light tracking-tight text-white dark:text-zinc-900 leading-[1.1]">
                                Start archiving
                                <br />
                                <span className="italic font-normal">today</span>
                            </h2>
                            <p className="text-base md:text-lg text-white/60 dark:text-zinc-900/60 max-w-xl mx-auto leading-relaxed">
                                Join a community of cinephiles building their personal film libraries. Free, forever.
                            </p>
                            <div className="pt-4">
                                <Link href="/auth/sign-up" className="inline-block px-8 py-3.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm font-medium hover:-translate-y-0.5 transition-transform">
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* --- Footer --- */}
            <footer className="py-12 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 text-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <div className="h-3 w-3 bg-current" />
                            <span className="font-mono text-xs tracking-wide">Deeper Weave</span>
                        </div>
                        <div className="flex flex-wrap gap-6 md:gap-8 text-zinc-500 text-xs">
                            <Link href="/policies/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</Link>
                            <Link href="/policies/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</Link>
                            <Link href="https://github.com" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">GitHub</Link>
                        </div>
                        <div className="text-zinc-400 text-xs font-mono">
                            © 2026
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}