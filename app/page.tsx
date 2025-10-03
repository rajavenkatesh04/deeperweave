"use client";

import { useRef } from 'react';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import Link from "next/link";
import Image from "next/image";
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
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-amber-50 to-orange-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-orange-950/20" />
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                            <div className="text-center lg:text-left">
                                <h1 className={`${PlayWriteNewZealandFont.className} hero-h1 text-4xl md:text-5xl`}>
                                    Beyond the Surface.
                                </h1>
                                <div className="mt-2 overflow-hidden">
                                    <h2 className="unleashed-text-reveal bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-6xl font-bold text-transparent md:text-8xl">
                                        Unravel the Story.
                                    </h2>
                                </div>
                                <p className="hero-p mx-auto mt-6 max-w-lg text-lg text-gray-600 dark:text-zinc-400 lg:mx-0">
                                    Great films are more than just stories; they&apos;re intricate tapestries. **Deeper Weave** is your journal and toolkit to unravel the threads of cinema—the hidden patterns, the masterful shots, and the narrative structures that create movie magic.
                                </p>
                                <div className="hero-button mt-8">
                                    <Link
                                        href="/auth/sign-up"
                                        className="inline-block rounded-md bg-gradient-to-r from-amber-600 to-orange-500 px-8 py-3 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-xl"
                                    >
                                        Start Weaving
                                    </Link>
                                </div>
                            </div>
                            {/* ✨ UPDATE: Increased image sizes for more impact */}
                            <div className="mockup-container relative h-[500px] lg:h-[650px]">
                                <div className="mockup-post absolute left-0 top-1/2 w-[80%] max-w-xl -translate-y-1/2 rotate-[-8deg] origin-bottom-left rounded-xl bg-white p-1 shadow-2xl dark:bg-zinc-900">
                                    {/* ✨ UPDATE: Added vignette effect wrapper */}
                                    <div className="relative overflow-hidden rounded-lg">
                                        <Image src="/blog-post.png" alt="Screenshot of a blog post on Deeper Weave" width={800} height={500} className="object-cover" />
                                        <div className="absolute inset-0 rounded-lg pointer-events-none [box-shadow:inset_0_0_80px_30px_rgba(0,0,0,0.5)] dark:[box-shadow:inset_0_0_100px_40px_rgba(0,0,0,0.8)]"></div>
                                    </div>
                                </div>
                                <div className="mockup-profile absolute right-0 top-1/2 w-[55%] max-w-sm -translate-y-1/2 translate-x-4 rotate-[8deg] origin-bottom-right rounded-2xl border-4 border-gray-800 bg-white p-1 shadow-2xl dark:border-gray-600 dark:bg-black">
                                    {/* ✨ UPDATE: Added vignette effect wrapper */}
                                    <div className="relative overflow-hidden rounded-lg">
                                        <Image src="/timeline.png" alt="Screenshot of a user&apos;s timeline on Deeper Weave" width={400} height={600} className="object-cover" />
                                        <div className="absolute inset-0 rounded-lg pointer-events-none [box-shadow:inset_0_0_60px_20px_rgba(0,0,0,0.4)] dark:[box-shadow:inset_0_0_80px_30px_rgba(0,0,0,0.8)]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== "THE PROBLEM" SECTION (No changes needed here) ========== */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold md:text-4xl">Your Insights Deserve a Deeper Home</h2>
                            <p className="mt-3 max-w-xl mx-auto text-gray-600 dark:text-zinc-400">Tired of your analysis getting lost in noisy social feeds?</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border border-gray-200 bg-white/50 p-6 text-center shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30"><PencilSquareIcon className="h-7 w-7 text-orange-500 dark:text-orange-400" /></div><h3 className="text-lg font-semibold">Fleeting Insights</h3><p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">Your analysis is spread across notes apps, social media, and forgotten forums.</p></div>
                            <div className="rounded-lg border border-gray-200 bg-white/50 p-6 text-center shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30"><ChatBubbleOvalLeftIcon className="h-7 w-7 text-orange-500 dark:text-orange-400" /></div><h3 className="text-lg font-semibold">Surface-Level Takes</h3><p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">Generic rating systems and character limits don&apos;t capture your real analysis.</p></div>
                            <div className="rounded-lg border border-gray-200 bg-white/50 p-6 text-center shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30"><UserGroupIcon className="h-7 w-7 text-orange-500 dark:text-orange-400" /></div><h3 className="text-lg font-semibold">Isolated Analysis</h3><p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">It&apos;s hard to find and connect with others who appreciate the craft of filmmaking.</p></div>
                            <div className="rounded-lg border border-gray-200 bg-white/50 p-6 text-center shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30"><Cog6ToothIcon className="h-7 w-7 text-orange-500 dark:text-orange-400" /></div><h3 className="text-lg font-semibold">Distracting Noise</h3><p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">Other platforms are bloated with features you don&apos;t need, getting in the way of true analysis.</p></div>
                        </div>
                    </div>
                </section>

                {/* ========== "HOW IT WORKS" SECTION ========== */}
                {/* ✨ UPDATE: Major restructure to showcase large images */}
                <section className="py-20 bg-slate-50 dark:bg-zinc-900 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="text-3xl font-bold md:text-4xl">From Impression to Insight</h2>
                            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600 dark:text-zinc-400">A simple, powerful workflow to bring your analysis to life.</p>
                        </div>
                        <div className="space-y-24">
                            {/* Step 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
                                <div className="text-center md:text-left">
                                    <div className="flex justify-center md:justify-start items-center gap-4 mb-4">
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-md dark:bg-zinc-800">
                                            <PencilSquareIcon className="h-8 w-8 text-amber-500" />
                                        </div>
                                        <span className="text-sm font-semibold uppercase text-amber-500">Step 1</span>
                                    </div>
                                    <h3 className="mt-1 text-3xl font-bold">Weave Your Narrative</h3>
                                    <p className="mt-4 text-gray-600 dark:text-zinc-400">Our clean, rich-text editor is your canvas. Craft your analysis, format your thoughts, and link to any movie from our massive database without ever leaving your creative flow.</p>
                                </div>
                                <div className="relative rounded-xl bg-white p-1.5 shadow-2xl dark:bg-zinc-800 -rotate-2">
                                    <div className="relative overflow-hidden rounded-lg">
                                        <Image src="/blog-form.png" alt="Screenshot of the blog post creation form" width={1000} height={600} className="object-cover"/>
                                        <div className="absolute inset-0 rounded-lg pointer-events-none [box-shadow:inset_0_0_80px_30px_rgba(0,0,0,0.5)] dark:[box-shadow:inset_0_0_100px_40px_rgba(0,0,0,0.8)]"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Step 2 & 3 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
                                <div className="relative rounded-xl bg-white p-1.5 shadow-2xl dark:bg-zinc-800 rotate-2 md:order-last">
                                    {/* Placeholder for an image showing post customization */}
                                    <div className="relative overflow-hidden rounded-lg">
                                        <Image src="/post-customization.png" alt="Screenshot showing post customization" width={1000} height={600} className="bg-gray-200 dark:bg-zinc-800 object-cover"/>
                                        <div className="absolute inset-0 rounded-lg pointer-events-none [box-shadow:inset_0_0_80px_30px_rgba(0,0,0,0.5)] dark:[box-shadow:inset_0_0_100px_40px_rgba(0,0,0,0.8)]"></div>
                                    </div>
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="flex justify-center md:justify-start items-center gap-4 mb-4">
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-md dark:bg-zinc-800">
                                            <PhotoIcon className="h-8 w-8 text-amber-500" />
                                        </div>
                                        <span className="text-sm font-semibold uppercase text-amber-500">Step 2</span>
                                    </div>
                                    <h3 className="mt-1 text-3xl font-bold">Illustrate & Share</h3>
                                    <p className="mt-4 text-gray-600 dark:text-zinc-400">Add a beautiful banner, tag your post with relevant topics, and publish. Your analysis is now a shareable tapestry, ready for an audience that appreciates depth.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== "WHO IS IT FOR?" SECTION (No changes needed here) ========== */}
                <section className="py-20"><div className="container mx-auto px-4"><div className="mb-12 text-center"><h2 className="text-3xl font-bold md:text-4xl">For the Discerning Cinephile</h2><p className="mt-3 max-w-xl mx-auto text-gray-600 dark:text-zinc-400">Whether you log every movie you watch or only write about the classics, Deeper Weave is for you.</p></div><div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2"><div className="flex items-center gap-4 rounded-full border border-gray-200 bg-white/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"><TicketIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" /><h3 className="text-lg font-semibold">The Curious Watcher</h3></div><div className="flex items-center gap-4 rounded-full border border-gray-200 bg-white/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"><AcademicCapIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" /><h3 className="text-lg font-semibold">The Aspiring Critic</h3></div><div className="flex items-center gap-4 rounded-full border border-gray-200 bg-white/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"><FilmIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" /><h3 className="text-lg font-semibold">The Story Analyst</h3></div><div className="flex items-center gap-4 rounded-full border border-gray-200 bg-white/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"><UsersIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" /><h3 className="text-lg font-semibold">The Film Club</h3></div></div></div></section>

                {/* ========== FEATURES SECTION (No changes needed here) ========== */}
                <section className="py-20 bg-slate-100 dark:bg-zinc-900"><div className="container mx-auto px-4"><div className="mb-12 text-center"><h2 className="text-5xl md:text-6xl"><span className={`${PlayWriteNewZealandFont.className} bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent`}>Everything</span> You Need.</h2><h3 className="text-3xl font-bold md:text-4xl">Nothing You Don&apos;t.</h3><p className="mt-4 max-w-xl mx-auto text-gray-600 dark:text-zinc-400 sm:text-lg">Focus on your passion for film, not on fighting with the platform.</p></div><div className="mx-auto mt-16 grid max-w-5xl items-stretch justify-center gap-8 md:grid-cols-2 lg:grid-cols-4"><div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"><PencilSquareIcon className="h-12 w-12 text-gray-600 dark:text-gray-400"/><h3 className="text-xl font-semibold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">In-Depth Analysis</h3><p className="text-sm text-gray-600 dark:text-zinc-400 flex-grow">A beautiful, minimalist editor that lets you focus on writing. Format your thoughts and create detailed analyses.</p></div><div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"><UserGroupIcon className="h-12 w-12 text-gray-600 dark:text-gray-400"/><h3 className="text-xl font-semibold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">Cinephile Connections</h3><p className="text-sm text-gray-600 dark:text-zinc-400 flex-grow">Follow your favorite critics, build your own following, and get notified about new posts and interactions.</p></div><div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"><FilmIcon className="h-12 w-12 text-gray-600 dark:text-gray-400" /><h3 className="text-xl font-semibold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">Vast Film Database</h3><p className="text-sm text-gray-600 dark:text-zinc-400 flex-grow">Link your reviews to any movie in The Movie Database. Pull in posters, release dates, and cast info automatically.</p></div><div className="flex h-full flex-col items-center justify-start space-y-3 rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"><ChatBubbleOvalLeftIcon className="h-12 w-12 text-gray-600 dark:text-gray-400" /><h3 className="text-xl font-semibold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">Thoughtful Discussions</h3><p className="text-sm text-gray-600 dark:text-zinc-400 flex-grow">Engage in discussions directly on analysis pages. Like your favorite posts and share your take in the comments.</p></div></div></div></section>

                {/* ========== FINAL CTA SECTION (No changes needed here) ========== */}
                <section className="py-20"><div className="container mx-auto px-4 text-center"><h2 className="text-5xl font-bold text-black/80 dark:text-white/80 md:text-6xl">Ready to <span className={`bg-gradient-to-r from-amber-500 to-orange-700 bg-clip-text text-transparent ${PlayWriteNewZealandFont.className}`}>Unravel</span> the Story?</h2><p className="mx-auto my-6 max-w-2xl text-center tracking-wide text-gray-600 dark:text-zinc-400 sm:text-xl">Join a new generation of critics and film lovers sharing their passion for the craft of cinema. Create your first analysis for free.</p><div><Link href="/auth/sign-up" className="inline-block rounded-md bg-gradient-to-r from-amber-500 to-orange-700 px-8 py-3 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:opacity-90 hover:shadow-xl">Begin Your Analysis</Link></div></div></section>
            </main>

            {/* ========== FOOTER (No changes needed here) ========== */}
            <footer className="border-t border-t-gray-200/50 bg-white dark:border-t-zinc-800/50 dark:bg-zinc-950"><div className="container mx-auto px-4 py-6"><div className="flex flex-col md:flex-row justify-between items-center gap-4"><p className="text-sm text-gray-600 dark:text-zinc-400">&copy; 2025 Deeper Weave. All rights reserved.</p><div className="flex gap-6 text-sm"><Link href="/policies/terms" className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100">Terms of Service</Link><Link href="/policies/privacy" className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100">Privacy Policy</Link></div></div></div></footer>
        </div>
    );
}