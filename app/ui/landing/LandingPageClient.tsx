'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import {
    StarIcon, MagnifyingGlassIcon,
    ArrowRightIcon, ChartBarIcon,
    ListBulletIcon, PencilSquareIcon,
    ClockIcon, FireIcon
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { dmSerif, geistSans } from "@/app/ui/fonts";

// --- TYPES ---
interface LandingPageClientProps {
    heroPosters: string[];
    heroItems?: any[];
    searchDemoItems?: any[];
    bentoItems?: any;
}

// --- UTILS ---
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

// --- MOCK COMPONENTS (Preserved but Styled) ---

const MockTimelineRow = ({ date, title, rating, img }: { date: string, title: string, rating: number, img: string }) => (
    <div className="flex items-center gap-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 group">
        <div className="flex flex-col items-center w-10 shrink-0 opacity-60">
            <span className="text-[10px] font-bold uppercase tracking-wider">{date.split(' ')[0]}</span>
            <span className="text-lg font-bold leading-none">{date.split(' ')[1]}</span>
        </div>
        <div className="relative w-10 h-14 bg-zinc-200 dark:bg-zinc-800 shrink-0 shadow-sm">
            <Image
                src={`https://image.tmdb.org/t/p/w200${img}`}
                alt={title}
                fill
                className="object-cover"
            />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold truncate">{title}</h4>
            <div className="flex gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`w-3 h-3 ${i < rating ? 'opacity-100' : 'opacity-20 text-zinc-400'}`} />
                ))}
            </div>
        </div>
    </div>
);

const MockListCard = () => (
    <div className="w-full h-full flex flex-col justify-between">
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className={`${dmSerif.className} text-2xl`}>Neon Noir</h3>
                <span className="text-[10px] border border-zinc-300 dark:border-zinc-700 px-2 py-0.5 uppercase tracking-wider font-bold">Public</span>
            </div>
            <div className="space-y-3">
                {[
                    { r: '01', t: 'Blade Runner 2049', y: '2017' },
                    { r: '02', t: 'Akira', y: '1988' },
                    { r: '03', t: 'Drive', y: '2011' },
                    { r: '04', t: 'Nightcrawler', y: '2014' },
                ].map((item) => (
                    <div key={item.r} className="flex items-center gap-4 group cursor-pointer">
                        <span className="text-sm font-mono text-zinc-400 font-bold">{item.r}</span>
                        <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600 transition-colors" />
                        <p className="text-sm font-medium whitespace-nowrap">{item.t}</p>
                    </div>
                ))}
            </div>
        </div>
        <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-6 h-6 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full" />
            <span>Curated by <strong>Alex</strong></span>
        </div>
    </div>
);

