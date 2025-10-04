"use client";

import { useRef, useState } from 'react';
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
    PhotoIcon,
    Bars3Icon,
    XMarkIcon,
    ClockIcon,
    SparklesIcon,
    HeartIcon,
    BookmarkIcon,
} from "@heroicons/react/24/outline";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
    const main = useRef(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useGSAP(() => {
        const heroTl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.2 } });
        heroTl
            .from(".hero-badge", { opacity: 0, y: -20, duration: 0.8 })
            .from(".hero-h1", { opacity: 0, y: 60, duration: 1 }, "-=0.4")
            .from(".hero-p", { opacity: 0, y: 30, duration: 0.8 }, "-=0.6")
            .from(".hero-buttons", { opacity: 0, y: 30, duration: 0.8 }, "-=0.4")
            .from(".hero-image-main", { opacity: 0, scale: 0.95, duration: 1.2 }, "-=0.8")
            .from(".hero-image-float", { opacity: 0, y: 50, duration: 1 }, "-=0.8");

        gsap.to(".hero-image-float", {
            scrollTrigger: {
                trigger: ".hero-section",
                start: "top top",
                end: "bottom top",
                scrub: 1
            },
            y: -80,
            ease: "none",
        });

        gsap.to(".hero-image-main", {
            scrollTrigger: {
                trigger: ".hero-section",
                start: "top top",
                end: "bottom top",
                scrub: 1
            },
            y: -40,
            ease: "none",
        });

        // Animate problem cards on scroll
        gsap.from(".problem-card", {
            scrollTrigger: {
                trigger: ".problem-section",
                start: "top 80%",
                end: "top 20%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: "power3.out"
        });

        // Animate feature cards
        gsap.from(".feature-card", {
            scrollTrigger: {
                trigger: ".features-section",
                start: "top 80%",
                end: "top 20%",
                toggleActions: "play none none reverse"
            },
            scale: 0.9,
            opacity: 0,
            stagger: 0.12,
            duration: 0.7,
            ease: "back.out(1.2)"
        });

    }, { scope: main });

    return (
        <div ref={main} className="flex min-h-screen flex-col bg-white text-gray-800 dark:bg-zinc-950 dark:text-zinc-200">
            {/* ========== NAVBAR ========== */}
            <nav className="fixed top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-12" />
                            <span className={`${PlayWriteNewZealandFont.className} text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent`}>
                                Deeper Weave
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors relative group">
                                Features
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300" />
                            </Link>
                            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors relative group">
                                Pricing
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300" />
                            </Link>
                            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors relative group">
                                About
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/auth/sign-in"
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all hover:scale-105"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/sign-up"
                                    className="group relative rounded-lg bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all overflow-hidden"
                                >
                                    <span className="relative z-10">Get Started</span>
                                    {/* Meteor border effect */}
                                    <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <span className="absolute inset-0 rounded-lg border-2 border-transparent animate-border-flow"
                                              style={{
                                                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                                                  backgroundSize: '200% 100%',
                                                  animation: 'meteor 2s linear infinite'
                                              }} />
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            <div className="relative w-6 h-6">
                                <Bars3Icon
                                    className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                                        mobileMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                                    }`}
                                />
                                <XMarkIcon
                                    className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                                        mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                                    }`}
                                />
                            </div>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    <div
                        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
                            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                        <div className="flex flex-col gap-1 py-4 border-t border-gray-200/50 dark:border-zinc-800/50">
                            <Link
                                href="/features"
                                className="px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Features
                            </Link>
                            <Link
                                href="/pricing"
                                className="px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Pricing
                            </Link>
                            <Link
                                href="/about"
                                className="px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                About
                            </Link>
                            <div className="h-px bg-gray-200 dark:bg-zinc-800 my-2" />
                            <Link
                                href="/auth/sign-in"
                                className="px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/auth/sign-up"
                                className="mx-4 mt-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-3 text-center text-sm font-medium text-white shadow-md hover:shadow-lg transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                {/* ========== HERO SECTION ========== */}
                <section className="hero-section relative flex min-h-screen items-center overflow-hidden pt-24 pb-20">
                    {/* Background */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-orange-950/10" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.05),transparent_50%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(249,115,22,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_60%,rgba(249,115,22,0.05),transparent_50%)]" />
                    </div>

                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                            {/* Left Content */}
                            <div className="text-center lg:text-left space-y-8">
                                {/* Badge */}
                                <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-900/50 dark:bg-amber-900/20">
                                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-sm font-medium text-amber-900 dark:text-amber-300">
                                        Your film diary, reimagined
                                    </span>
                                </div>

                                {/* Headline */}
                                <div className="space-y-4">
                                    <h1 className="hero-h1 text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
                                        Track films.
                                        <span className="block mt-2 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                                            Share your thoughts.
                                        </span>
                                    </h1>
                                </div>

                                {/* Description */}
                                <p className="hero-p mx-auto max-w-xl text-lg leading-relaxed text-gray-600 dark:text-zinc-400 lg:mx-0">
                                    A chill space for movie lovers to log what they watch, write casual reviews, and connect with fellow film enthusiasts.
                                </p>

                                {/* CTA Buttons */}
                                <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                    <Link
                                        href="/auth/sign-up"
                                        className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5 overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Start Tracking
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </span>
                                        {/* Shimmer effect */}
                                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    </Link>
                                    <Link
                                        href="/blog"
                                        className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 hover:scale-105"
                                    >
                                        Browse Posts
                                    </Link>
                                </div>

                                {/* Social Proof */}
                                <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-amber-400 to-orange-500 dark:border-zinc-950 hover:scale-110 transition-transform cursor-pointer" />
                                        ))}
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-semibold text-gray-900 dark:text-zinc-100">1,000+ film lovers</div>
                                        <div className="text-gray-600 dark:text-zinc-400">tracking their journey</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right - Hero Images */}
                            <div className="relative h-[500px] lg:h-[700px]">
                                {/* Main Image - Blog Post */}
                                <div className="hero-image-main absolute left-0 right-0 top-1/2 -translate-y-1/2 mx-auto w-[95%] max-w-3xl">
                                    <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_120px_-20px_rgba(0,0,0,0.6)] ring-1 ring-gray-900/5 dark:ring-white/10 hover:scale-105 transition-transform duration-700">
                                        <Image
                                            src="/blog-post.png"
                                            alt="Film review interface"
                                            width={1200}
                                            height={800}
                                            className="w-full h-auto"
                                            priority
                                        />
                                    </div>
                                </div>

                                {/* Floating Image - Timeline */}
                                <div className="hero-image-float absolute -right-4 top-1/2 -translate-y-1/2 w-[45%] max-w-md lg:-right-8">
                                    <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_80px_-15px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_100px_-15px_rgba(0,0,0,0.7)] ring-1 ring-gray-900/10 dark:ring-white/10 hover:scale-105 transition-transform duration-700">
                                        <Image
                                            src="/timeline.png"
                                            alt="Watch history feed"
                                            width={500}
                                            height={800}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>

                                {/* Decorative Elements */}
                                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 blur-3xl animate-pulse" />
                                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                            </div>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-zinc-500">Scroll to explore</span>
                            <svg className="w-5 h-5 text-gray-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </div>
                    </div>
                </section>

                {/* ========== "THE PROBLEM" SECTION - REDESIGNED ========== */}
                <section className="problem-section py-32 bg-gradient-to-b from-white via-orange-50/30 to-amber-50/50 dark:from-zinc-950 dark:via-orange-950/5 dark:to-amber-950/10 relative overflow-hidden">
                    {/* Animated background orbs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-float" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="mb-20 text-center max-w-3xl mx-auto space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/20 rounded-full border border-orange-200 dark:border-orange-900/50">
                                <SparklesIcon className="h-4 w-4 text-orange-600 dark:text-orange-400 animate-pulse" />
                                <span className="text-sm font-semibold text-orange-900 dark:text-orange-300">The Problem</span>
                            </div>
                            <h2 className="text-4xl font-bold md:text-5xl">
                                Your movie moments are
                                <span className="block mt-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                    scattered everywhere
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-zinc-400">
                                It&apos;s time to bring them all together in one place
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="problem-card group relative rounded-2xl border border-orange-200/50 bg-gradient-to-br from-white via-orange-50/50 to-amber-50/30 p-8 text-center shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 dark:border-orange-900/30 dark:from-zinc-900 dark:via-orange-950/20 dark:to-amber-950/10 overflow-hidden">
                                {/* Gradient overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10 space-y-6">
                                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                                        <ClockIcon className="h-10 w-10 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Lost Memories</h3>
                                        <p className="text-sm leading-relaxed text-gray-600 dark:text-zinc-400">
                                            Can&apos;t remember what you watched last month or what you thought about it
                                        </p>
                                    </div>
                                </div>

                                {/* Corner accent */}
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            <div className="problem-card group relative rounded-2xl border border-orange-200/50 bg-gradient-to-br from-white via-orange-50/50 to-amber-50/30 p-8 text-center shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 dark:border-orange-900/30 dark:from-zinc-900 dark:via-orange-950/20 dark:to-amber-950/10 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10 space-y-6">
                                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                                        <PencilSquareIcon className="h-10 w-10 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Notes Chaos</h3>
                                        <p className="text-sm leading-relaxed text-gray-600 dark:text-zinc-400">
                                            Thoughts scattered across notes apps, texts, and random pieces of paper
                                        </p>
                                    </div>
                                </div>

                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            <div className="problem-card group relative rounded-2xl border border-orange-200/50 bg-gradient-to-br from-white via-orange-50/50 to-amber-50/30 p-8 text-center shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 dark:border-orange-900/30 dark:from-zinc-900 dark:via-orange-950/20 dark:to-amber-950/10 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10 space-y-6">
                                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                                        <UserGroupIcon className="h-10 w-10 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Solo Viewing</h3>
                                        <p className="text-sm leading-relaxed text-gray-600 dark:text-zinc-400">
                                            Hard to find others who share your taste and want to chat about films
                                        </p>
                                    </div>
                                </div>

                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            <div className="problem-card group relative rounded-2xl border border-orange-200/50 bg-gradient-to-br from-white via-orange-50/50 to-amber-50/30 p-8 text-center shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 dark:border-orange-900/30 dark:from-zinc-900 dark:via-orange-950/20 dark:to-amber-950/10 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10 space-y-6">
                                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                                        <Cog6ToothIcon className="h-10 w-10 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div><h3 className="text-xl font-bold mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Feature Overload</h3>
                                        <p className="text-sm leading-relaxed text-gray-600 dark:text-zinc-400">
                                            Platforms packed with unnecessary features that distract from what matters
                                        </p>
                                    </div>
                                </div>

                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== "HOW IT WORKS" SECTION ========== */}
                <section className="py-32 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="mb-24 text-center">
                            <h2 className="text-4xl font-bold md:text-5xl mb-6">Simple, elegant, purposeful</h2>
                            <p className="text-xl text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                                Everything you need to track and share your film journey
                            </p>
                        </div>

                        <div className="space-y-40">
                            {/* Feature 1 - Editor */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-20">
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-200 dark:border-amber-900/50 hover:scale-105 transition-transform">
                                        <PencilSquareIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-pulse" />
                                        <span className="text-sm font-semibold text-amber-900 dark:text-amber-300">Write Freely</span>
                                    </div>
                                    <h3 className="text-4xl lg:text-5xl font-bold leading-tight">
                                        Jot down thoughts.<br />
                                        <span className="text-gray-600 dark:text-zinc-400">As casual or deep as you like.</span>
                                    </h3>
                                    <p className="text-lg text-gray-600 dark:text-zinc-400 leading-relaxed">
                                        A clean editor that gets out of your way. Quick notes or full essays—whatever fits your mood.
                                    </p>
                                </div>
                                <div className="lg:col-span-7">
                                    <div className="relative rounded-2xl overflow-hidden shadow-[0_25px_100px_-20px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_120px_-20px_rgba(0,0,0,0.6)] ring-1 ring-gray-900/5 dark:ring-white/5 transform hover:scale-[1.02] transition-all duration-700 group">
                                        <Image
                                            src="/blog-form.png"
                                            alt="Clean editor interface"
                                            width={1400}
                                            height={900}
                                            className="w-full h-auto"
                                        />
                                        {/* Subtle glow on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2 - Customization */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-20">
                                <div className="lg:col-span-7 order-2 lg:order-1">
                                    <div className="relative rounded-2xl overflow-hidden shadow-[0_25px_100px_-20px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_120px_-20px_rgba(0,0,0,0.6)] ring-1 ring-gray-900/5 dark:ring-white/5 transform hover:scale-[1.02] transition-all duration-700 group">
                                        <Image
                                            src="/post-customization.png"
                                            alt="Post customization interface"
                                            width={1400}
                                            height={900}
                                            className="w-full h-auto"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-tl from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    </div>
                                </div>
                                <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
                                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-200 dark:border-amber-900/50 hover:scale-105 transition-transform">
                                        <PhotoIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-pulse" />
                                        <span className="text-sm font-semibold text-amber-900 dark:text-amber-300">Your Vibe</span>
                                    </div>
                                    <h3 className="text-4xl lg:text-5xl font-bold leading-tight">
                                        Add your flavor.<br />
                                        <span className="text-gray-600 dark:text-zinc-400">Make it personal.</span>
                                    </h3>
                                    <p className="text-lg text-gray-600 dark:text-zinc-400 leading-relaxed">
                                        Pick a cover image, tag your favorites, organize your way. Build your unique film diary.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========== "WHO IS IT FOR?" SECTION ========== */}
                <section className="py-32 bg-white dark:bg-zinc-950">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center max-w-3xl mx-auto">
                            <h2 className="text-4xl font-bold md:text-5xl mb-4">For every type of movie lover</h2>
                            <p className="text-xl text-gray-600 dark:text-zinc-400">From casual watchers to dedicated cinephiles</p>
                        </div>
                        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
                            {[
                                { icon: TicketIcon, title: "The Weekend Watcher", color: "from-amber-500 to-orange-500" },
                                { icon: HeartIcon, title: "The Passionate Reviewer", color: "from-orange-500 to-red-500" },
                                { icon: BookmarkIcon, title: "The List Keeper", color: "from-amber-600 to-yellow-500" },
                                { icon: UsersIcon, title: "The Film Club", color: "from-orange-600 to-amber-500" }
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white/50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-orange-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-orange-700 cursor-pointer relative overflow-hidden"
                                >
                                    {/* Background gradient on hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                                        <item.icon className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="text-lg font-semibold group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors relative z-10">{item.title}</h3>

                                    {/* Shine effect */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ========== FEATURES SECTION - REDESIGNED ========== */}
                <section className="features-section py-32 bg-gradient-to-b from-slate-50 via-orange-50/20 to-amber-50/30 dark:from-zinc-900 dark:via-orange-950/10 dark:to-amber-950/10 relative overflow-hidden">
                    {/* Animated background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-float" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="mb-16 text-center max-w-3xl mx-auto space-y-6">
                            <h2 className="text-5xl md:text-6xl font-bold">
                                <span className={`${PlayWriteNewZealandFont.className} bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 bg-clip-text text-transparent`}>
                                    Everything
                                </span>
                                {" "}you need.
                            </h2>
                            <h3 className="text-3xl font-bold md:text-4xl">Nothing extra.</h3>
                            <p className="text-xl text-gray-600 dark:text-zinc-400">
                                Just the essentials for tracking films and sharing your thoughts
                            </p>
                        </div>

                        <div className="mx-auto mt-16 grid max-w-6xl items-stretch justify-center gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    icon: ClockIcon,
                                    title: "Watch History",
                                    description: "Keep track of everything you watch with dates, ratings, and quick notes",
                                    gradient: "from-amber-500 to-orange-600"
                                },
                                {
                                    icon: PencilSquareIcon,
                                    title: "Casual Reviews",
                                    description: "Write as much or as little as you want with our simple, distraction-free editor",
                                    gradient: "from-orange-500 to-red-500"
                                },
                                {
                                    icon: UserGroupIcon,
                                    title: "Follow & Connect",
                                    description: "Find people with similar taste, follow their reviews, and build your film community",
                                    gradient: "from-amber-600 to-yellow-500"
                                },
                                {
                                    icon: FilmIcon,
                                    title: "Rich Film Data",
                                    description: "Link to any movie with automatic posters, info, and metadata from TMDB",
                                    gradient: "from-orange-600 to-amber-500"
                                }
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="feature-card group relative flex h-full flex-col items-center justify-start space-y-6 rounded-3xl border-2 border-orange-200/50 bg-white p-8 text-center shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-orange-400/80 dark:border-orange-900/30 dark:bg-zinc-900 dark:hover:border-orange-600/50 overflow-hidden cursor-pointer"
                                >
                                    {/* Animated gradient background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-all duration-500`} />

                                    {/* Orbiting border effect */}
                                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className={`absolute inset-[-2px] rounded-3xl bg-gradient-to-r ${feature.gradient} animate-spin-slow`} style={{ animation: 'spin 8s linear infinite' }} />
                                        <div className="absolute inset-[2px] rounded-3xl bg-white dark:bg-zinc-900" />
                                    </div>

                                    <div className="relative z-10 space-y-6">
                                        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                                            <feature.icon className="h-10 w-10 text-white group-hover:scale-110 transition-transform" />
                                        </div>
                                        <h3 className={`text-xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform`}>
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-zinc-400 flex-grow leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>

                                    {/* Shine effect */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ========== FINAL CTA SECTION ========== */}
                <section className="py-32 bg-gradient-to-b from-white via-amber-50/40 to-orange-50/50 dark:from-zinc-950 dark:via-amber-950/10 dark:to-orange-950/10 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08),transparent_70%)]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-amber-400/20 via-orange-400/20 to-transparent rounded-full blur-3xl animate-pulse" />
                    </div>

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <div className="max-w-4xl mx-auto space-y-10">
                            <div className="space-y-6">
                                <h2 className="text-5xl font-bold md:text-6xl lg:text-7xl leading-tight">
                                    Ready to start your{" "}
                                    <span className={`${PlayWriteNewZealandFont.className} bg-gradient-to-r from-amber-500 via-orange-500 to-orange-700 bg-clip-text text-transparent`}>
                                        film diary
                                    </span>
                                    ?
                                </h2>
                                <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-zinc-400 leading-relaxed">
                                    Join film lovers who are documenting their cinematic journey. Track what you watch, share your thoughts, connect with others.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Link
                                    href="/auth/sign-up"
                                    className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-orange-700 px-10 py-5 text-lg font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-2xl hover:shadow-orange-500/50 hover:-translate-y-1 overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Start Tracking Free
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </span>

                                    {/* Animated meteor border */}
                                    <span className="absolute inset-[-2px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent animate-meteor" />
                                    </span>

                                    {/* Shimmer effect */}
                                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                </Link>
                                <span className="text-sm text-gray-500 dark:text-zinc-500 flex items-center gap-2">
                                    <SparklesIcon className="h-4 w-4" />
                                    No credit card required
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* ========== FOOTER ========== */}
            <footer className="border-t border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                            <span className={`${PlayWriteNewZealandFont.className} text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent`}>
                                Deeper Weave
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-zinc-400">
                            &copy; 2025 Deeper Weave. All rights reserved.
                        </p>
                        <div className="flex gap-8 text-sm">
                            <Link
                                href="/policies/terms"
                                className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all relative group"
                            >
                                Terms of Service
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300" />
                            </Link>
                            <Link
                                href="/policies/privacy"
                                className="text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all relative group"
                            >
                                Privacy Policy
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-300" />
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                @keyframes meteor {
                    0% {
                        transform: translateX(-100%) translateY(-100%);
                    }
                    100% {
                        transform: translateX(100%) translateY(100%);
                    }
                }
                
                @keyframes float {
                    0%, 100% {
                        transform: translate(0, 0);
                    }
                    50% {
                        transform: translate(30px, -30px);
                    }
                }
                
                .animate-meteor {
                    animation: meteor 3s linear infinite;
                }
                
                .animate-float {
                    animation: float 20s ease-in-out infinite;
                }
                
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
                
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}