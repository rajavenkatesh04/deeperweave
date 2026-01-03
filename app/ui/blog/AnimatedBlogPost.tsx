'use client';

import { motion, Variants, AnimatePresence } from "framer-motion";
import { Eye, Calendar, ArrowUp, FilmIcon, TvIcon, ArrowUpRightIcon } from "lucide-react";
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
import {LockClosedIcon} from "@heroicons/react/24/solid";

// --- ANIMATION VARIANTS ---
const pageVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

const contentVariants: Variants = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" } }
};

// --- 1. NSFW OVERLAY (System Lock Style) ---
const NSFWWarning = ({ onAccept, onReject }: { onAccept: () => void, onReject: () => void }) => {
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950 p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Red Noise Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
                <div className="absolute inset-0 bg-red-900/10 pointer-events-none mix-blend-overlay" />

                <div className="relative z-10 max-w-md w-full border border-red-900 bg-black p-8 text-center shadow-2xl shadow-red-900/20">
                    <div className="mx-auto w-16 h-16 border border-red-800 bg-red-950/30 flex items-center justify-center mb-6">
                        <LockClosedIcon className="w-8 h-8 text-red-500" />
                    </div>

                    <h2 className="text-xl font-bold text-red-500 uppercase tracking-[0.2em] mb-2 font-mono">
                        Restricted Access
                    </h2>
                    <p className="text-red-400/60 mb-8 font-mono text-xs uppercase tracking-wide">
                        // Content Flag: NSFW // Viewer Discretion Advised
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onAccept}
                            className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-widest text-xs transition-colors border border-transparent"
                        >
                            Override Lock
                        </button>
                        <button
                            onClick={onReject}
                            className="w-full py-4 bg-transparent hover:bg-red-900/20 text-red-500 border border-red-900/50 font-bold uppercase tracking-widest text-xs transition-colors"
                        >
                            Abort
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
            className="fixed bottom-8 right-8 z-50 p-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border border-zinc-700 shadow-xl hover:bg-zinc-700 transition-colors"
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
    const [isCinematicModalOpen, setIsCinematicModalOpen] = useState(false); // State for modal

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
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none fixed z-50"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* --- HERO SECTION --- */}
            <div className="relative w-full h-[65vh] min-h-[500px] overflow-hidden bg-zinc-900 border-b border-zinc-800">
                {post.banner_url ? (
                    <>
                        <Image
                            src={post.banner_url}
                            alt={`Banner for ${post.title}`}
                            fill
                            className="object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <span className={`${PlayWriteNewZealandFont.className} text-9xl text-white`}>
                            Log.
                        </span>
                    </div>
                )}

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Meta Top Line */}
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                            <span className="bg-zinc-800 px-2 py-1 rounded-sm text-zinc-200 border border-zinc-700">
                                Log ID: {post.id.slice(0, 8)}
                            </span>
                            <span>{dateStr}</span>
                            <span className="w-px h-3 bg-zinc-600" />
                            <div className="flex items-center gap-2">
                                {post.is_premium && <PremiumBadge />}
                                {post.is_nsfw && <NsfwBadge />}
                                {post.has_spoilers && <SpoilerBadge />}
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className={`${PlayWriteNewZealandFont.className} text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[0.9] drop-shadow-2xl`}>
                            {post.title}
                        </h1>

                        {/* Rating (if applicable) */}
                        {rating && rating > 0 && (
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`h-1 w-8 ${i < rating ? 'bg-amber-500' : 'bg-zinc-800'}`} />
                                ))}
                                <span className="ml-2 text-amber-500 font-mono text-xs font-bold">{rating}/5</span>
                            </div>
                        )}

                        {/* Author Link */}
                        <div className="pt-6 border-t border-white/10 w-full max-w-lg">
                            <Link href={`/profile/${author.username}`} className="group flex items-center gap-4">
                                <div className="relative w-12 h-12 border border-zinc-700 bg-zinc-800 grayscale group-hover:grayscale-0 transition-all">
                                    <Image
                                        src={author.profile_pic_url || '/placeholder-user.jpg'}
                                        alt={author.display_name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-sm uppercase tracking-wide group-hover:text-amber-500 transition-colors">
                                        {author.display_name}
                                    </span>
                                    <span className="text-zinc-500 text-xs font-mono">@{author.username}</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BODY CONTENT --- */}
            <motion.div
                className="relative max-w-4xl mx-auto px-6 md:px-12 -mt-16 z-30"
                variants={contentVariants}
            >
                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-8 md:p-16 shadow-2xl">

                    {/* The Actual Text */}
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-zinc-900 dark:prose-a:text-white prose-a:font-bold prose-a:underline prose-a:decoration-zinc-400 font-light leading-relaxed text-zinc-800 dark:text-zinc-300"
                        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                    />

                    {/* --- REFERENCE MATERIAL (The Movie/Series Card) --- */}
                    {post.type === 'review' && cinematicItem && (
                        <div className="mt-16 pt-8 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">
                                [ Reference Material ]
                            </h3>

                            {/* Trigger Card */}
                            <div
                                onClick={() => setIsCinematicModalOpen(true)}
                                className="group cursor-pointer flex flex-col md:flex-row gap-6 p-4 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 bg-zinc-50 dark:bg-zinc-900/30 transition-all duration-300"
                            >
                                <div className="relative w-24 h-36 shrink-0 bg-zinc-200 dark:bg-zinc-800 shadow-sm group-hover:shadow-xl transition-all">
                                    {cinematicItem.poster_url ? (
                                        <Image
                                            src={cinematicItem.poster_url}
                                            alt={cinematicItem.title}
                                            fill
                                            className="object-cover grayscale group-hover:grayscale-0 transition-all"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full"><FilmIcon className="w-8 h-8 text-zinc-400"/></div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase">
                                            {mediaType === 'movie' ? 'Film' : 'Series'}
                                        </span>
                                        <span className="text-xs font-mono text-zinc-500">
                                            {new Date(cinematicItem.release_date).getFullYear()}
                                        </span>
                                    </div>
                                    <h4 className={`${PlayWriteNewZealandFont.className} text-2xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline decoration-1 underline-offset-4`}>
                                        {cinematicItem.title}
                                    </h4>
                                    <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                        <span>View Data Sheet</span>
                                        <ArrowUpRightIcon className="w-3 h-3" />
                                    </div>
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
                <div className="mt-12 max-w-4xl mx-auto">

                    {/* Engagement Bar */}
                    <div className="flex items-center justify-between p-6 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-12">
                        <div className="flex items-center gap-4">
                            <LikeButton postId={post.id} initialLikes={likeCount} userHasLiked={userHasLiked} />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                            <Eye size={16} />
                            <span>{post.view_count.toLocaleString()} Views</span>
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-8 md:p-12">
                        <div className="mb-8 flex items-end justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <h3 className={`${PlayWriteNewZealandFont.className} text-3xl font-bold text-zinc-900 dark:text-zinc-100`}>
                                Discourse.
                            </h3>
                            <span className="text-xs font-mono uppercase text-zinc-500">
                                {comments.length} Records
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