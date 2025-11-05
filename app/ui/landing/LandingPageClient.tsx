'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import Link from "next/link";
import Image from "next/image";
import {
    FilmIcon, TvIcon, SparklesIcon, HeartIcon,
    MagnifyingGlassIcon, ArrowRightIcon,
    PlayCircleIcon, StarIcon
} from "@heroicons/react/24/solid";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

// --- Interfaces ---
interface HeroItem {
    label: string;
    bg: string;
}

interface SearchDemoItemData {
    title: string;
    year: string;
    type: string;
    color: string;
    img: string;
}

interface BentoItemData {
    title: string;
    href: string;
    img: string;
    description?: string;
}

interface LandingPageClientProps {
    heroPosters: string[];
    heroItems: HeroItem[];
    searchDemoItems: SearchDemoItemData[];
    bentoItems: {
        anime: BentoItemData;
        movie: BentoItemData;
        kdrama: BentoItemData;
        tv: BentoItemData;
    };
}

export default function LandingPageClient({
                                              heroPosters,
                                              heroItems,
                                              searchDemoItems,
                                              bentoItems
                                          }: LandingPageClientProps) {
    const mainRef = useRef<HTMLDivElement>(null);
    const [heroIndex, setHeroIndex] = useState(0);

    // --- ICON MAPPING ---
    const mappedSearchItems = useMemo(() => {
        return searchDemoItems.map(item => {
            let Icon = FilmIcon;
            if (item.type === 'Anime') Icon = SparklesIcon;
            if (item.type === 'TV Series') Icon = TvIcon;
            return { ...item, icon: Icon };
        });
    }, [searchDemoItems]);

    // Cycle hero index
    useEffect(() => {
        const timer = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroItems.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [heroItems.length]);

    useGSAP(() => {
        gsap.to(".marquee-track", {
            xPercent: -50,
            repeat: -1,
            duration: 60,
            ease: "linear",
        });

        // Correctly typed array for GSAP
        const reveals = gsap.utils.toArray<HTMLElement>('.reveal-up');
        reveals.forEach((elem) => {
            gsap.from(elem, {
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });
        });
    }, { scope: mainRef });

    const { scrollYProgress } = useScroll({ target: mainRef, offset: ["start start", "end start"] });
    const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    return (
        <div ref={mainRef} className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white overflow-x-hidden selection:bg-orange-500/30">

            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-white/70 dark:bg-black/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:rotate-12 transition-transform duration-500 ease-out" />
                        <span className={`${PlayWriteNewZealandFont.className} text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent`}>
                            Deeper Weave
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/discover" className="text-sm font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-colors">Discover</Link>
                        <Link href="/blog" className="text-sm font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-colors">Community</Link>
                        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800" />
                        <Link href="/auth/login" className="text-sm font-bold hover:opacity-70 transition-opacity">Log in</Link>
                        <Link href="/auth/sign-up" className="group relative inline-flex h-10 items-center justify-center rounded-full bg-black dark:bg-white px-6 font-bold text-sm text-white dark:text-black transition-transform hover:scale-105 active:scale-95">
                            <span>Join Free</span>
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* === HERO SECTION === */}
                <section className="relative h-[110vh] flex items-center justify-center overflow-hidden -mt-20">
                    <motion.div style={{ y: yBackground }} className="absolute inset-0 z-0">
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={heroIndex}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="absolute inset-0"
                            >
                                {heroItems[heroIndex]?.bg && (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/original${heroItems[heroIndex].bg}`}
                                        alt="Hero Background"
                                        fill
                                        priority
                                        className="object-cover saturate-[1.2]"
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-black/30" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-[#050505]/80" />
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                    </motion.div>

                    <div className="container relative z-10 mx-auto px-6 pt-20 text-center text-white">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md mb-8"
                        >
                            <StarIcon className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold tracking-widest uppercase opacity-80">The Ultimate Tracker</span>
                        </motion.div>

                        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.9] mb-8">
                            Track your<br />
                            <span className="relative inline-block h-[1.1em] w-full md:w-[600px] align-bottom overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={heroItems[heroIndex]?.label}
                                        initial={{ y: "110%" }}
                                        animate={{ y: "0%" }}
                                        exit={{ y: "-110%" }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                        className="absolute inset-0 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent font-serif italic py-2"
                                    >
                                        {heroItems[heroIndex]?.label}
                                    </motion.span>
                                </AnimatePresence>
                            </span>
                        </h1>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-xl md:text-3xl text-white/70 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
                        >
                            One beautiful, unified timeline for your entire obsession.
                        </motion.p>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link href="/auth/sign-up" className="h-16 px-10 rounded-full bg-white text-black font-bold text-lg flex items-center gap-2 hover:scale-105 transition-all">
                                Start Logging <ArrowRightIcon className="w-5 h-5"/>
                            </Link>
                            <Link href="/discover" className="h-16 px-10 rounded-full bg-white/10 text-white font-bold text-lg flex items-center gap-2 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all">
                                <PlayCircleIcon className="w-6 h-6"/> View Demo
                            </Link>
                        </motion.div>
                    </div>

                    <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50">
                        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
                    </motion.div>
                </section>

                {/* === MARQUEE SECTION === */}
                <section className="py-24 bg-white dark:bg-[#050505] overflow-hidden">
                    <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 mb-12">From Classics to Currently Airing</p>
                    <div className="flex overflow-hidden select-none mask-linear-gradient">
                        <div className="flex flex-shrink-0 gap-6 min-w-full marquee-track will-change-transform">
                            {[...heroPosters, ...heroPosters, ...heroPosters].map((src, i) => (
                                <div key={i} className="relative h-[300px] w-[200px] flex-shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 grayscale-[30%] hover:grayscale-0 transition-all duration-500 hover:scale-[1.02]">
                                    <Image src={`https://image.tmdb.org/t/p/w500${src}`} alt="Poster" fill className="object-cover" loading="lazy" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* === FEATURES SECTION === */}
                <section className="py-32 px-6 bg-zinc-50 dark:bg-[#0A0A0A]">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid md:grid-cols-2 gap-20 items-center mb-40 reveal-up">
                            <div>
                                <h2 className="text-5xl md:text-7xl font-black mb-8 leading-none">Search<br/>Everything.</h2>
                                <p className="text-2xl text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                                    Stop jumping between anime lists, drama wikis, and movie apps. It&apos;s all here, powered by TMDB.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {["Anime", "K-Drama", "Western TV", "Indie Films"].map(tag => (
                                        <span key={tag} className="px-4 py-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-orange-500/30 blur-[100px] rounded-full opacity-50" />
                                <div className="relative bg-white dark:bg-[#050505] p-6 rounded-3xl shadow-2xl border border-zinc-200/50 dark:border-zinc-800 rotate-3 hover:rotate-0 transition-transform duration-500 ease-out">
                                    <div className="flex items-center gap-4 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl mb-6">
                                        <MagnifyingGlassIcon className="w-6 h-6 text-orange-500" />
                                        <span className="text-xl text-zinc-400 dark:text-zinc-600 animate-pulse">
                                            Searching...
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {mappedSearchItems.map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + (i * 0.15) }}
                                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                                            >
                                                <div className="relative w-12 h-16 flex-shrink-0 rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-800 shadow-sm">
                                                    <Image src={`https://image.tmdb.org/t/p/w92${item.img}`} alt={item.title} fill className="object-cover" sizes="48px" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold truncate">{item.title}</p>
                                                    <p className="text-sm text-zinc-500">{item.year}</p>
                                                </div>
                                                <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 ${item.color}`}>
                                                    <item.icon className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">{item.type}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === BENTO GRID SECTION === */}
                <section className="py-32 bg-black text-white px-6">
                    <div className="container mx-auto">
                        <h2 className="text-center text-5xl md:text-8xl font-black mb-24 reveal-up">Pick Your Poison.</h2>

                        <div className="grid grid-cols-1 md:grid-cols-12 grid-rows-2 gap-4 h-auto md:h-[800px]">
                            {/* Anime */}
                            <Link href={bentoItems.anime.href} className="md:col-span-8 group relative rounded-3xl overflow-hidden bg-zinc-900 reveal-up">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.anime.img}`} alt={bentoItems.anime.title} fill className="object-cover opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" sizes="(max-width: 768px) 100vw, 66vw" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                <div className="absolute bottom-0 p-10">
                                    <SparklesIcon className="w-12 h-12 text-pink-500 mb-4" />
                                    <h3 className="text-6xl font-black uppercase tracking-tighter">{bentoItems.anime.title}</h3>
                                    <p className="text-xl text-zinc-300 mt-2 group-hover:text-white transition-colors">{bentoItems.anime.description}</p>
                                </div>
                            </Link>

                            {/* Movies */}
                            <Link href={bentoItems.movie.href} className="md:col-span-4 md:row-span-2 group relative rounded-3xl overflow-hidden bg-zinc-900 reveal-up">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.movie.img}`} alt={bentoItems.movie.title} fill className="object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700" sizes="(max-width: 768px) 100vw, 33vw" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                <div className="absolute bottom-0 p-10">
                                    <FilmIcon className="w-12 h-12 text-amber-500 mb-4" />
                                    <h3 className="text-6xl font-black uppercase tracking-tighter">{bentoItems.movie.title}</h3>
                                    <p className="text-xl text-zinc-300 mt-2">{bentoItems.movie.description}</p>
                                </div>
                            </Link>

                            {/* K-Drama */}
                            <Link href={bentoItems.kdrama.href} className="md:col-span-5 group relative min-h-[300px] rounded-3xl overflow-hidden bg-zinc-900 reveal-up">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.kdrama.img}`} alt={bentoItems.kdrama.title} fill className="object-cover opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" sizes="(max-width: 768px) 100vw, 41vw" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                                <div className="absolute bottom-0 p-8">
                                    <HeartIcon className="w-8 h-8 text-red-500 mb-2" />
                                    <h3 className="text-4xl font-black uppercase">{bentoItems.kdrama.title}</h3>
                                </div>
                            </Link>

                            {/* TV */}
                            <Link href={bentoItems.tv.href} className="md:col-span-3 group relative min-h-[300px] rounded-3xl overflow-hidden bg-zinc-900 reveal-up">
                                <Image src={`https://image.tmdb.org/t/p/original${bentoItems.tv.img}`} alt={bentoItems.tv.title} fill className="object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700" sizes="(max-width: 768px) 100vw, 25vw" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                                <div className="absolute bottom-0 p-8">
                                    <TvIcon className="w-8 h-8 text-blue-500 mb-2" />
                                    <h3 className="text-4xl font-black uppercase">{bentoItems.tv.title}</h3>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* === FINAL CTA === */}
                <section className="relative py-60 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-orange-600 dark:bg-orange-900/20" />
                    <div className="container relative z-10 text-center px-6">
                        <h2 className="text-7xl md:text-[8vw] font-black text-white leading-none mb-10 tracking-tighter mix-blend-overlay">
                            START YOUR<br/>LEGACY.
                        </h2>
                        <Link href="/auth/sign-up" className="inline-block bg-white text-black text-xl font-bold px-16 py-6 rounded-full hover:scale-110 hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 ease-out">
                            Create Free Account
                        </Link>
                    </div>
                </section>
            </main>

            {/* --- FOOTER --- */}
            <footer className="py-10 bg-white dark:bg-black border-t border-zinc-100 dark:border-zinc-900 text-center">
                <div className="flex items-center justify-center gap-2 opacity-30 hover:opacity-100 transition-opacity mb-4">
                    <div className="h-6 w-6 rounded-md bg-gradient-to-br from-amber-500 to-orange-600" />
                    <span className={`${PlayWriteNewZealandFont.className} font-bold`}>Deeper Weave</span>
                </div>
                <p className="text-zinc-500 text-sm">© 2025. Crafted for the obsessed.</p>
            </footer>
        </div>
    );
}