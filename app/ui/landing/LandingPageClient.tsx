'use client';

import { useState, useEffect, useRef } from 'react';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import Link from "next/link";
import Image from "next/image";
import {
    FilmIcon, TvIcon, SparklesIcon, HeartIcon,
    MagnifyingGlassIcon, ArrowRightIcon, StarIcon,
    PlusIcon
} from "@heroicons/react/24/solid";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { searchCinematic, CinematicSearchResult } from "@/lib/actions/cinematic-actions";

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

// --- Debounce Hook for Search ---
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function LandingPageClient({
                                              heroPosters,
                                              bentoItems
                                          }: LandingPageClientProps) {
    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<CinematicSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isHoveringSearch, setIsHoveringSearch] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Mobile Menu State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const debouncedQuery = useDebounce(searchQuery, 300);
    const searchRef = useRef<HTMLDivElement>(null);

    // FIX 1: Explicitly type the variants to avoid TS/IDE errors
    const fadeInUp: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    // Close search on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Perform Live Search
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

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800">

            {/* --- Navigation --- */}
            <nav className="fixed top-0 z-50 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-6 w-6 rounded bg-gradient-to-br from-amber-500 to-orange-600" />
                        <span className={`${PlayWriteNewZealandFont.className} text-lg font-bold text-zinc-900 dark:text-zinc-100`}>
                            Deeper Weave
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="/discover" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Discover</Link>
                        <Link href="/blog" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Community</Link>
                        <Link href="/auth/login" className="text-zinc-900 dark:text-zinc-100 hover:opacity-70 transition-opacity">Log in</Link>
                        <Link href="/auth/sign-up" className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2 rounded-sm hover:opacity-90 transition-opacity">
                            Join Free
                        </Link>
                    </div>

                    {/* FIX 2: Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="w-6 h-6" />
                            ) : (
                                <Bars3Icon className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* FIX 2: Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 absolute w-full left-0 top-16 shadow-xl py-4 px-6 flex flex-col gap-4">
                        <Link
                            href="/discover"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-base font-medium text-zinc-600 dark:text-zinc-300 py-2"
                        >
                            Discover
                        </Link>
                        <Link
                            href="/blog"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-base font-medium text-zinc-600 dark:text-zinc-300 py-2"
                        >
                            Community
                        </Link>
                        <hr className="border-zinc-100 dark:border-zinc-800" />
                        <Link
                            href="/auth/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-base font-medium text-zinc-900 dark:text-zinc-100 py-2"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/auth/sign-up"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-3 rounded-sm font-medium"
                        >
                            Join Free
                        </Link>
                    </div>
                )}
            </nav>

            <main className="pt-32 pb-24">

                {/* --- Hero Section --- */}
                <section className="max-w-7xl mx-auto px-6 mb-32">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"/>
                                <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">The Ultimate Tracker</span>
                            </div>

                            <h1 className="text-6xl lg:text-8xl font-light tracking-tight text-zinc-900 dark:text-zinc-100 leading-[0.95]">
                                Track your <br />
                                <span className="italic font-serif text-zinc-400">obsession.</span>
                            </h1>

                            <p className="text-lg lg:text-xl text-zinc-500 font-light max-w-md leading-relaxed">
                                One beautiful, unified timeline for movies, TV, anime, and dramas. No clutter, just your history.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link href="/auth/sign-up" className="h-12 px-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center gap-2 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors rounded-sm">
                                    Start Logging <ArrowRightIcon className="w-4 h-4"/>
                                </Link>
                                <Link href="/discover" className="h-12 px-8 border border-zinc-300 dark:border-zinc-700 flex items-center gap-2 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors rounded-sm">
                                    View Demo
                                </Link>
                            </div>
                        </motion.div>

                        {/* Hero Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative grid grid-cols-2 gap-4 opacity-90"
                        >
                            <div className="space-y-4 pt-12">
                                {heroPosters.slice(0, 2).map((src, i) => (
                                    <div key={i} className="relative aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 rounded-sm overflow-hidden">
                                        <Image src={`https://image.tmdb.org/t/p/w500${src}`} alt="" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                {heroPosters.slice(2, 4).map((src, i) => (
                                    <div key={i} className="relative aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 rounded-sm overflow-hidden">
                                        <Image src={`https://image.tmdb.org/t/p/w500${src}`} alt="" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* --- Divider --- */}
                <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 max-w-7xl mx-auto mb-24" />

                {/* --- Horizontal Scroll Shelf --- */}
                <section className="mb-32 pl-6 md:pl-[max(1.5rem,calc((100vw-80rem)/2))] overflow-hidden">
                    <div className="flex items-center justify-between pr-6 max-w-7xl mb-8">
                        <h2 className="text-2xl font-light tracking-tight">Trending Now</h2>
                        <div className="text-xs uppercase tracking-widest text-zinc-500">Scroll to explore</div>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
                        {heroPosters.slice(0, 10).map((src, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                viewport={{ once: true }}
                                className="snap-center shrink-0 w-[180px] md:w-[220px] aspect-[2/3] relative bg-zinc-100 dark:bg-zinc-900 group cursor-pointer"
                            >
                                <div className="absolute inset-0 border border-zinc-200 dark:border-zinc-800 z-10 pointer-events-none transition-colors group-hover:border-zinc-400" />
                                <Image
                                    src={`https://image.tmdb.org/t/p/w500${src}`}
                                    alt="Poster"
                                    fill
                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-black p-1.5 rounded-full shadow-lg">
                                    <PlusIcon className="w-4 h-4" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* --- Search Section --- */}
                <section className="max-w-7xl mx-auto px-6 mb-32">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 md:p-16 rounded-sm text-center relative group">

                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                        <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">Search Everything.</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-10 max-w-xl mx-auto font-light">
                            Stop jumping between wikis and apps. It&apos;s all here, powered by TMDB.
                        </p>

                        <div
                            ref={searchRef}
                            className="max-w-2xl mx-auto relative z-20"
                            onMouseEnter={() => setIsHoveringSearch(true)}
                            onMouseLeave={() => setIsHoveringSearch(false)}
                        >
                            <div className={`flex items-center gap-4 p-4 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-sm transition-all duration-300 ${isFocused ? 'ring-1 ring-zinc-400 dark:ring-zinc-600' : ''}`}>
                                <MagnifyingGlassIcon className={`w-6 h-6 transition-colors ${isFocused || isHoveringSearch ? 'text-amber-600' : 'text-zinc-400'}`} />
                                <input
                                    type="text"
                                    placeholder="Search movies, anime, tv..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    className="w-full bg-transparent outline-none text-zinc-900 dark:text-zinc-100 text-lg font-light placeholder:text-zinc-400"
                                />
                                {isSearching && <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/>}
                            </div>

                            {/* Live Results Dropdown */}
                            <AnimatePresence>
                                {(isFocused && (searchResults.length > 0 || searchQuery.length > 2)) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-sm overflow-hidden text-left z-50 max-h-[400px] overflow-y-auto"
                                    >
                                        {searchResults.length > 0 ? (
                                            searchResults.map((item) => (
                                                <Link
                                                    href={`/discover/${item.media_type}/${item.id}`}
                                                    key={item.id}
                                                    className="flex items-center gap-4 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border-b last:border-0 border-zinc-100 dark:border-zinc-800"
                                                >
                                                    <div className="w-10 h-14 relative bg-zinc-200 dark:bg-zinc-800 flex-shrink-0">
                                                        {item.poster_path ? (
                                                            <Image src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.title} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center"><FilmIcon className="w-4 h-4 text-zinc-400"/></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{item.title}</p>
                                                        <p className="text-xs text-zinc-500">{item.release_date?.split('-')[0]} · {item.media_type}</p>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            !isSearching && (
                                                <div className="p-6 text-center text-zinc-500 text-sm">No results found</div>
                                            )
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* --- Bento Grid --- */}
                <section className="max-w-7xl mx-auto px-6 mb-32">
                    <div className="flex items-end justify-between mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                        <h2 className="text-4xl font-light tracking-tight">Browse by Category</h2>
                        <Link href="/discover" className="text-sm font-medium hover:underline">View All</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:h-[600px]">
                        {/* Anime - Large Block */}
                        <div className="md:col-span-8 relative group overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-sm min-h-[300px] md:min-h-0">
                            <Link href={bentoItems.anime.href} className="block w-full h-full">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.anime.img}`} alt={bentoItems.anime.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out" />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500" />
                                <div className="absolute bottom-0 p-8 text-white">
                                    <SparklesIcon className="w-8 h-8 mb-3 opacity-80" />
                                    <h3 className="text-4xl font-light tracking-tighter uppercase">{bentoItems.anime.title}</h3>
                                    <p className="text-white/70 font-light mt-1 max-w-sm hidden md:block">{bentoItems.anime.description}</p>
                                </div>
                            </Link>
                        </div>

                        {/* Movie - Vertical Block */}
                        <div className="md:col-span-4 relative group overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-sm min-h-[300px] md:min-h-0">
                            <Link href={bentoItems.movie.href} className="block w-full h-full">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.movie.img}`} alt={bentoItems.movie.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out" />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500" />
                                <div className="absolute bottom-0 p-8 text-white">
                                    <FilmIcon className="w-8 h-8 mb-3 opacity-80" />
                                    <h3 className="text-4xl font-light tracking-tighter uppercase">{bentoItems.movie.title}</h3>
                                </div>
                            </Link>
                        </div>

                        {/* KDrama - Horizontal Block */}
                        <div className="md:col-span-5 relative group overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-sm min-h-[250px] md:min-h-0">
                            <Link href={bentoItems.kdrama.href} className="block w-full h-full">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.kdrama.img}`} alt={bentoItems.kdrama.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out" />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500" />
                                <div className="absolute bottom-0 p-6 text-white">
                                    <h3 className="text-2xl font-light tracking-tighter uppercase">{bentoItems.kdrama.title}</h3>
                                </div>
                            </Link>
                        </div>

                        {/* TV - Horizontal Block */}
                        <div className="md:col-span-7 relative group overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-sm min-h-[250px] md:min-h-0">
                            <Link href={bentoItems.tv.href} className="block w-full h-full">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.tv.img}`} alt={bentoItems.tv.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out" />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500" />
                                <div className="absolute bottom-0 p-6 text-white">
                                    <TvIcon className="w-6 h-6 mb-2 opacity-80" />
                                    <h3 className="text-2xl font-light tracking-tighter uppercase">{bentoItems.tv.title}</h3>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* --- Features Grid --- */}
                <section className="max-w-7xl mx-auto px-6 mb-32">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: StarIcon, title: "Rate & Review", desc: "Log every watch. Rate with precision." },
                            { icon: HeartIcon, title: "Curate Lists", desc: "Build the ultimate watchlist." },
                            { icon: SparklesIcon, title: "Share Thoughts", desc: "Write blogs for the community." }
                        ].map((f, i) => (
                            <div key={i} className="p-8 border border-zinc-200 dark:border-zinc-800 rounded-sm hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
                                <f.icon className="w-6 h-6 text-zinc-900 dark:text-zinc-100 mb-4" />
                                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                                <p className="text-zinc-500 font-light text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- Final CTA --- */}
                <section className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-32 px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-8">
                        <StarIcon className="w-12 h-12 mx-auto text-amber-500" />
                        <h2 className="text-5xl md:text-7xl font-light tracking-tighter leading-none">
                            Start your <br/>
                            <span className="italic font-serif">Legacy.</span>
                        </h2>
                        <p className="text-white/60 dark:text-zinc-900/60 text-lg font-light max-w-lg mx-auto">
                            Join thousands of fans tracking their journey through cinema. Free forever.
                        </p>
                        <div className="pt-8">
                            <Link href="/auth/sign-up" className="inline-block bg-white dark:bg-black text-black dark:text-white px-10 py-4 font-bold tracking-wide rounded-sm hover:scale-105 transition-transform">
                                Create Account
                            </Link>
                        </div>
                    </div>
                </section>

            </main>

            {/* --- Footer --- */}
            <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 bg-white dark:bg-zinc-950">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-amber-600" />
                        <span className={`font-bold text-sm ${PlayWriteNewZealandFont.className}`}>Deeper Weave</span>
                    </div>
                    <div className="text-xs text-zinc-500">
                        © 2025 Deeper Weave. Crafted for the obsessed.
                    </div>
                </div>
            </footer>
        </div>
    );
}