'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import Image from "next/image";
import {
    FilmIcon, MagnifyingGlassIcon, ArrowRightIcon,
    StarIcon, Bars3Icon, XMarkIcon, SparklesIcon
} from "@heroicons/react/24/outline"; // Switched to Outline for sharper look
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { searchCinematic, CinematicSearchResult } from "@/lib/actions/cinematic-actions";
import clsx from "clsx";
import { geistSans } from "@/app/ui/fonts"; // Assuming you have this from previous steps

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

// --- Component: Stylized Rating Card ---
const RatingCardMockup = ({ poster }: { poster: string }) => (
    <div className="relative group w-full max-w-[280px] bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 transition-transform duration-500 hover:-translate-y-2">
        {/* Technical Decor */}
        <div className="absolute top-2 right-2 text-[8px] font-bold uppercase text-zinc-400 tracking-widest">Rec_01</div>

        <div className="flex gap-4">
            <div className="w-16 h-24 bg-zinc-100 dark:bg-zinc-900 relative shrink-0 border border-zinc-100 dark:border-zinc-800">
                <Image src={`https://image.tmdb.org/t/p/w200${poster}`} alt="Poster" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-2">
                <div className="h-2 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                <div className="flex text-zinc-900 dark:text-white gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className={clsx("w-3 h-3", i < 4 ? "fill-current" : "text-zinc-300 dark:text-zinc-700")} />
                    ))}
                </div>
                <div className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider">Logged: Today</div>
            </div>
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">"A visual masterpiece. The color grading alone is worth the watch."</p>
        </div>
    </div>
);

