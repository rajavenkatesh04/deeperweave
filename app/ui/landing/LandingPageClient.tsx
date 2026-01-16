'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRightIcon, MagnifyingGlassIcon, StarIcon,
    SparklesIcon, FilmIcon, PlayCircleIcon,
    ArrowUpRightIcon, CheckCircleIcon
} from "@heroicons/react/24/solid";
import {
    CalendarIcon, MapPinIcon
} from "@heroicons/react/24/outline";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { dmSerif, googleSansCode, geistSans } from "@/app/ui/fonts";

// --- Types ---
interface LandingPageClientProps {
    heroPosters: string[];
    bentoItems: any;
}

// --- ANIMATED SEARCH MOCKUP ---
const AnimatedSearchMockup = () => {
    const [text, setText] = useState("");
    const [showResults, setShowResults] = useState(false);
    const fullText = "Interstellar";

    useEffect(() => {
        let currentIndex = 0;
        let timeoutId: NodeJS.Timeout;

        const typeChar = () => {
            if (currentIndex < fullText.length) {
                setText(fullText.slice(0, currentIndex + 1));
                currentIndex++;
                timeoutId = setTimeout(typeChar, 150 + Math.random() * 100); // Random typing speed
            } else {
                setTimeout(() => setShowResults(true), 500);
            }
        };

        // Start typing after a delay
        timeoutId = setTimeout(typeChar, 1000);

        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div className="relative w-full max-w-lg mx-auto z-20">
            {/* The Input Bar */}
            <div className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-xl h-14 px-4 overflow-hidden">
                <MagnifyingGlassIcon className="w-5 h-5 text-zinc-400 shrink-0" />
                <div className="flex items-center h-full w-full px-4">
                    <span className="text-zinc-900 dark:text-zinc-100 font-medium text-lg relative">
                        {text}
                        {/* Blinking Cursor */}
                        <span className="absolute -right-[2px] top-1 bottom-1 w-[2px] bg-amber-500 animate-pulse" />
                    </span>
                    {text.length === 0 && (
                        <span className="absolute left-4 text-zinc-400 pointer-events-none">Search cinema...</span>
                    )}
                </div>
                {showResults && (
                    <div className="w-5 h-5 border-2 border-zinc-200 border-t-amber-500 rounded-full animate-spin shrink-0" />
                )}
            </div>

            {/* The Results Dropdown */}
            <AnimatePresence>
                {showResults && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 mt-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden text-left"
                    >
                        <div className="p-2 space-y-1">
                            {/* Result 1 */}
                            <div className="flex items-center gap-4 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50">
                                <div className="w-10 h-14 bg-zinc-200 relative shrink-0 rounded-sm overflow-hidden">
                                    <Image src="https://image.tmdb.org/t/p/w200/gEU2QniL6qFjqlvuymbaT47TlZL.jpg" alt="" fill className="object-cover" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Interstellar</div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">2014 • Christopher Nolan</div>
                                </div>
                                <ArrowRightIcon className="w-4 h-4 text-zinc-400 ml-auto" />
                            </div>
                            {/* Result 2 (Faded) */}
                            <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/30 opacity-60">
                                <div className="w-10 h-14 bg-zinc-200 relative shrink-0 rounded-sm overflow-hidden">
                                    <Image src="https://image.tmdb.org/t/p/w200/m2L608yUnPChZqFh1F29v4v1s.jpg" alt="" fill className="object-cover" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Interestellar (OST)</div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Album • Hans Zimmer</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- VISUAL ASSETS (Mock Components) ---

const MockTimelineCard = () => (
    <div className="flex w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group">
        <div className="flex flex-col items-center justify-center w-16 shrink-0 border-r border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/20">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">OCT</span>
            <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100 my-0.5 group-hover:text-amber-600 transition-colors">31</span>
            <span className="text-[10px] font-medium text-zinc-400">2025</span>
        </div>
        <div className="relative w-28 aspect-[2/3] shrink-0 bg-zinc-200">
            <Image src="https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg" alt="Toy Story" fill className="object-cover" />
        </div>
        <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 uppercase tracking-wider">Rewatch</span>
                </div>
                <h3 className={`${googleSansCode.className} text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight`}>Toy Story</h3>
                <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed font-mono">
                    "To infinity and beyond." Watching this with fresh eyes, the lighting rendering is actually insane for 1995.
                </p>
            </div>
            <div className="flex items-center gap-1 pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-3 text-amber-500">
                <StarIcon className="w-3 h-3" />
                <StarIcon className="w-3 h-3" />
                <StarIcon className="w-3 h-3" />
                <StarIcon className="w-3 h-3" />
                <StarIcon className="w-3 h-3" />
                <span className="ml-auto text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Masterpiece</span>
            </div>
        </div>
    </div>
);

const MockListRow = ({ rank, title, year, poster }: any) => (
    <div className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-lg transition-all group cursor-default shadow-sm">
        <span className={`${googleSansCode.className} text-xl text-zinc-300 font-bold w-6 text-center group-hover:text-amber-600 transition-colors`}>{rank}</span>
        <div className="relative w-10 h-14 bg-zinc-200 shadow-sm shrink-0 overflow-hidden rounded-sm">
            <Image src={`https://image.tmdb.org/t/p/w200${poster}`} alt={title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{title}</p>
            <p className="text-xs text-zinc-500 font-mono">{year}</p>
        </div>
    </div>
);

const MockBlogCard = () => (
    <Link href="/blog/queen-of-the-night" className="block group w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-2xl transition-all duration-500 rounded-xl relative">
        <div className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-black/90 backdrop-blur px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                Featured <ArrowUpRightIcon className="w-3 h-3" />
            </span>
        </div>
        <div className="relative w-full aspect-[21/9] bg-zinc-100 overflow-hidden">
            <Image
                src="https://jyjynjpznlvezjhnuwhi.supabase.co/storage/v1/object/public/post_banners/b78b33d1-2794-4623-b32a-9d70b2753851/2f89a499-9cec-45a8-b4e4-6d812be34989.avif"
                alt="Queen of the Night"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

            {/* Title Overlay on Image */}
            <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                <h3 className={`${dmSerif.className} text-3xl md:text-4xl text-white leading-none mb-2 drop-shadow-lg`}>
                    Queen of the night?
                </h3>
            </div>
        </div>
        <div className="p-6 md:p-8">
            <div className="flex items-start gap-4">
                <div className="flex-1">
                    <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3 font-light mb-6">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">Chapter 1: Chandra.</span> Well, to start off, the movie was a visual spectacle with a cyberpunk-like feel. I loved the visuals, especially the elevation shots of Chandra every time. The VFX and post-processing felt spot on...
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-zinc-200 relative overflow-hidden">
                                <Image src="/placeholder-user.jpg" alt="User" fill className="object-cover" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">DeppwerWeave Editorial</span>
                        </div>
                        <span className="text-[11px] font-medium text-zinc-400">4 min read</span>
                    </div>
                </div>
            </div>
        </div>
    </Link>
);


export default function LandingPageClient({ heroPosters }: LandingPageClientProps) {
    // Parallax
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: targetRef });
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);

    return (
        <div className={`min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 ${geistSans.className} selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black`}>

            {/* --- Navigation --- */}
            <nav className="fixed top-0 z-50 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 transition-all">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="h-8 w-8 bg-zinc-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center group-hover:scale-95 transition-transform duration-300">
                            <span className="text-white dark:text-zinc-900 font-bold text-xs tracking-tighter">DW</span>
                        </div>
                        <span className={`${googleSansCode.className} text-sm font-bold tracking-tight uppercase`}>DeeperWeave</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-zinc-500">
                        <Link href="/discover" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Platform</Link>
                        <Link href="/features" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Features</Link>
                        <Link href="/auth/login" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Sign In</Link>
                        <Link href="/auth/sign-up" className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black px-5 py-2.5 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* --- HERO SECTION --- */}
                <section className="relative pt-40 pb-24 md:pt-60 md:pb-40 px-6 overflow-hidden">
                    {/* Background Noise/Gradient */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

                    <div className="max-w-5xl mx-auto text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <h1 className={`${dmSerif.className} text-7xl md:text-9xl text-zinc-900 dark:text-zinc-100 leading-[0.85] tracking-tight mb-12`}>
                                Weave Your <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-zinc-400 to-zinc-600 dark:from-zinc-500 dark:to-zinc-700">History.</span>
                            </h1>

                            <p className="text-lg md:text-xl text-zinc-500 font-light max-w-lg mx-auto leading-relaxed mb-16">
                                The operating system for your cinematic life. <br className="hidden md:block" /> Movies, Anime, TV—all connected in one beautiful thread.
                            </p>

                            {/* THE HERO COMPONENT: Animated Search */}
                            <AnimatedSearchMockup />

                        </motion.div>
                    </div>
                </section>

                {/* --- FEATURE 1: THE TIMELINE --- */}
                <section className="py-32 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative">
                    <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
                        <div className="relative order-2 lg:order-1">
                            <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100 to-transparent dark:from-zinc-900 rounded-full blur-3xl opacity-50" />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="relative z-10 pl-8"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800" />
                                <MockTimelineCard />
                                {/* Decorative connection */}
                                <div className="absolute left-0 top-1/2 -translate-x-1/2 w-3 h-3 border-2 border-white dark:border-zinc-950 bg-amber-500 rounded-full shadow-sm" />
                            </motion.div>
                        </div>

                        <div className="space-y-8 order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                <CalendarIcon className="w-3 h-3" /> The Core
                            </div>
                            <h2 className={`${dmSerif.className} text-5xl md:text-6xl text-zinc-900 dark:text-zinc-100`}>
                                Every Frame, <br/> Accounted For.
                            </h2>
                            <p className="text-lg text-zinc-500 leading-relaxed font-light max-w-sm">
                                DeeperWeave logs the <strong>context</strong>. The theatre format, the date, the rewatch count, and your raw, unfiltered notes. Not just a database, but a diary.
                            </p>
                            <ul className="space-y-4 pt-4">
                                {['Detailed Logging', 'Rewatch Tracking', 'Rich Text Editor', 'Social Tagging'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
                                        <CheckCircleIcon className="w-5 h-5 text-amber-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* --- FEATURE 2: LISTS --- */}
                <section className="py-32 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                <SparklesIcon className="w-3 h-3" /> Curation
                            </div>
                            <h2 className={`${dmSerif.className} text-5xl md:text-6xl text-zinc-900 dark:text-zinc-100`}>
                                Curate the <br/> Chaos.
                            </h2>
                            <p className="text-lg text-zinc-500 leading-relaxed font-light max-w-sm">
                                Create specific collections for "Rainy Days" or "Cyberpunk Classics". Rank them. Share them with the world or keep them for your eyes only.
                            </p>
                            <Link href="/auth/sign-up" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest border-b border-zinc-900 dark:border-zinc-100 pb-0.5 hover:text-amber-600 hover:border-amber-600 transition-colors">
                                Start Curating <ArrowRightIcon className="w-4 h-4" />
                            </Link>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-zinc-950 p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl relative"
                        >
                            <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <h3 className={`${dmSerif.className} text-3xl`}>Neon Noir</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">5 Items</p>
                            </div>
                            <div className="space-y-3">
                                <MockListRow rank="01" title="Blade Runner 2049" year="2017" poster="/gAjx947971c2bdj8Xg99c85Q.jpg" />
                                <MockListRow rank="02" title="Akira" year="1988" poster="/neMZH82Stu91d3iqvLdNQfqPPyl.jpg" />
                                <MockListRow rank="03" title="Drive" year="2011" poster="/602vevIURmp436yz1vl2zenHMKJ.jpg" />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* --- FEATURE 3: DISCOVERY (Horizontal) --- */}
                <section className="py-32 overflow-hidden bg-zinc-900 dark:bg-zinc-950 text-white" ref={targetRef}>
                    <div className="max-w-7xl mx-auto px-6 mb-16 flex items-end justify-between">
                        <div className="max-w-md">
                            <h2 className={`${dmSerif.className} text-4xl md:text-5xl mb-4`}>The Infinite Archive</h2>
                            <p className="text-zinc-400 font-light">Powered by TMDB. Millions of titles at your fingertips. No algorithms, just pure discovery.</p>
                        </div>
                        <Link href="/discover" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-amber-500 transition-colors">
                            Explore <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="relative w-full">
                        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-zinc-900 to-transparent z-10" />
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-zinc-900 to-transparent z-10" />
                        <motion.div style={{ x }} className="flex gap-4 w-max pl-6">
                            {heroPosters.concat(heroPosters).map((src, i) => (
                                <div key={i} className="relative w-[200px] aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden shrink-0 group grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer hover:scale-105 shadow-lg">
                                    <Image src={`https://image.tmdb.org/t/p/w500${src}`} alt="" fill className="object-cover" />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* --- FEATURE 4: BLOGGING --- */}
                <section className="py-32 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-20 items-center">
                        <div className="flex-1 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                <MapPinIcon className="w-3 h-3" /> Community
                            </div>
                            <h2 className={`${dmSerif.className} text-5xl md:text-6xl text-zinc-900 dark:text-zinc-100`}>
                                Write Longform. <br/> Spark Debate.
                            </h2>
                            <p className="text-lg text-zinc-500 leading-relaxed font-light">
                                Sometimes 280 characters isn't enough. Publish in-depth reviews, essays, and analysis using our 100% Markdown editor.
                            </p>

                            {/* --- THE BLOG MOCKUP --- */}
                            <div className="pt-4">
                                <MockBlogCard />
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="flex-1 grid grid-cols-2 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                            {[
                                { label: 'Markdown', value: '100%' },
                                { label: 'Ads / Trackers', value: 'Zero' },
                                { label: 'Source Code', value: 'Open' },
                                { label: 'Membership', value: 'Free' },
                            ].map((stat, i) => (
                                <div key={i} className="p-10 bg-white dark:bg-zinc-950 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <div className="text-4xl font-black text-zinc-900 dark:text-zinc-100 mb-2">{stat.value}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- FOOTER --- */}
                <footer className="py-32 px-6 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-center">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="w-16 h-16 bg-zinc-900 dark:bg-zinc-100 rounded-2xl mx-auto flex items-center justify-center shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
                            <span className="text-white dark:text-zinc-900 font-bold text-xl tracking-tighter">DW</span>
                        </div>

                        <div>
                            <h2 className={`${dmSerif.className} text-6xl md:text-7xl mb-6 text-zinc-900 dark:text-zinc-100`}>Start Your Weave.</h2>
                            <p className="text-zinc-500 text-lg font-light max-w-md mx-auto">
                                Join the new standard for cinematic logging.
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <Link href="/auth/sign-up" className="w-full md:w-auto px-10 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-bold uppercase tracking-widest hover:shadow-xl hover:-translate-y-1 transition-all rounded-lg">
                                Create Account
                            </Link>
                            <Link href="/discover" className="w-full md:w-auto px-10 py-4 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors rounded-lg">
                                Live Demo
                            </Link>
                        </div>

                        <div className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-zinc-500 font-bold uppercase tracking-widest text-left md:text-center border-t border-zinc-200 dark:border-zinc-800 mt-20">
                            <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Twitter</Link>
                            <Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">GitHub</Link>
                            <Link href="/policies/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100">Privacy</Link>
                            <Link href="/policies/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100">Terms</Link>
                        </div>
                        <div className="text-center text-[10px] text-zinc-400 mt-8">
                            © 2026 DeeperWeave Inc. All rights reserved.
                        </div>
                    </div>
                </footer>

            </main>
        </div>
    );
}