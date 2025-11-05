'use client';

import { useRef, useState, useEffect } from 'react';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import Link from "next/link";
import Image from "next/image";
import {
    FilmIcon, TvIcon, SparklesIcon, HeartIcon,
    MagnifyingGlassIcon, UserGroupIcon, PencilSquareIcon,
    Bars3Icon, XMarkIcon, ArrowRightIcon, StarIcon, ChatBubbleLeftEllipsisIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

// --- Smoother Rotating Text ---
const RotatingText = () => {
    const words = ["Movies", "Anime", "TV Shows", "K-Dramas"];
    const [index, setIndex] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setIndex((prev) => (prev + 1) % words.length), 3000);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="inline-grid h-[1.2em] overflow-hidden align-bottom">
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={index}
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "-100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="col-start-1 row-start-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent"
                >
                    {words[index]}
                </motion.span>
            </AnimatePresence>
        </div>
    );
};

const MarqueeRow = ({ images, direction = 'left', speed = 50 }: { images: string[], direction?: 'left' | 'right', speed?: number }) => {
    const marqueeImages = [...images, ...images, ...images].slice(0, 30);
    return (
        <div className="flex overflow-hidden select-none gap-6 opacity-30 dark:opacity-20 mix-blend-overlay dark:mix-blend-screen pointer-events-none py-3">
            <motion.div
                className="flex flex-shrink-0 gap-6 min-w-full"
                initial={{ x: direction === 'left' ? 0 : '-100%' }}
                animate={{ x: direction === 'left' ? '-100%' : 0 }}
                transition={{ repeat: Infinity, ease: "linear", duration: speed }}
            >
                {marqueeImages.map((src, i) => (
                    <div key={i} className="relative h-80 w-56 flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-200 dark:bg-zinc-800 shadow-xl rotate-1">
                        <Image src={`https://image.tmdb.org/t/p/w342${src}`} alt="Poster" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out" />
                    </div>
                ))}
            </motion.div>
            <motion.div
                className="flex flex-shrink-0 gap-6 min-w-full"
                initial={{ x: direction === 'left' ? 0 : '-100%' }}
                animate={{ x: direction === 'left' ? '-100%' : 0 }}
                transition={{ repeat: Infinity, ease: "linear", duration: speed }}
            >
                {marqueeImages.map((src, i) => (
                    <div key={`dup-${i}`} className="relative h-80 w-56 flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-200 dark:bg-zinc-800 shadow-xl rotate-1">
                        <Image src={`https://image.tmdb.org/t/p/w342${src}`} alt="Poster" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out" />
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default function LandingPageClient({ posters }: { posters: string[] }) {
    const main = useRef(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { scrollYProgress } = useScroll();
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 300]);

    useGSAP(() => {
        const heroTl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });
        heroTl.from(".hero-content > *", { opacity: 0, y: 50, stagger: 0.2, duration: 1.5, clearProps: "all" });

        gsap.utils.toArray<HTMLElement>('.feature-block').forEach((section) => {
            gsap.from(section.querySelectorAll('.feature-text > *'), {
                scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none reverse" },
                opacity: 0, y: 40, stagger: 0.1, duration: 1, ease: "power3.out"
            });
            gsap.from(section.querySelector('.feature-visual'), {
                scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none reverse" },
                opacity: 0, scale: 0.95, duration: 1.2, ease: "power3.out"
            });
        });

        gsap.from(".bento-item", {
            scrollTrigger: { trigger: ".bento-grid", start: "top 85%" },
            scale: 0.9, opacity: 0, stagger: 0.1, duration: 0.8, ease: "back.out(1.4)"
        });
    }, { scope: main });

    return (
        <div ref={main} className="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-[#050505] dark:text-zinc-100 overflow-x-hidden selection:bg-orange-500/30">
            {/* NAVBAR */}
            <nav className="fixed top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl dark:border-white/5 dark:bg-[#050505]/80">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:rotate-12 transition-transform duration-500 ease-out" />
                        <span className={`${PlayWriteNewZealandFont.className} text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent`}>
                            Deeper Weave
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/discover" className="text-sm font-semibold text-gray-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">Discover</Link>
                        <Link href="/blog" className="text-sm font-semibold text-gray-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">Community</Link>
                        <div className="h-6 w-px bg-gray-200 dark:bg-zinc-800" />
                        <Link href="/auth/login" className="text-sm font-semibold hover:opacity-70 transition-opacity">Log in</Link>
                        <Link href="/auth/sign-up" className="group relative inline-flex h-10 items-center justify-center rounded-full bg-black dark:bg-white px-6 font-semibold text-sm text-white dark:text-black transition-all hover:scale-105 hover:shadow-xl active:scale-95">
                            <span className="relative z-10 flex items-center gap-1">
                                Sign Up Free <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    </div>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                        {mobileMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
                    </button>
                </div>
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
                            <div className="flex flex-col p-4 space-y-2">
                                <Link href="/discover" className="p-3 text-lg font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900">Discover</Link>
                                <Link href="/blog" className="p-3 text-lg font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900">Community</Link>
                                <hr className="dark:border-zinc-800 my-2"/>
                                <Link href="/auth/login" className="p-3 text-lg font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900">Log In</Link>
                                <Link href="/auth/sign-up" className="p-3 text-lg font-semibold text-center rounded-xl bg-orange-600 text-white">Sign Up Free</Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <main>
                {/* HERO SECTION */}
                <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                    <div className="absolute inset-0 -z-10 flex flex-col gap-8 justify-center py-20" style={{ transform: 'rotate(-6deg) scale(1.2) translateY(-5%)' }}>
                        <motion.div style={{ x: y1 }}><MarqueeRow images={posters} speed={120} direction="left" /></motion.div>
                        <motion.div style={{ x: y2 }}><MarqueeRow images={posters.reverse()} speed={150} direction="right" /></motion.div>
                        <motion.div style={{ x: y1 }}><MarqueeRow images={posters} speed={100} direction="left" /></motion.div>
                    </div>
                    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-white/90 to-white dark:from-[#050505] dark:via-[#050505]/90 dark:to-[#050505]" />
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,var(--tw-gradient-to)_100%)] from-white to-white dark:from-[#050505] dark:to-[#050505]" />

                    <div className="container relative z-10 mx-auto px-4 text-center hero-content">
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-5 py-2.5 backdrop-blur-xl mb-8">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                            </span>
                            <span className="text-sm font-semibold text-orange-700 dark:text-orange-400 tracking-wide uppercase">
                                The new home for all your entertainment
                            </span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-none">
                            Track your<br />
                            <RotatingText />
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                            One beautiful timeline for every movie, show, and anime you watch. Finally, a platform that gets your obsession.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                            <Link href="/auth/sign-up" className="group h-16 px-12 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xl flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300">
                                Start Your Diary <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/discover" className="h-16 px-12 rounded-full bg-white/50 dark:bg-zinc-900/50 text-black dark:text-white font-bold text-xl flex items-center justify-center border-2 border-gray-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 backdrop-blur-md transition-all duration-300">
                                Explore Catalog
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FEATURE 1: UNIFIED SEARCH DEMO */}
                <section className="feature-block py-32 relative overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div className="feature-text">
                                <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                                    If it exists, <br/>
                                    <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">you can log it.</span>
                                </h2>
                                <p className="text-xl text-gray-600 dark:text-zinc-400 mb-8 leading-relaxed">
                                    Powered by TMDB, our search is instant and unified. Movie, TV, Anime—it all just works. No more switching apps to find what you watched.
                                </p>
                            </div>
                            <div className="feature-visual relative">
                                <div className="w-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-200/50 dark:border-white/10 overflow-hidden p-4 rotate-2 hover:rotate-0 transition-transform duration-700">
                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-zinc-800 rounded-xl mb-4">
                                        <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
                                        <span className="text-gray-500 dark:text-zinc-500 text-lg">Search...</span>
                                    </div>
                                    <div className="space-y-2">
                                        {[{t:"One Piece",y:"1999",i:SparklesIcon,c:"text-pink-500",l:"TV"},{t:"Oppenheimer",y:"2023",i:FilmIcon,c:"text-blue-500",l:"Movie"},{t:"Breaking Bad",y:"2008",i:TvIcon,c:"text-green-500",l:"TV"}].map((item,i)=>(
                                            <motion.div key={i} initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} transition={{delay:i*0.3}} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
                                                <div className="h-14 w-10 bg-zinc-200 dark:bg-zinc-700 rounded-md"/>
                                                <div className="flex-1"><p className="font-bold">{item.t}</p><p className="text-sm text-gray-500">{item.y}</p></div>
                                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-white dark:bg-zinc-900 ${item.c}`}><item.i className="w-3 h-3"/> {item.l}</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURE 2: RICH LOGGING DEMO */}
                <section className="feature-block py-32 relative overflow-hidden bg-gray-50 dark:bg-zinc-900/50">
                    <div className="container mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div className="feature-visual order-2 lg:order-1 relative">
                                <div className="w-full max-w-md mx-auto bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-white/10 p-6 -rotate-2 hover:rotate-0 transition-transform duration-700">
                                    <div className="flex gap-4 mb-6">
                                        <div className="h-32 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl flex-shrink-0"/>
                                        <div>
                                            <h3 className="text-2xl font-bold mb-1">Dune: Part Two</h3>
                                            <p className="text-gray-500 mb-4">2024</p>
                                            <div className="flex gap-1">
                                                {[1,2,3,4].map(i=><StarIconSolid key={i} className="w-6 h-6 text-amber-400"/>)}
                                                <StarIconSolid className="w-6 h-6 text-zinc-200 dark:text-zinc-700"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <motion.div initial={{scale:0}} whileInView={{scale:1}} transition={{delay:0.5, type:"spring"}} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
                                            <UserGroupIcon className="w-4 h-4"/> with @sarah
                                        </motion.div>
                                        <motion.div initial={{scale:0}} whileInView={{scale:1}} transition={{delay:0.7, type:"spring"}} className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-bold ml-2">
                                            <SparklesIcon className="w-4 h-4"/> IMAX 70mm
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                            <div className="feature-text order-1 lg:order-2">
                                <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                                    More than just<br/>a star rating.
                                </h2>
                                <p className="text-xl text-gray-600 dark:text-zinc-400 mb-8 leading-relaxed">
                                    Log the details that matter. Who you watched with, where you watched it, and exactly how it made you feel.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURE 3: COMMUNITY DEMO */}
                <section className="feature-block py-32 relative overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div className="feature-text">
                                <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                                    Real discussions,<br/>real people.
                                </h2>
                                <p className="text-xl text-gray-600 dark:text-zinc-400 mb-8 leading-relaxed">
                                    No bots, no spam. Just genuine conversations with people who love what you love.
                                </p>
                            </div>
                            <div className="feature-visual relative">
                                <div className="w-full max-w-md mx-auto space-y-4">
                                    {[
                                        {u:"alex_99",t:"That ending completely broke me 😭",c:"bg-blue-50 dark:bg-blue-900/20"},
                                        {u:"movie_buff",t:"Unpopular opinion: Season 2 was better.",c:"bg-orange-50 dark:bg-orange-900/20"},
                                        {u:"otaku_king",t:"Wait, did anyone else notice this easter egg?",c:"bg-purple-50 dark:bg-purple-900/20"}
                                    ].map((c,i)=>(
                                        <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{delay:i*0.4}} className={`p-4 rounded-2xl ${c.c} border border-gray-100 dark:border-white/5 flex gap-3 items-start`}>
                                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex-shrink-0"/>
                                            <div><p className="font-bold text-sm mb-1">@{c.u}</p><p>{c.t}</p></div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* NICHE COMMUNITIES */}
                <section className="py-32 bg-black text-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-24">
                            <h2 className="text-5xl md:text-7xl font-bold mb-8">Find your people.</h2>
                            <p className="text-2xl text-zinc-400">
                                Every fandom gets first-class treatment.
                            </p>
                        </div>
                        <div className="bento-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: "Anime", icon: SparklesIcon, bg: "bg-pink-600", img: "/rCzpDGLbOoPwLjy3vpXmBZc9rpU.jpg" },
                                { title: "K-Drama", icon: HeartIcon, bg: "bg-red-600", img: "/reEMJA1uzscCbkpeRJeTT2bjqrl.jpg" },
                                { title: "Movies", icon: FilmIcon, bg: "bg-amber-600", img: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg" },
                                { title: "TV Shows", icon: TvIcon, bg: "bg-blue-600", img: "/ggFHVNu6YYI5L9pBasz8dBwpUOj.jpg" },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="bento-item group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer"
                                    whileHover={{ scale: 1.03 }}
                                >
                                    <Image src={`https://image.tmdb.org/t/p/w780${item.img}`} alt={item.title} fill className="object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-8">
                                        <div className={`inline-flex items-center gap-2 ${item.bg} px-4 py-1.5 rounded-full font-bold mb-4`}>
                                            <item.icon className="w-5 h-5" /> {item.title}
                                        </div>
                                        <h3 className="text-4xl font-bold">Explore <ArrowRightIcon className="inline-block w-8 h-8 -rotate-45 group-hover:rotate-0 transition-transform" /></h3>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="py-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-orange-600 dark:bg-orange-900">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                    </div>
                    <div className="container relative z-10 mx-auto px-6 text-center">
                        <h2 className="text-7xl md:text-9xl font-black text-white mb-12 tracking-tighter leading-none">
                            Start your<br />archive today.
                        </h2>
                        <Link href="/auth/sign-up" className="inline-flex h-20 px-16 items-center justify-center rounded-full bg-white text-black font-black text-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300">
                            Create Free Account
                        </Link>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="py-12 bg-white dark:bg-[#050505] text-center border-t border-gray-100 dark:border-zinc-900">
                <div className="flex items-center justify-center gap-3 mb-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600" />
                    <span className={`${PlayWriteNewZealandFont.className} text-2xl font-bold`}>Deeper Weave</span>
                </div>
                <p className="text-gray-400 dark:text-zinc-600 text-sm">© 2025 Deeper Weave.</p>
            </footer>
        </div>
    );
}