// --- SEARCH COMPONENT (Improved Layout) ---
const MinimalSearch = () => {
    const [text, setText] = useState("");
    const [focused, setFocused] = useState(false);

    // Auto-type effect only runs once on mount
    useEffect(() => {
        const fullText = "Interstellar";
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full max-w-md z-30">
            <div
                className={cn(
                    "flex items-center bg-white dark:bg-black border h-14 px-4 shadow-sm transition-all duration-200",
                    focused ? "border-zinc-900 ring-1 ring-zinc-900 dark:border-zinc-100 dark:ring-zinc-100" : "border-zinc-300 dark:border-zinc-700"
                )}
            >
                <MagnifyingGlassIcon className="w-5 h-5 text-zinc-400" />
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="ml-3 w-full bg-transparent outline-none font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                    placeholder="Search movies..."
                />
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded-sm">⌘K</span>
                </div>
            </div>

            {/* Result Dropdown */}
            <AnimatePresence>
                {text.length > 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-16 left-0 right-0 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden"
                    >
                        <div className="flex gap-4 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer group">
                            <div className="w-12 aspect-[2/3] bg-zinc-200 relative shrink-0">
                                {/* Fixed Image Src Logic */}
                                <Image src="https://image.tmdb.org/t/p/w200/gEU2QniL6qFjqlvuymbaT47TlZL.jpg" alt="Interstellar" fill className="object-cover" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:underline">Interstellar</span>
                                <span className="text-xs text-zinc-500 font-mono mt-1">2014 • Christopher Nolan</span>
                                <div className="flex items-center gap-1 mt-2">
                                    <StarIcon className="w-3 h-3 text-amber-500" />
                                    <span className="text-xs font-bold">8.4</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function LandingPageClient({ heroPosters }: LandingPageClientProps) {
    return (
        <div className={`min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 ${geistSans.className}`}>

            {/* Background Grid Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white dark:from-black dark:via-transparent dark:to-black"></div>
            </div>

            {/* --- NAV --- */}
            <nav className="fixed top-0 z-50 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-xl">
                        <div className="w-5 h-5 bg-zinc-900 dark:bg-white rounded-none" />
                        <span>DeeperWeave</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        <Link href="/discover" className="hover:text-black dark:hover:text-white transition-colors">Discover</Link>
                        <Link href="/auth/login" className="hover:text-black dark:hover:text-white transition-colors">Log In</Link>
                        <Link href="/auth/sign-up" className="bg-zinc-900 dark:bg-white text-white dark:text-black px-5 py-2 hover:opacity-90 transition-opacity font-bold rounded-sm">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 pt-24 px-6 max-w-7xl mx-auto">

                {/* --- NEW HERO: Split Layout --- */}
                <section className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[70vh] mb-24">

                    {/* Left: Content */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">v2.0 Now Live</span>
                        </div>

                        <h1 className={`${dmSerif.className} text-6xl md:text-7xl lg:text-8xl leading-[0.9] text-zinc-900 dark:text-white`}>
                            Track what <br /> you watch.
                        </h1>

                        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
                            The minimal diary for film lovers. Keep a log of every movie, show, and anime. Rate them, list them, review them.
                        </p>

                        <div className="w-full pt-4 flex flex-col items-center lg:items-start">
                            <MinimalSearch />
                            <p className="text-xs text-zinc-400 mt-4">Try searching for "Interstellar" or "The Bear"</p>
                        </div>
                    </div>

                    {/* Right: Visual Wall (Responsive) */}
                    <div className="relative h-[400px] lg:h-[600px] w-full hidden md:block overflow-hidden mask-linear-fade-bottom">
                        {/* A masonry layout of posters */}
                        <div className="grid grid-cols-3 gap-4 rotate-[-6deg] scale-110 translate-x-10 opacity-80 hover:opacity-100 transition-opacity duration-700">
                            {[...heroPosters, ...heroPosters].slice(0, 9).map((src, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`relative aspect-[2/3] bg-zinc-100 shadow-lg ${i % 2 === 0 ? 'translate-y-8' : ''}`}
                                >
                                    <Image src={`https://image.tmdb.org/t/p/w300${src}`} alt="" fill className="object-cover" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* --- FEATURES: Sharp Bento Grid --- */}
                <section className="pb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">

                        {/* CARD 1: HISTORY (Tall) */}
                        <div className="row-span-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col rounded-sm hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
                            <div className="flex items-center gap-2 mb-6 text-zinc-500">
                                <ClockIcon className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Your Timeline</span>
                            </div>
                            <h2 className={`${dmSerif.className} text-3xl mb-4`}>History</h2>
                            <p className="text-zinc-500 mb-8 text-sm">Every movie, TV show, and anime you've ever watched, in one scannable list.</p>

                            <div className="flex-1 overflow-hidden relative mask-linear-fade-bottom">
                                <div className="space-y-0">
                                    <MockTimelineRow date="OCT 31" title="Toy Story" rating={5} img="/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg" />
                                    <MockTimelineRow date="OCT 28" title="The Substance" rating={4} img="/lqoMzCcZYEFK729d6qzt349fB4o.jpg" />
                                    <MockTimelineRow date="OCT 24" title="Alien: Romulus" rating={3} img="/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg" />
                                    <MockTimelineRow date="OCT 20" title="Dune: Part Two" rating={5} img="/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg" />
                                    <MockTimelineRow date="OCT 15" title="The Bear" rating={5} img="/n1AtC6s8Bf2Y5N7gD5c9Y6G5w6.jpg" />
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: LISTS (Square) */}
                        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col rounded-sm hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
                            <div className="flex items-center gap-2 mb-4 text-zinc-500">
                                <ListBulletIcon className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Collections</span>
                            </div>
                            <MockListCard />
                        </div>

                        {/* CARD 3: STATS (Square) */}
                        <div className="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-black border border-zinc-900 dark:border-zinc-100 p-6 flex flex-col justify-between rounded-sm">
                            <div>
                                <div className="flex items-center gap-2 mb-4 opacity-70">
                                    <ChartBarIcon className="w-5 h-5" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Insights</span>
                                </div>
                                <h3 className={`${dmSerif.className} text-3xl`}>Data, not clutter.</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div>
                                    <p className="text-4xl font-bold font-mono">1,240</p>
                                    <p className="text-[10px] uppercase opacity-60 mt-1">Hours Watched</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-bold font-mono">12</p>
                                    <p className="text-[10px] uppercase opacity-60 mt-1">This Month</p>
                                </div>
                            </div>
                        </div>

                        {/* CARD 4: REVIEWS (Wide) */}
                        <div className="md:col-span-2 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-center rounded-sm relative overflow-hidden group">
                            <div className="relative z-10 max-w-lg">
                                <div className="flex items-center gap-2 mb-4 text-amber-500">
                                    <PencilSquareIcon className="w-5 h-5" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Journal</span>
                                </div>
                                <h3 className={`${dmSerif.className} text-3xl md:text-4xl mb-4`}>Write Reviews.</h3>
                                <p className="text-zinc-600 dark:text-zinc-300 text-lg leading-relaxed mb-6">
                                    "The cinematography in the final act was breathtaking. It reminded me why I fell in love with sci-fi in the first place."
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-300 overflow-hidden relative">
                                        <Image src="https://image.tmdb.org/t/p/w200/neMZH82Stu91d3iqvLdNQfqPPyl.jpg" alt="" fill className="object-cover" />
                                    </div>
                                    <span className="text-sm font-bold">Read full review of <em>Akira</em> <ArrowRightIcon className="w-3 h-3 inline ml-1" /></span>
                                </div>
                            </div>

                            {/* Abstract bg element */}
                            <div className="absolute top-0 right-0 w-64 h-full bg-zinc-200 dark:bg-zinc-800/50 skew-x-12 translate-x-20 group-hover:translate-x-16 transition-transform duration-700"></div>
                        </div>

                    </div>
                </section>

                {/* --- FOOTER --- */}
                <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <div className="font-bold text-lg mb-1">DeeperWeave</div>
                        <p className="text-xs text-zinc-500">© 2026. Simple cinema tracking.</p>
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        <Link href="/about" className="hover:text-black dark:hover:text-white">About</Link>
                        <Link href="/discover" className="hover:text-black dark:hover:text-white">Browse</Link>
                        <Link href="/policies" className="hover:text-black dark:hover:text-white">Policies</Link>
                    </div>
                </footer>

            </main>
        </div>
    );
}