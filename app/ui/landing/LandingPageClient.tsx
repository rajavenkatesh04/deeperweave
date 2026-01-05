'use client';

import { useState, useEffect, useRef } from 'react';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import Link from "next/link";
import Image from "next/image";
import {
    FilmIcon, TvIcon, SparklesIcon, HeartIcon,
    MagnifyingGlassIcon, ArrowRightIcon, StarIcon,
    PlusIcon, XMarkIcon, Bars3Icon
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { searchCinematic, CinematicSearchResult } from "@/lib/actions/cinematic-actions";
import clsx from "clsx"; // Ensure you have clsx installed, or use template literals

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
    const [isFocused, setIsFocused] = useState(false);

    // Mobile Menu State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const debouncedQuery = useDebounce(searchQuery, 300);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const fadeInUp: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    // Close search on click outside or Escape key
    useEffect(() => {
        function handleInteraction(event: MouseEvent | KeyboardEvent) {
            if (event instanceof KeyboardEvent && event.key === 'Escape') {
                setIsFocused(false);
                inputRef.current?.blur();
            }
            if (event instanceof MouseEvent && searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleInteraction);
        document.addEventListener("keydown", handleInteraction);
        return () => {
            document.removeEventListener("mousedown", handleInteraction);
            document.removeEventListener("keydown", handleInteraction);
        };
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
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
            {/* Global Styles for removing Scrollbars */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* --- Navigation --- */}
            <nav className="fixed top-0 z-50 w-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
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
                        <Link href="/auth/login" className="text-zinc-900 dark:text-zinc-100 hover:underline decoration-1 underline-offset-4">Log in</Link>
                        <Link href="/auth/sign-up" className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-none hover:opacity-90 transition-opacity">
                            Join Free
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-zinc-900 dark:text-zinc-100"
                        >
                            {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 absolute w-full left-0 top-16 shadow-xl py-4 px-6 flex flex-col gap-4">
                        <Link href="/discover" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-zinc-900 dark:text-zinc-100 py-2">Discover</Link>
                        <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-zinc-900 dark:text-zinc-100 py-2">Community</Link>
                        <hr className="border-zinc-100 dark:border-zinc-800" />
                        <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-zinc-900 dark:text-zinc-100 py-2">Log in</Link>
                        <Link href="/auth/sign-up" onClick={() => setIsMobileMenuOpen(false)} className="text-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-3 rounded-none font-medium">Join Free</Link>
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
                            className="relative grid grid-cols-2 gap-4"
                        >
                            <div className="space-y-4 pt-12">
                                {heroPosters.slice(0, 2).map((src, i) => (
                                    <div key={i} className="relative aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 rounded-none overflow-hidden">
                                        <Image src={`https://image.tmdb.org/t/p/w500${src}`} alt="" fill className="object-cover hover:scale-105 transition-transform duration-700" />
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                {heroPosters.slice(2, 4).map((src, i) => (
                                    <div key={i} className="relative aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 rounded-none overflow-hidden">
                                        <Image src={`https://image.tmdb.org/t/p/w500${src}`} alt="" fill className="object-cover hover:scale-105 transition-transform duration-700" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* --- Divider --- */}
                <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 max-w-7xl mx-auto mb-24" />

                {/* --- Horizontal Scroll Shelf --- */}
                <section className="max-w-7xl mx-auto px-6 mb-32">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-light tracking-tight">Trending Now</h2>
                        <div className="text-xs uppercase tracking-widest text-zinc-500">Scroll to explore</div>
                    </div>

                    <div className="w-full relative">
                        {/* Gradient fades */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none md:hidden" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none md:hidden" />

                        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar">
                            {heroPosters.slice(0, 10).map((src, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    viewport={{ once: true }}
                                    className="snap-start shrink-0 w-[160px] md:w-[200px] aspect-[2/3] relative bg-zinc-100 dark:bg-zinc-900 group cursor-pointer rounded-none overflow-hidden"
                                >
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${src}`}
                                        alt="Poster"
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                    <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white dark:bg-white dark:text-black p-1 rounded-none shadow-none">
                                        <PlusIcon className="w-4 h-4" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- Search Section (Redesigned: Focus Mode) --- */}
                <section className="relative z-30 mb-40">
                    {/* Backdrop for Focus Mode */}
                    <div
                        className={clsx(
                            "fixed inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-opacity duration-500 pointer-events-none z-30",
                            isFocused ? "opacity-100 pointer-events-auto" : "opacity-0"
                        )}
                        aria-hidden="true"
                    />

                    <div className="max-w-4xl mx-auto px-6 relative z-40">
                        <div
                            ref={searchRef}
                            className={clsx(
                                "transition-all duration-500 ease-out",
                                isFocused ? "scale-105 -translate-y-[10vh]" : "scale-100"
                            )}
                        >
                            <div className="text-center mb-8 transition-opacity duration-300" style={{ opacity: isFocused ? 1 : 1 }}>
                                <h2 className={clsx("font-medium tracking-tight mb-2 transition-all duration-500", isFocused ? "text-xl text-zinc-500" : "text-4xl md:text-5xl")}>
                                    {isFocused ? "Searching the archives..." : "Search Everything."}
                                </h2>
                                {!isFocused && <p className="text-zinc-500 dark:text-zinc-400">Database powered by TMDB. No frills.</p>}
                            </div>

                            {/* The Search Bar */}
                            <div className="relative group">
                                <div className={clsx(
                                    "relative flex items-center bg-white dark:bg-zinc-900 overflow-hidden transition-all duration-300 shadow-xl",
                                    isFocused ? "ring-2 ring-amber-500 shadow-amber-500/20" : "ring-1 ring-zinc-200 dark:ring-zinc-800"
                                )}>
                                    <div className="pl-8 text-zinc-400">
                                        <MagnifyingGlassIcon className="w-8 h-8" />
                                    </div>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Movies, Series, Anime..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        className="w-full h-24 bg-transparent border-none outline-none text-2xl md:text-3xl font-light text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 px-6"
                                    />
                                    <div className="pr-8">
                                        {isSearching ? (
                                            <div className="w-5 h-5 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin"/>
                                        ) : (
                                            isFocused && <span className="text-xs font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded">ESC</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Results Area */}
                            <AnimatePresence>
                                {isFocused && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden"
                                    >
                                        {searchResults.length > 0 ? (
                                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                                {searchResults.map((item) => (
                                                    <Link
                                                        href={`/discover/${item.media_type}/${item.id}`}
                                                        key={item.id}
                                                        className="flex items-center gap-6 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                                                    >
                                                        {/* Poster Thumb */}
                                                        <div className="w-10 h-14 relative bg-zinc-200 dark:bg-zinc-800 shrink-0 shadow-sm">
                                                            {item.poster_path ? (
                                                                <Image src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.title} fill className="object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center"><FilmIcon className="w-5 h-5 text-zinc-400"/></div>
                                                            )}
                                                        </div>

                                                        {/* Text Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3">
                                                                <h4 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-amber-600 transition-colors">
                                                                    {item.title}
                                                                </h4>
                                                                <span className={clsx(
                                                                    "text-[10px] uppercase font-bold px-1.5 py-0.5 tracking-wider border",
                                                                    item.media_type === 'movie' ? "border-blue-200 text-blue-600 dark:border-blue-900 dark:text-blue-400" : "border-purple-200 text-purple-600 dark:border-purple-900 dark:text-purple-400"
                                                                )}>
                                                                    {item.media_type}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                                                                {item.release_date ? item.release_date.split('-')[0] : 'TBA'}
                                                            </p>
                                                        </div>

                                                        {/* Arrow Action */}
                                                        <ArrowRightIcon className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                                    </Link>
                                                ))}
                                                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 text-center">
                                                    <Link href={`/discover?q=${searchQuery}`} className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                                                        View all results
                                                    </Link>
                                                </div>
                                            </div>
                                        ) : (
                                            debouncedQuery.length > 1 && !isSearching && (
                                                <div className="p-12 text-center">
                                                    <FilmIcon className="w-12 h-12 mx-auto text-zinc-200 dark:text-zinc-800 mb-4" />
                                                    <p className="text-zinc-500">No results found for "{searchQuery}"</p>
                                                </div>
                                            )
                                        )}
                                        {debouncedQuery.length < 2 && (
                                            <div className="p-8 grid grid-cols-3 gap-4 text-center">
                                                <div className="p-4 rounded border border-dashed border-zinc-200 dark:border-zinc-800">
                                                    <span className="text-xs font-bold uppercase text-zinc-400 block mb-2">Try Searching</span>
                                                    <span className="text-sm font-medium">Interstellar</span>
                                                </div>
                                                <div className="p-4 rounded border border-dashed border-zinc-200 dark:border-zinc-800">
                                                    <span className="text-xs font-bold uppercase text-zinc-400 block mb-2">Try Searching</span>
                                                    <span className="text-sm font-medium">Attack on Titan</span>
                                                </div>
                                                <div className="p-4 rounded border border-dashed border-zinc-200 dark:border-zinc-800">
                                                    <span className="text-xs font-bold uppercase text-zinc-400 block mb-2">Try Searching</span>
                                                    <span className="text-sm font-medium">Succession</span>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* --- Bento Grid (Sharp Corners) --- */}
                <section className="max-w-7xl mx-auto px-6 mb-32">
                    <div className="flex items-end justify-between mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                        <h2 className="text-4xl font-light tracking-tight">Browse by Category</h2>
                        <Link href="/discover" className="text-sm font-medium hover:underline">View All</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:h-[600px]">
                        {/* Anime */}
                        <div className="md:col-span-8 relative group overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-none min-h-[300px] md:min-h-0">
                            <Link href={bentoItems.anime.href} className="block w-full h-full">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.anime.img}`} alt={bentoItems.anime.title} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition-opacity duration-500" />
                                <div className="absolute bottom-0 p-8 text-white">
                                    <SparklesIcon className="w-8 h-8 mb-3 text-white" />
                                    <h3 className="text-4xl font-bold tracking-tighter uppercase">{bentoItems.anime.title}</h3>
                                    <p className="text-white/80 font-light mt-1 max-w-sm hidden md:block">{bentoItems.anime.description}</p>
                                </div>
                            </Link>
                        </div>

                        {/* Movie */}
                        <div className="md:col-span-4 relative group overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-none min-h-[300px] md:min-h-0">
                            <Link href={bentoItems.movie.href} className="block w-full h-full">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.movie.img}`} alt={bentoItems.movie.title} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition-opacity duration-500" />
                                <div className="absolute bottom-0 p-8 text-white">
                                    <FilmIcon className="w-8 h-8 mb-3 text-white" />
                                    <h3 className="text-4xl font-bold tracking-tighter uppercase">{bentoItems.movie.title}</h3>
                                </div>
                            </Link>
                        </div>

                        {/* KDrama */}
                        <div className="md:col-span-5 relative group overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-none min-h-[250px] md:min-h-0">
                            <Link href={bentoItems.kdrama.href} className="block w-full h-full">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.kdrama.img}`} alt={bentoItems.kdrama.title} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition-opacity duration-500" />
                                <div className="absolute bottom-0 p-6 text-white">
                                    <HeartIcon className="w-6 h-6 mb-2 text-white" />
                                    <h3 className="text-2xl font-bold tracking-tighter uppercase">{bentoItems.kdrama.title}</h3>
                                </div>
                            </Link>
                        </div>

                        {/* TV */}
                        <div className="md:col-span-7 relative group overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-none min-h-[250px] md:min-h-0">
                            <Link href={bentoItems.tv.href} className="block w-full h-full">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.tv.img}`} alt={bentoItems.tv.title} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition-opacity duration-500" />
                                <div className="absolute bottom-0 p-6 text-white">
                                    <TvIcon className="w-6 h-6 mb-2 text-white" />
                                    <h3 className="text-2xl font-bold tracking-tighter uppercase">{bentoItems.tv.title}</h3>
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
                            <div key={i} className="p-8 border border-zinc-200 dark:border-zinc-800 rounded-none hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors group">
                                <f.icon className="w-8 h-8 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 mb-6 transition-colors" />
                                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                                <p className="text-zinc-500 font-light text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- Redesigned CTA Section (Split Deck) --- */}
                <section className="max-w-7xl mx-auto px-6 mb-24">
                    <div className="grid md:grid-cols-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 overflow-hidden rounded-none shadow-2xl">
                        {/* Left: The Hook */}
                        <div className="p-12 md:p-20 flex flex-col justify-between relative overflow-hidden">
                            {/* Abstract decorative circle */}
                            <div className="absolute -top-20 -left-20 w-96 h-96 bg-zinc-800 dark:bg-zinc-300 rounded-full blur-3xl opacity-50 pointer-events-none" />

                            <div className="relative z-10">
                                <StarIcon className="w-12 h-12 mb-8 text-amber-500" />
                                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] mb-6">
                                    Start your <br />
                                    <span className="italic font-serif text-zinc-400 dark:text-zinc-500">legacy.</span>
                                </h2>
                                <p className="text-lg text-zinc-400 dark:text-zinc-600 max-w-sm leading-relaxed">
                                    Join thousands of archivists tracking their journey through cinema. The database is infinite. The account is free.
                                </p>
                            </div>
                        </div>

                        {/* Right: The Entry Points */}
                        <div className="border-t md:border-t-0 md:border-l border-zinc-700 dark:border-zinc-300 flex flex-col">
                            <Link href="/auth/sign-up" className="flex-1 flex flex-col justify-center p-12 group hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors border-b border-zinc-700 dark:border-zinc-300 relative overflow-hidden">
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-10 group-hover:translate-x-0">
                                    <ArrowRightIcon className="w-8 h-8" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">New User</span>
                                <span className="text-3xl font-bold">Create Account</span>
                            </Link>
                            <Link href="/auth/login" className="flex-1 flex flex-col justify-center p-12 group hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors relative overflow-hidden">
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-10 group-hover:translate-x-0">
                                    <ArrowRightIcon className="w-8 h-8" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Existing Member</span>
                                <span className="text-3xl font-bold">Log In</span>
                            </Link>
                        </div>
                    </div>
                </section>

            </main>

            {/* --- Footer (Redesigned) --- */}
            <footer className="border-t border-zinc-200 dark:border-zinc-800 py-16 bg-white dark:bg-zinc-950">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start justify-between gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 bg-zinc-900 dark:bg-white rounded-none" />
                            <span className={`font-bold text-lg ${PlayWriteNewZealandFont.className}`}>Deeper Weave</span>
                        </div>
                        <p className="text-zinc-500 max-w-xs text-sm">
                            The definitive platform for tracking, rating, and reviewing your visual consumption.
                        </p>
                    </div>
                    <div className="flex gap-12 text-sm">
                        <div className="flex flex-col gap-4">
                            <span className="font-bold uppercase tracking-widest text-xs">Platform</span>
                            <Link href="/discover" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">Discover</Link>
                            <Link href="/search" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">Search</Link>
                        </div>
                        <div className="flex flex-col gap-4">
                            <span className="font-bold uppercase tracking-widest text-xs">Social</span>
                            <a href="#" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">Twitter</a>
                            <a href="#" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">Discord</a>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center text-xs text-zinc-400">
                    <span>© 2026 Deeper Weave.</span>
                    <span>Crafted with love ❤. ️</span>
                </div>
            </footer>
        </div>
    );
}