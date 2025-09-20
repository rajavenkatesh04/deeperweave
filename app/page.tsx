"use client";

import { useRef } from 'react';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import Link from "next/link";
import {
    Cog6ToothIcon,
    ChatBubbleOvalLeftIcon,
    UserGroupIcon,
    PencilSquareIcon,
    FilmIcon,
    AcademicCapIcon,
    TicketIcon,
    UsersIcon,
    ShareIcon,
    PhotoIcon,
} from "@heroicons/react/24/outline";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Navbar from "@/app/ui/Navbar";

gsap.registerPlugin(ScrollTrigger);


export default function Home() {
    const main = useRef(null);

    useGSAP(() => {
        const heroTl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.2 } });
        heroTl
            .from(".hero-h1", { opacity: 0, y: 50, skewX: -10, stagger: 0.2 })
            .from(".unleashed-text-reveal", { y: "110%", duration: 1, ease: "power4.inOut" }, "-=1")
            .from(".hero-p", { opacity: 0, y: 30 }, "-=0.8")
            .from(".hero-button", { opacity: 0, scale: 0.8 }, "<")
            .from(".mockup-post", { opacity: 0, x: -50, rotation: -10 }, "-=1")
            .from(".mockup-profile", { opacity: 0, x: 50, rotation: 10 }, "<");

        gsap.to(".mockup-container", {
            scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 1 },
            yPercent: -15, ease: "none",
        });

    }, { scope: main });

    return (
        <div ref={main} className="flex min-h-screen flex-col bg-white text-gray-800 dark:bg-zinc-950 dark:text-zinc-200">
            <Navbar />
            <main>
                {/* ========== HERO SECTION ========== */}
                <section className="hero-section relative flex min-h-screen items-center overflow-hidden pt-32 pb-20 md:pt-24">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-blue-50 to-emerald-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/20" />
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                            <div className="text-center lg:text-left">
                                <h1 className={`${PlayWriteNewZealandFont.className} hero-h1 text-4xl md:text-5xl`}>
                                    Your Movie Journal,
                                    <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent"> Reimagined</span>.
                                </h1>
                                <div className="mt-2 overflow-hidden">
                                    <h2 className="unleashed-text-reveal bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-6xl font-bold text-transparent md:text-8xl">
                                        Unleashed.
                                    </h2>
                                </div>
                                <p className="hero-p mx-auto mt-6 max-w-lg text-lg text-gray-600 dark:text-zinc-400 lg:mx-0">
                                    Stop just watching movies. Start a conversation. Liv is your personal film diary and a social platform to share reviews, discover hidden gems, and connect with a community of cinephiles.
                                </p>
                                <div className="hero-button mt-8">
                                    <Link
                                        href="/auth/sign-up"
                                        className="inline-block rounded-md bg-gradient-to-r from-blue-600 to-emerald-500 px-8 py-3 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-xl"
                                    >
                                        Get Started for Free
                                    </Link>
                                </div>
                            </div>
                            <div className="mockup-container relative h-[450px] lg:h-[600px]">
                                <div className="mockup-post absolute left-0 top-1/2 w-[70%] max-w-lg -translate-y-1/2 rotate-[-8deg] origin-bottom-left rounded-xl bg-white p-2 shadow-2xl dark:bg-zinc-900">
                                    <div className="h-4 w-full rounded-t-lg bg-gray-100 dark:bg-zinc-800 flex items-center px-2 gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="p-3 space-y-3"><div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-zinc-800"></div><div className="h-20 w-full rounded bg-gray-200 dark:bg-zinc-800"></div><div className="h-10 w-full rounded bg-gray-200 dark:bg-zinc-800"></div></div>
                                </div>
                                <div className="mockup-profile absolute right-0 top-1/2 w-[45%] max-w-xs -translate-y-1/2 translate-x-4 rotate-[8deg] origin-bottom-right rounded-2xl border-4 border-gray-800 bg-white p-1.5 shadow-2xl dark:border-gray-600 dark:bg-black">
                                    <div className="h-[280px] space-y-2 overflow-hidden rounded-lg bg-slate-50 p-2 dark:bg-zinc-900">
                                        <div className="flex items-center gap-2"><div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800"></div><div className="h-5 w-1/2 rounded-md bg-slate-200 dark:bg-zinc-800"></div></div>
                                        <div className="h-20 w-full rounded-lg bg-slate-200 dark:bg-zinc-800/50"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== "THE PROBLEM" SECTION ========== */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold md:text-4xl">Your Movie Opinions Deserve a Better Home</h2>
                            <p className="mt-3 max-w-xl mx-auto text-gray-600 dark:text-zinc-400">Tired of your reviews getting lost in noisy social feeds?</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border border-gray-200 bg-white/50 p-6 text-center shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                    <PencilSquareIcon className="h-7 w-7 text-red-500 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold">Scattered Thoughts</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">Your reviews are spread across notes apps, social media, and forgotten forums.</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white/50 p-6 text-center shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                    <ChatBubbleOvalLeftIcon className="h-7 w-7 text-red-500 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold">Shallow Discussions</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">Generic rating systems and character limits don&apos;t capture your real thoughts.</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white/50 p-6 text-center shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                    <UserGroupIcon className="h-7 w-7 text-red-500 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold">No Community</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">It&apos;s hard to find and connect with others who share your specific taste in film.</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white/50 p-6 text-center shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                    <Cog6ToothIcon className="h-7 w-7 text-red-500 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold">Cluttered Interfaces</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">Other platforms are bloated with features you don&apos;t need, getting in the way of writing.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== "HOW IT WORKS" SECTION ========== */}
                <section className="py-20 bg-slate-50 dark:bg-zinc-900">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="text-3xl font-bold md:text-4xl">From Watchlist to Review in 3 Steps</h2>
                            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600 dark:text-zinc-400">Bring your opinions to life and share them with the world, effortlessly.</p>
                        </div>
                        <div className="relative mx-auto max-w-2xl">
                            <div className="absolute left-8 top-8 h-full w-0.5 bg-gray-200 dark:bg-zinc-800" aria-hidden="true"></div>
                            <div className="relative space-y-16">
                                <div className="relative flex items-start gap-8">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-md dark:bg-zinc-800 ring-8 ring-slate-50 dark:ring-zinc-900">
                                        <PencilSquareIcon className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold uppercase text-blue-500">Step 1</span>
                                        <h3 className="mt-1 text-2xl font-bold">Write Your Review</h3>
                                        <p className="mt-2 text-gray-600 dark:text-zinc-400">Use our clean, rich-text editor to craft your review. Link to any movie from our massive database.</p>
                                    </div>
                                </div>
                                <div className="relative flex items-start gap-8">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-md dark:bg-zinc-800 ring-8 ring-slate-50 dark:ring-zinc-900">
                                        <PhotoIcon className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold uppercase text-blue-500">Step 2</span>
                                        <h3 className="mt-1 text-2xl font-bold">Customize Your Post</h3>
                                        <p className="mt-2 text-gray-600 dark:text-zinc-400">Add a beautiful banner image and link your review directly to the official movie page for context.</p>
                                    </div>
                                </div>
                                <div className="relative flex items-start gap-8">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-md dark:bg-zinc-800 ring-8 ring-slate-50 dark:ring-zinc-900">
                                        <ShareIcon className="h-8 w-8 text-blue-500" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold uppercase text-blue-500">Step 3</span>
                                        <h3 className="mt-1 text-2xl font-bold">Share & Connect</h3>
                                        <p className="mt-2 text-gray-600 dark:text-zinc-400">Publish your post and share it with your followers. Spark discussions with likes and comments.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== "WHO IS IT FOR?" SECTION ========== */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold md:text-4xl">For Every Kind of Film Fan</h2>
                            <p className="mt-3 max-w-xl mx-auto text-gray-600 dark:text-zinc-400">Whether you log every movie you watch or only write about the classics, Liv is for you.</p>
                        </div>
                        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-4 rounded-full border border-gray-200 bg-white/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                                <TicketIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                                <h3 className="text-lg font-semibold">The Casual Viewer</h3>
                            </div>
                            <div className="flex items-center gap-4 rounded-full border border-gray-200 bg-white/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                                <AcademicCapIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                                <h3 className="text-lg font-semibold">The Aspiring Critic</h3>
                            </div>
                            <div className="flex items-center gap-4 rounded-full border border-gray-200 bg-white/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                                <FilmIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                                <h3 className="text-lg font-semibold">The Film Buff</h3>
                            </div>
                            <div className="flex items-center gap-4 rounded-full border border-gray-200 bg-white/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                                <UsersIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                                <h3 className="text-lg font-semibold">The Friend Group</h3>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== FEATURES SECTION ========== */}
                <section className="py-20 bg-slate-100 dark:bg-zinc-900">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2 className="text-5xl md:text-6xl"><span className={`${PlayWriteNewZealandFont.className} bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent`}>Everything</span> You Need.</h2>
                            <h3 className="text-3xl font-bold md:text-4xl">Nothing You Don&apos;t.</h3>
                            <p className="mt-4 max-w-xl mx-auto text-gray-600 dark:text-zinc-400 sm:text-lg">Focus on your passion for film, not on fighting with the platform.</p>
                        </div>
                        <div className="mx-auto mt-16 grid max-w-5xl items-stretch justify-center gap-8 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                                <PencilSquareIcon className="h-12 w-12 text-gray-600 dark:text-gray-400"/>
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">Rich Movie Blogging</h3>
                                <p className="text-sm text-gray-600 dark:text-zinc-400 flex-grow">A beautiful, minimalist editor that lets you focus on writing. Format your thoughts and create in-depth reviews.</p>
                            </div>
                            <div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                                <UserGroupIcon className="h-12 w-12 text-gray-600 dark:text-gray-400"/>
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">Social Connections</h3>
                                <p className="text-sm text-gray-600 dark:text-zinc-400 flex-grow">Follow your favorite critics, build your own following, and get notified about new posts and interactions.</p>
                            </div>
                            <div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                                <FilmIcon className="h-12 w-12 text-gray-600 dark:text-gray-400" />
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">TMDB Integration</h3>
                                <p className="text-sm text-gray-600 dark:text-zinc-400 flex-grow">Link your reviews to any movie in The Movie Database. Pull in posters, release dates, and cast info automatically.</p>
                            </div>
                            <div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                                <ChatBubbleOvalLeftIcon className="h-12 w-12 text-gray-600 dark:text-gray-400" />
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">Likes & Comments</h3>
                                <p className="text-sm text-gray-600 dark:text-zinc-400 flex-grow">Engage in discussions directly on review pages. Like your favorite posts and share your take in the comments.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== FINAL CTA SECTION ========== */}
                <section className="py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-5xl font-bold text-black/80 dark:text-white/80 md:text-6xl">Ready to <span className={`bg-gradient-to-r from-teal-300 to-amber-600 bg-clip-text text-transparent ${PlayWriteNewZealandFont.className}`}>Share</span> Your Voice?</h2>
                        <p className="mx-auto my-6 max-w-2xl text-center tracking-wide text-gray-600 dark:text-zinc-400 sm:text-xl">
                            Join thousands of film lovers who are sharing their passion for cinema. Create your first review for free, no credit card required.
                        </p>
                        <div>
                            <Link
                                href="/auth/sign-up"
                                className="inline-block rounded-md bg-gradient-to-r from-teal-300 to-amber-600 px-8 py-3 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-xl"
                            >
                                Start Writing
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* ========== FOOTER ========== */}
            <footer className="border-t border-t-gray-200/50 bg-white dark:border-t-zinc-800/50 dark:bg-zinc-950">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-600 dark:text-zinc-400">
                            &copy; 2025 Liv. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <Link href="/policies/terms" className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100">Terms of Service</Link>
                            <Link href="/policies/privacy" className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100">Privacy Policy</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}