// --- Component: List Stack ---
const ListStackMockup = ({ posters }: { posters: string[] }) => (
    <div className="relative w-full max-w-xs h-40 group pl-4">
        {posters.slice(0, 3).map((poster, i) => (
            <div
                key={i}
                className={clsx(
                    "absolute top-0 w-36 h-24 bg-black border border-zinc-800 transition-all duration-500 ease-out shadow-xl",
                    i === 0 && "z-30 left-0 top-4 group-hover:-translate-y-2 group-hover:-translate-x-2 -rotate-3",
                    i === 1 && "z-20 left-4 top-2 group-hover:translate-x-2 rotate-2",
                    i === 2 && "z-10 left-8 top-0 group-hover:translate-x-6 group-hover:translate-y-2 -rotate-1"
                )}
            >
                <Image src={`https://image.tmdb.org/t/p/w500${poster}`} alt="List Item" fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                {i === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest border border-white/30 px-2 py-1">Sci-Fi Core</span>
                    </div>
                )}
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

    // Scroll listener
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
        <div className={clsx(
            "min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black",
            geistSans.className
        )}>
            {/* Global Noise Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0"
                 style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                 }}
            />

            {/* --- Navigation --- */}
            <nav className={clsx(
                "fixed top-0 w-full z-50 transition-all duration-500 border-b",
                scrolled
                    ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-zinc-200 dark:border-zinc-800 py-3"
                    : "bg-transparent border-transparent py-5"
            )}>
                <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="h-8 w-8 bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 rounded-sm">
                            <FilmIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold tracking-tight uppercase">
                            Deeper Weave
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Discover', 'Features', 'Community'].map((item) => (
                            <Link key={item} href={`/${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                                {item}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/auth/login" className="text-xs font-bold uppercase tracking-widest hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Log in</Link>
                        <Link href="/auth/sign-up" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors rounded-sm">
                            Join Archive
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-zinc-900 dark:text-white">
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
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed inset-0 z-[60] bg-white dark:bg-zinc-950 p-8 md:hidden"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <span className="text-sm font-bold uppercase tracking-widest">Menu</span>
                            <button onClick={() => setIsMobileMenuOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="flex flex-col gap-6 text-2xl font-light tracking-tight">
                            <Link href="/discover" onClick={() => setIsMobileMenuOpen(false)}>Discover</Link>
                            <Link href="/features" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
                            <Link href="/community" onClick={() => setIsMobileMenuOpen(false)}>Community</Link>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-4" />
                            <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-zinc-500">Log In</Link>
                            <Link href="/auth/sign-up" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Sign Up</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="relative z-10">
                {/* --- Hero Section --- */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden border-b border-zinc-100 dark:border-zinc-900">
                    <div className="max-w-6xl mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 px-2 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">System Online v1.0</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-zinc-900 dark:text-white leading-[0.9]">
                                The Cinema
                                <br />
                                <span className="text-zinc-400 dark:text-zinc-600">Archive.</span>
                            </h1>

                            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed font-light">
                                A minimal, noise-free space to log what you watch.
                                Rate films, curate lists, and preserve your history.
                            </p>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6">
                                <Link href="/auth/sign-up" className="group flex h-12 items-center px-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold uppercase tracking-wide hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all rounded-sm">
                                    Start Logging
                                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/discover" className="flex h-12 items-center px-6 border border-zinc-200 dark:border-zinc-800 text-sm font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-900 dark:hover:border-white transition-all rounded-sm">
                                    Browse Catalog
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* --- Search Interface --- */}
                <section className="relative z-20 -mt-8 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div
                            ref={searchContainerRef}
                            className={clsx(
                                "bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-2xl transition-all duration-300 border border-zinc-200 dark:border-zinc-800",
                                isSearchFocused ? "ring-2 ring-zinc-900 dark:ring-white border-transparent" : ""
                            )}
                        >
                            <div className="flex items-center p-2">
                                <div className="pl-4 pr-4 text-zinc-400">
                                    <MagnifyingGlassIcon className="w-6 h-6" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search the weave (Movies, Anime, TV)..."
                                    className="flex-1 h-14 bg-transparent outline-none text-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-light"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                />
                                {isSearching && (
                                    <div className="pr-6">
                                        <div className="w-4 h-4 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
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
                                        className="border-t border-zinc-100 dark:border-zinc-800 max-h-[400px] overflow-y-auto"
                                    >
                                        <div className="px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-4">Results</div>
                                        {searchResults.map((item) => (
                                            <Link
                                                href={`/discover/${item.media_type}/${item.id}`}
                                                key={item.id}
                                                className="flex items-center gap-4 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group"
                                            >
                                                <div className="w-10 h-14 bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative shrink-0">
                                                    {item.poster_path && <Image src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" fill className="object-cover" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-medium text-base text-zinc-900 dark:text-zinc-100 truncate group-hover:text-black dark:group-hover:text-white transition-colors">{item.title}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700 text-zinc-500 rounded-sm">
                                                            {item.media_type}
                                                        </span>
                                                        <span className="text-xs text-zinc-400 font-mono">{item.release_date?.split('-')[0]}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* --- Feature 01: Tracking --- */}
                <section className="max-w-6xl mx-auto px-6 py-32 border-b border-zinc-100 dark:border-zinc-900">
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="space-y-6 order-2 md:order-1">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-2 py-1">Fig. 01</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-900 dark:text-white">
                                Precision Logging.
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
                                Track your watch history with granular detail. Star ratings, watch dates, and personal notes organized in an elegant, searchable timeline.
                            </p>
                            <ul className="space-y-3 pt-2">
                                {['Watch History', 'Star Ratings', 'Private Notes'].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        <div className="w-1.5 h-1.5 bg-zinc-900 dark:bg-white rounded-full" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="order-1 md:order-2 flex justify-center md:justify-end">
                            <RatingCardMockup poster={heroPosters[0]} />
                        </div>
                    </div>
                </section>

                {/* --- Feature 02: Lists --- */}
                <section className="max-w-6xl mx-auto px-6 py-32 border-b border-zinc-100 dark:border-zinc-900">
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="flex justify-center md:justify-start">
                            <ListStackMockup posters={[heroPosters[1], heroPosters[2], heroPosters[3]]} />
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-2 py-1">Fig. 02</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-900 dark:text-white">
                                Curate & Collect.
                            </h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
                                Build collections that reflect your taste. From "Weekend Favorites" to "Essential Sci-Fi," your lists are your legacy.
                            </p>
                            <Link href="/auth/sign-up" className="inline-block text-sm font-bold uppercase tracking-wide border-b border-zinc-900 dark:border-white pb-0.5 hover:opacity-70 transition-opacity">
                                Start Curating
                            </Link>
                        </div>
                    </div>
                </section>

                {/* --- Bento Grid Discovery --- */}
                <section className="py-32">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="mb-12 flex items-end justify-between">
                            <h2 className="text-3xl md:text-4xl font-light tracking-tight">
                                Explore the <br/>
                                <span className="font-bold">Catalog.</span>
                            </h2>
                            <div className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                [ Database_Access ]
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-1">
                            {/* Anime - Large */}
                            <Link href={bentoItems.anime.href} className="lg:col-span-7 group relative overflow-hidden min-h-[320px] bg-zinc-100 dark:bg-zinc-900">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.anime.img}`} alt={bentoItems.anime.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                <div className="absolute top-4 left-4 border border-white/20 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-white">Index: Anime</div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h3 className="text-3xl font-bold tracking-tighter uppercase">{bentoItems.anime.title}</h3>
                                </div>
                            </Link>

                            {/* Movie - Tall */}
                            <Link href={bentoItems.movie.href} className="lg:col-span-5 group relative overflow-hidden min-h-[320px] bg-zinc-100 dark:bg-zinc-900">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.movie.img}`} alt={bentoItems.movie.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                                <div className="absolute top-4 left-4 border border-white/20 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-white">Index: Film</div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h3 className="text-3xl font-bold tracking-tighter uppercase">{bentoItems.movie.title}</h3>
                                </div>
                            </Link>

                            {/* KDrama */}
                            <Link href={bentoItems.kdrama.href} className="lg:col-span-5 group relative overflow-hidden min-h-[260px] bg-zinc-100 dark:bg-zinc-900">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.kdrama.img}`} alt={bentoItems.kdrama.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                                <div className="absolute top-4 left-4 border border-white/20 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-white">Index: Drama</div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h3 className="text-2xl font-bold tracking-tighter uppercase">{bentoItems.kdrama.title}</h3>
                                </div>
                            </Link>

                            {/* TV */}
                            <Link href={bentoItems.tv.href} className="lg:col-span-7 group relative overflow-hidden min-h-[260px] bg-zinc-100 dark:bg-zinc-900">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.tv.img}`} alt={bentoItems.tv.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                                <div className="absolute top-4 left-4 border border-white/20 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-white">Index: TV</div>
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h3 className="text-2xl font-bold tracking-tighter uppercase">{bentoItems.tv.title}</h3>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* --- Final CTA --- */}
                <section className="py-32 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 relative overflow-hidden">
                    {/* Abstract Circle Decoration */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 border border-white/10 dark:border-black/10 rounded-full" />

                    <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-8">
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
                            ARCHIVE YOUR <br/> STORY.
                        </h2>
                        <p className="text-lg text-white/60 dark:text-black/60 max-w-lg mx-auto font-light">
                            Join the definitive community for cinema tracking. No ads. No clutter. Just film.
                        </p>
                        <div className="pt-6">
                            <Link href="/auth/sign-up" className="inline-block px-10 py-4 bg-white dark:bg-black text-zinc-900 dark:text-white text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                                Create Account
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* --- Footer --- */}
            <footer className="py-16 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
                            <FilmIcon className="w-4 h-4" />
                            Deeper Weave
                        </div>
                        <p className="text-[10px] text-zinc-400 font-mono">Cinematic Archiving System v2.0</p>
                    </div>

                    <div className="flex flex-wrap gap-8 text-xs font-bold uppercase tracking-wider text-zinc-500">
                        <Link href="/policies/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</Link>
                        <Link href="/policies/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</Link>
                        <Link href="https://github.com" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">GitHub</Link>
                    </div>

                    <div className="text-[10px] text-zinc-400 font-mono">
                        © 2026 DEEPER WEAVE.
                    </div>
                </div>
            </footer>
        </div>
    );
}