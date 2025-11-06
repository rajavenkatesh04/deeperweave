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

    const mappedSearchItems = useMemo(() => {
        return searchDemoItems.map(item => {
            let Icon = FilmIcon;
            if (item.type === 'Anime') Icon = SparklesIcon;
            if (item.type === 'TV Series') Icon = TvIcon;
            return { ...item, icon: Icon };
        });
    }, [searchDemoItems]);

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
    }, { scope: mainRef });

    const { scrollYProgress } = useScroll({ target: mainRef, offset: ["start start", "end start"] });
    const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    return (
        <div ref={mainRef} className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white overflow-x-hidden selection:bg-orange-500/30">
            <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-white/70 dark:bg-black/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:rotate-12 transition-transform duration-500 ease-out" />
                        <span className={`${PlayWriteNewZealandFont.className} text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent`}>
                            Deeper Weave
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/discover" className="text-sm font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-all duration-300">Discover</Link>
                        <Link href="/blog" className="text-sm font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-all duration-300">Community</Link>
                        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800" />
                        <Link href="/auth/login" className="text-sm font-bold hover:opacity-70 transition-all duration-300">Log in</Link>
                        <Link href="/auth/sign-up" className="group relative inline-flex h-10 items-center justify-center rounded-full bg-black dark:bg-white px-6 font-bold text-sm text-white dark:text-black transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg">
                            <span>Join Free</span>
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
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
                    </motion.div>

                    <div className="container relative z-10 mx-auto px-6 pt-20 text-center text-white">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md mb-8"
                        >
                            <StarIcon className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold tracking-widest uppercase opacity-80">The Ultimate Tracker</span>
                        </motion.div>

                        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.9] mb-8">
                            Track your<br />
                            <span className="relative inline-block h-[1.1em] w-full align-bottom overflow-hidden">
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
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="text-xl md:text-3xl text-white/70 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
                        >
                            One beautiful, unified timeline for your entire obsession.
                        </motion.p>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href="/auth/sign-up" className="h-16 px-10 rounded-full bg-white text-black font-bold text-lg flex items-center gap-2 shadow-2xl hover:shadow-orange-500/50 transition-all duration-300">
                                    Start Logging <ArrowRightIcon className="w-5 h-5"/>
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href="/discover" className="h-16 px-10 rounded-full bg-white/10 text-white font-bold text-lg flex items-center gap-2 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300">
                                    <PlayCircleIcon className="w-6 h-6"/> View Demo
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>

                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
                    >
                        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
                    </motion.div>
                </section>

                <section className="py-24 bg-white dark:bg-[#050505] overflow-hidden">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 mb-12"
                    >
                        From Classics to Currently Airing
                    </motion.p>
                    <div className="flex overflow-hidden select-none">
                        <div className="flex flex-shrink-0 gap-6 min-w-full marquee-track will-change-transform">
                            {[...heroPosters, ...heroPosters, ...heroPosters].map((src, i) => (
                                <div
                                    key={i}
                                    className="relative h-[300px] w-[200px] flex-shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 grayscale-[30%] hover:grayscale-0 transition-all duration-500 hover:scale-[1.02]"
                                >
                                    <Image src={`https://image.tmdb.org/t/p/w500${src}`} alt="Poster" fill className="object-cover" loading="lazy" sizes="200px" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-32 px-6 bg-zinc-50 dark:bg-[#0A0A0A]">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center mb-40">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-5xl md:text-7xl font-black mb-8 leading-none">Search<br/>Everything.</h2>
                                <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                                    Stop jumping between anime lists, drama wikis, and movie apps. It&apos;s all here, powered by TMDB.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {["Anime", "K-Drama", "Western TV", "Indie Films"].map((tag, i) => (
                                        <motion.span
                                            key={tag}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.1 * i, duration: 0.4 }}
                                            viewport={{ once: true }}
                                            className="px-4 py-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-sm"
                                        >
                                            {tag}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                viewport={{ once: true }}
                                className="relative w-full"
                            >
                                <div className="absolute inset-0 bg-orange-500/30 blur-[100px] rounded-full opacity-50" />
                                <div className="relative bg-white dark:bg-[#050505] p-4 md:p-6 rounded-3xl shadow-2xl border border-zinc-200/50 dark:border-zinc-800 hover:rotate-0 transition-all duration-700 ease-out max-w-md mx-auto md:max-w-none">
                                    <div className="flex items-center gap-4 p-3 md:p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl mb-4 md:mb-6">
                                        <MagnifyingGlassIcon className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                                        <span className="text-lg md:text-xl text-zinc-400 dark:text-zinc-600 animate-pulse">
                                            Searching...
                                        </span>
                                    </div>
                                    <div className="space-y-2 md:space-y-3">
                                        {mappedSearchItems.map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 + (i * 0.1), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                viewport={{ once: true }}
                                                className="flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all duration-300"
                                            >
                                                <div className="relative w-10 h-14 md:w-12 md:h-16 flex-shrink-0 rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-800 shadow-sm">
                                                    <Image src={`https://image.tmdb.org/t/p/w92${item.img}`} alt={item.title} fill className="object-cover" sizes="48px" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold truncate text-sm md:text-base">{item.title}</p>
                                                    <p className="text-xs md:text-sm text-zinc-500">{item.year}</p>
                                                </div>
                                                <div className={`flex items-center gap-1.5 text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 ${item.color}`}>
                                                    <item.icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                    <span className="hidden sm:inline">{item.type}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <section className="py-32 bg-black text-white px-6">
                    <div className="container mx-auto">
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            viewport={{ once: true }}
                            className="text-center text-5xl md:text-8xl font-black mb-24"
                        >
                            Pick Your Poison.
                        </motion.h2>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                viewport={{ once: true }}
                                className="md:col-span-8 h-[400px] md:h-[500px]"
                            >
                                <Link href={bentoItems.anime.href} className="h-full block group relative rounded-3xl overflow-hidden bg-zinc-900">
                                    <Image src={`https://image.tmdb.org/t/p/original${bentoItems.anime.img}`} alt={bentoItems.anime.title} fill className="object-cover opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 ease-out" sizes="(max-width: 768px) 100vw, 66vw" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                    <div className="absolute bottom-0 p-6 md:p-10">
                                        <SparklesIcon className="w-8 h-8 md:w-12 md:h-12 text-pink-500 mb-2 md:mb-4" />
                                        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">{bentoItems.anime.title}</h3>
                                        <p className="text-base md:text-xl text-zinc-300 mt-2 group-hover:text-white transition-colors duration-300">{bentoItems.anime.description}</p>
                                    </div>
                                </Link>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                viewport={{ once: true }}
                                className="md:col-span-4 h-[400px] md:h-[500px]"
                            >
                                <Link href={bentoItems.movie.href} className="h-full block group relative rounded-3xl overflow-hidden bg-zinc-900">
                                    <Image src={`https://image.tmdb.org/t/p/original${bentoItems.movie.img}`} alt={bentoItems.movie.title} fill className="object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700 ease-out" sizes="(max-width: 768px) 100vw, 33vw" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 p-6 md:p-10">
                                        <FilmIcon className="w-8 h-8 md:w-12 md:h-12 text-amber-500 mb-2 md:mb-4" />
                                        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">{bentoItems.movie.title}</h3>
                                        <p className="text-base md:text-xl text-zinc-300 mt-2">{bentoItems.movie.description}</p>
                                    </div>
                                </Link>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                viewport={{ once: true }}
                                className="md:col-span-5 h-[300px] md:h-[400px]"
                            >
                                <Link href={bentoItems.kdrama.href} className="h-full block group relative rounded-3xl overflow-hidden bg-zinc-900">
                                    <Image src={`https://image.tmdb.org/t/p/original${bentoItems.kdrama.img}`} alt={bentoItems.kdrama.title} fill className="object-cover opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 ease-out" sizes="(max-width: 768px) 100vw, 41vw" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                                    <div className="absolute bottom-0 p-6 md:p-8">
                                        <HeartIcon className="w-6 h-6 md:w-8 md:h-8 text-red-500 mb-2" />
                                        <h3 className="text-3xl md:text-4xl font-black uppercase">{bentoItems.kdrama.title}</h3>
                                    </div>
                                </Link>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                viewport={{ once: true }}
                                className="md:col-span-7 h-[300px] md:h-[400px]"
                            >
                                <Link href={bentoItems.tv.href} className="h-full block group relative rounded-3xl overflow-hidden bg-zinc-900">
                                    <Image src={`https://image.tmdb.org/t/p/original${bentoItems.tv.img}`} alt={bentoItems.tv.title} fill className="object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700 ease-out" sizes="(max-width: 768px) 100vw, 58vw" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                                    <div className="absolute bottom-0 p-6 md:p-8">
                                        <TvIcon className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mb-2" />
                                        <h3 className="text-3xl md:text-4xl font-black uppercase">{bentoItems.tv.title}</h3>
                                    </div>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <section className="py-32 bg-white dark:bg-[#050505] px-6">
                    <div className="container mx-auto max-w-5xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/30 px-5 py-2.5 mb-8">
                                <HeartIcon className="w-4 h-4 text-orange-600 dark:text-orange-500" />
                                <span className="text-xs font-bold tracking-widest uppercase text-orange-600 dark:text-orange-500">One Timeline, Infinite Stories</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                                Your Complete<br/>
                                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                                    Watch History
                                </span>
                            </h2>
                            <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-16 max-w-3xl mx-auto">
                                Movies, TV shows, anime, K-dramas—track everything in a single beautiful timeline.
                                Log what you watch, rate your favorites, and share your thoughts through personalized blogs.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            {[
                                { icon: FilmIcon, title: "Universal Tracking", desc: "Every show, movie, or anime in one unified library", color: "text-amber-600" },
                                { icon: HeartIcon, title: "Rate & Review", desc: "Express your thoughts with ratings and detailed reviews", color: "text-red-600" },
                                { icon: SparklesIcon, title: "Personal Blogs", desc: "Write and share your own stories about what you love", color: "text-pink-600" }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 + (i * 0.1), ease: [0.16, 1, 0.3, 1] }}
                                    viewport={{ once: true }}
                                    className="group p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-800 transition-all duration-500"
                                >
                                    <feature.icon className={`w-12 h-12 ${feature.color} mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`} />
                                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="relative py-40 md:py-60 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 dark:from-orange-900 dark:via-red-900 dark:to-pink-900" />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/30 rounded-full blur-[120px]"
                        />
                        <motion.div
                            animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-[120px]"
                        />
                    </div>

                    <div className="container relative z-10 text-center px-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            viewport={{ once: true }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="inline-block mb-8"
                            >
                                <div className="flex items-center gap-3 text-white/90">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <StarIcon className="w-8 h-8" />
                                    </motion.div>
                                    <span className="text-xl font-bold uppercase tracking-widest">Join the Community</span>
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                    >
                                        <StarIcon className="w-8 h-8" />
                                    </motion.div>
                                </div>
                            </motion.div>

                            <h2 className="text-5xl md:text-7xl lg:text-[8vw] font-black text-white leading-none mb-6 tracking-tighter">
                                START YOUR<br/>
                                <span className="italic font-serif">LEGACY</span>
                            </h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                viewport={{ once: true }}
                                className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed"
                            >
                                Join thousands of fans tracking their journey through cinema, television, and anime.
                                <span className="font-bold text-white"> Your story starts here.</span>
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                viewport={{ once: true }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link href="/auth/sign-up" className="group relative inline-block">
                                        <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                                        <span className="relative inline-flex items-center gap-2 bg-white text-black text-xl font-bold px-12 py-6 rounded-full shadow-2xl">
                                            Create Free Account
                                            <motion.span
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <ArrowRightIcon className="w-5 h-5" />
                                            </motion.span>
                                        </span>
                                    </Link>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link href="/discover" className="inline-flex items-center gap-2 text-white text-lg font-bold px-8 py-4 rounded-full border-2 border-white/30 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
                                        <PlayCircleIcon className="w-6 h-6" />
                                        <span>Explore Features</span>
                                    </Link>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                viewport={{ once: true }}
                                className="mt-12 flex items-center justify-center gap-8 text-white/60 text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-400" />
                                    <span>Free Forever</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                    <span>No Credit Card</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                                    <span>1M+ Content</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    <motion.div
                        animate={{ y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xs uppercase tracking-wider">Scroll to Footer</span>
                            <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
                        </div>
                    </motion.div>
                </section>
            </main>

            <footer className="py-16 bg-white dark:bg-black border-t border-zinc-100 dark:border-zinc-900">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center text-center"
                    >
                        <Link href="/" className="flex items-center gap-2 mb-6 group">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:rotate-12 transition-transform duration-500" />
                            <span className={`${PlayWriteNewZealandFont.className} text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent`}>
                                Deeper Weave
                            </span>
                        </Link>

                        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-8 max-w-md">
                            The ultimate platform for tracking your complete entertainment journey—from blockbusters to hidden gems.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm">
                            <Link href="/discover" className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors">Discover</Link>
                            <Link href="/blog" className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors">Community</Link>
                            <Link href="/about" className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors">About</Link>
                            <Link href="/privacy" className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors">Privacy</Link>
                            <Link href="/terms" className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors">Terms</Link>
                        </div>

                        <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent mb-8" />

                        <p className="text-zinc-500 dark:text-zinc-600 text-sm">
                            © 2025 Deeper Weave. Crafted for the obsessed.
                        </p>
                    </motion.div>
                </div>
            </footer>
        </div>
    );
}