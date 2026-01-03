'use client';

import { motion, Variants, AnimatePresence } from "framer-motion";
import { Eye, ArrowUp, FilmIcon, ArrowUpRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CinematicInfoCard from "@/app/ui/blog/CinematicInfoCard";
import LikeButton from "@/app/ui/blog/LikeButton";
import CommentsSection from "@/app/ui/blog/CommentsSection";
import { Post, Movie, Series, CommentWithAuthor, UserProfile } from "@/lib/definitions";
import DOMPurify from 'isomorphic-dompurify';
import { useState } from 'react';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { SpoilerBadge, NsfwBadge, PremiumBadge } from "@/app/ui/blog/badges";
import { LockClosedIcon } from "@heroicons/react/24/solid";

// --- ANIMATION VARIANTS ---
const pageVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8, ease: "circOut" } }
};

const contentVariants: Variants = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4, ease: "easeOut" } }
};

// --- 1. NSFW OVERLAY (System Lock Style) ---
const NSFWWarning = ({ onAccept, onReject }: { onAccept: () => void, onReject: () => void }) => {
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-6 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Red Noise Background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
                <div className="absolute inset-0 bg-red-950/30 pointer-events-none mix-blend-overlay" />

                <div className="relative z-10 max-w-md w-full border border-red-900 bg-black/90 p-12 text-center shadow-[0_0_50px_rgba(127,29,29,0.5)] backdrop-blur-sm">
                    <div className="mx-auto w-20 h-20 border-2 border-red-600 bg-red-950/50 flex items-center justify-center mb-8 rounded-full animate-pulse">
                        <LockClosedIcon className="w-10 h-10 text-red-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-red-500 uppercase tracking-[0.2em] mb-4">
                        Restricted Access
                    </h2>
                    <p className="text-red-400 mb-10 text-xs uppercase tracking-widest leading-relaxed">
                        // CAUTION: This file contains explicit material.<br/>
                        // Viewer discretion is mandatory.
                    </p>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={onAccept}
                            className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-widest text-xs transition-all hover:tracking-[0.2em] border border-transparent shadow-lg"
                        >
                            Override Security Protocol
                        </button>
                        <button
                            onClick={onReject}
                            className="w-full py-4 bg-transparent hover:bg-red-900/10 text-red-600 border border-red-900/50 font-bold uppercase tracking-widest text-xs transition-colors"
                        >
                            Abort Sequence
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

// --- 2. SCROLL TO TOP (Technical) ---
const ScrollToTop = () => {
    return (
        <motion.button
            className="fixed bottom-8 right-8 z-40 p-3 bg-zinc-900 text-white dark:bg-white dark:text-black border border-zinc-700 shadow-xl hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
        >
            <ArrowUp size={20} />
        </motion.button>
    );
};

interface AnimatedBlogPostProps {
    post: Post;
    author: Pick<UserProfile, 'username' | 'display_name' | 'profile_pic_url'>;
    movie?: Movie | null;
    series?: Series | null;
    likeCount: number;
    userHasLiked: boolean;
    comments: CommentWithAuthor[];
    viewerData: { profile: UserProfile | null } | null;
    nsfw: boolean;
    rating?: number;
}

export default function AnimatedBlogPost({
                                             post,
                                             author,
                                             movie,
                                             series,
                                             likeCount,
                                             userHasLiked,
                                             comments,
                                             viewerData,
                                             nsfw,
                                             rating
                                         }: AnimatedBlogPostProps) {

    const [nsfwAccepted, setNsfwAccepted] = useState(!nsfw);
    const [isCinematicModalOpen, setIsCinematicModalOpen] = useState(false);

    const sanitizedHtml = DOMPurify.sanitize(post.content_html);
    const cinematicItem = movie || series;
    const mediaType = movie ? 'movie' : 'tv';

    const handleNsfwAccept = () => setNsfwAccepted(true);
    const handleNsfwReject = () => window.history.back();

    if (nsfw && !nsfwAccepted) {
        return <NSFWWarning onAccept={handleNsfwAccept} onReject={handleNsfwReject} />;
    }

    // Format Date: "2026.01.02"
    const dateObj = new Date(post.created_at);
    const dateStr = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`;

    return (
        <motion.article
            className="min-h-screen bg-zinc-50 dark:bg-zinc-950 relative pb-32"
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            {/* Global Grain */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed z-50 mix-blend-overlay"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* --- HERO SECTION --- */}
            {/* Changed from absolute/fixed height to flex column to ensure content is never hidden */}
            <div className="relative w-full min-h-[70vh] flex flex-col justify-end bg-zinc-900 border-b border-zinc-800">
                {post.banner_url ? (
                    <>
                        <Image
                            src={post.banner_url}
                            alt={`Banner for ${post.title}`}
                            fill
                            className="object-cover opacity-80 transition-all duration-[1.5s] ease-in-out scale-105 hover:scale-100"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent opacity-60" />
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
                        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("/noise.svg")'}} />
                        <span className={`${PlayWriteNewZealandFont.className} text-[12vw] text-zinc-800 select-none`}>
                            File.
                        </span>
                    </div>
                )}

                {/* Hero Content Overlay - Relative + z-index to sit on top of image */}
                <div className="relative z-20 w-full p-6 md:p-12 mt-32">
                    <div className="max-w-5xl mx-auto space-y-8">

                        {/* Top Meta Line */}
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                            <span className="bg-black/50 backdrop-blur-md px-3 py-1 text-white border border-white/20">
                                REF: {post.id.slice(0, 8)}
                            </span>
                            <span className="text-white drop-shadow-md">{dateStr}</span>
                            <span className="w-px h-3 bg-white/50" />
                            <div className="flex items-center gap-3">
                                {post.is_premium && <PremiumBadge />}
                                {post.is_nsfw && <NsfwBadge />}
                                {post.has_spoilers && <SpoilerBadge />}
                            </div>
                        </div>

                        {/* Title Block */}
                        <div className="border-l-4 border-white pl-6 md:pl-8">
                            <h1 className={`${PlayWriteNewZealandFont.className} text-4xl md:text-6xl lg:text-8xl font-bold text-white leading-[0.9] drop-shadow-2xl`}>
                                {post.title}
                            </h1>
                        </div>

                        {/* Rating Display */}
                        {rating && rating > 0 && (
                            <div className="flex items-center gap-1 pl-1">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`h-1.5 w-10 ${i < rating ? 'bg-amber-500' : 'bg-white/20'}`} />
                                ))}
                                <span className="ml-3 text-amber-500 font-mono text-xs font-bold tracking-widest drop-shadow-md">
                                    {rating}/5 RATING
                                </span>
                            </div>
                        )}

                        {/* Author Link - Ensure visibility against any background */}
                        <div className="pt-8 w-full max-w-lg">
                            <Link href={`/profile/${author.username}`} className="group flex items-center gap-5">
                                <div className="relative w-14 h-14 border-2 border-white/20 bg-zinc-800 transition-all rounded-sm overflow-hidden shadow-lg">
                                    <Image
                                        src={author.profile_pic_url || '/placeholder-user.jpg'}
                                        alt={author.display_name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-sm uppercase tracking-widest group-hover:text-amber-500 transition-colors drop-shadow-md">
                                        {author.display_name}
                                    </span>
                                    <span className="text-zinc-300 text-xs font-mono group-hover:text-white transition-colors drop-shadow-md">
                                        // @{author.username}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BODY CONTENT --- */}
            <motion.div
                className="relative max-w-4xl mx-auto px-4 md:px-0 -mt-12 md:-mt-20 z-30"
                variants={contentVariants}
            >
                {/* Paper Sheet Effect */}
                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-8 md:p-16 lg:p-20 shadow-2xl relative">

                    {/* Decorative Top Markings */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
                    <div className="absolute top-8 right-8 text-[10px] font-mono text-zinc-300 dark:text-zinc-700 rotate-90 origin-top-right">
                        PAGE 01 OF 01
                    </div>

                    {/* The Text */}
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none
                        prose-headings:font-bold prose-headings:tracking-tight prose-headings:font-serif
                        prose-p:leading-relaxed prose-p:font-light
                        prose-a:text-zinc-900 dark:prose-a:text-white prose-a:font-bold prose-a:underline prose-a:decoration-zinc-400 prose-a:underline-offset-4
                        prose-blockquote:border-l-2 prose-blockquote:border-zinc-900 dark:prose-blockquote:border-zinc-100 prose-blockquote:pl-6 prose-blockquote:italic
                        text-zinc-800 dark:text-zinc-300"
                        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                    />

                    {/* --- REFERENCE MATERIAL (The Movie/Series Card) --- */}
                    {post.type === 'review' && cinematicItem && (
                        <div className="mt-20 pt-10 border-t border-zinc-100 dark:border-zinc-900">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                                    [ Subject Material ]
                                </h3>
                                <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-900 ml-4" />
                            </div>

                            {/* Reference Card */}
                            <div
                                onClick={() => setIsCinematicModalOpen(true)}
                                className="group cursor-pointer flex flex-col md:flex-row gap-0 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-zinc-900 dark:hover:border-zinc-100 transition-all duration-500 overflow-hidden"
                            >
                                {/* Poster */}
                                <div className="relative w-full md:w-32 h-48 shrink-0 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                    {cinematicItem.poster_url ? (
                                        <Image
                                            src={cinematicItem.poster_url}
                                            alt={cinematicItem.title}
                                            fill
                                            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full"><FilmIcon className="w-8 h-8 text-zinc-400"/></div>
                                    )}
                                    {/* Grain Overlay */}
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 p-6 flex flex-col justify-center relative">
                                    {/* Hover Arrow */}
                                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                        <ArrowUpRightIcon className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                                    </div>

                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-wider">
                                            {mediaType === 'movie' ? 'Film' : 'Series'}
                                        </span>
                                        <span className="text-xs font-mono text-zinc-500">
                                            // {new Date(cinematicItem.release_date).getFullYear()}
                                        </span>
                                    </div>

                                    <h4 className={`${PlayWriteNewZealandFont.className} text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors`}>
                                        {cinematicItem.title}
                                    </h4>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide mt-2">
                                        Click to access dossier
                                    </p>
                                </div>
                            </div>

                            {/* The Actual Modal Component */}
                            <CinematicInfoCard
                                tmdbId={cinematicItem.tmdb_id}
                                initialData={cinematicItem}
                                mediaType={mediaType}
                                isOpen={isCinematicModalOpen}
                                onClose={() => setIsCinematicModalOpen(false)}
                            />
                        </div>
                    )}
                </div>

                {/* --- FOOTER SECTION --- */}
                <div className="mt-8 max-w-4xl mx-auto space-y-px">

                    {/* Stats Bar */}
                    <div className="flex items-center justify-between p-6 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-6">
                            <LikeButton postId={post.id} initialLikes={likeCount} userHasLiked={userHasLiked} />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                            <Eye size={14} />
                            <span>{post.view_count.toLocaleString()} Observations</span>
                        </div>
                    </div>

                    {/* Comments Area */}
                    <div className="py-6  ">
                        <div className="mb-10 flex items-end justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <h3 className={`${PlayWriteNewZealandFont.className} text-4xl font-bold text-zinc-900 dark:text-zinc-100`}>
                                Discourse.
                            </h3>
                            <span className="text-xs font-mono uppercase text-zinc-500 tracking-widest border border-zinc-200 dark:border-zinc-800 px-2 py-1">
                                LOGS: {comments.length}
                            </span>
                        </div>
                        <CommentsSection
                            postId={post.id}
                            comments={comments}
                            currentUserProfile={viewerData?.profile ?? null}
                        />
                    </div>
                </div>

            </motion.div>

            <ScrollToTop />
        </motion.article>
    );
}