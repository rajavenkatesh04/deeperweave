'use client';

import { motion, Variants, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Eye, ArrowUp, FilmIcon, ArrowUpRightIcon, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CinematicInfoCard from "@/app/ui/blog/CinematicInfoCard";
import LikeButton from "@/app/ui/blog/LikeButton";
import CommentsSection from "@/app/ui/blog/CommentsSection";
import DOMPurify from 'isomorphic-dompurify';
import { useState, useEffect } from 'react';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { SpoilerBadge, NsfwBadge, PremiumBadge } from "@/app/ui/blog/badges";
import { LockClosedIcon, EyeIcon } from "@heroicons/react/24/outline";

// --- ANIMATION VARIANTS ---
const pageVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.8, ease: "circOut" } }
};

const contentVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4, ease: "easeOut" } }
};

const ScrollToTop = () => {
    return (
        <motion.button
            className="fixed bottom-8 right-8 z-40 p-3 bg-white text-black dark:bg-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <ArrowUp size={18} />
        </motion.button>
    );
};

interface AnimatedBlogPostProps {
    post: any;
    author: {
        username: string;
        display_name: string | null;
        profile_pic_url?: string | null;
    };
    movie?: any;
    series?: any;
    likeCount: number;
    userHasLiked: boolean;
    comments: any[];
    viewerData: any;
    nsfw: boolean;
    rating?: number;
}

export default function AnimatedBlogPost({
                                             post, author, movie, series, likeCount, userHasLiked, comments, viewerData, nsfw, rating
                                         }: AnimatedBlogPostProps) {
    const [showContent, setShowContent] = useState(!nsfw);
    const [isCinematicModalOpen, setIsCinematicModalOpen] = useState(false);

    const { scrollY } = useScroll();
    const headerTitleOpacity = useTransform(scrollY, [300, 500], [0, 1]);

    const sanitizedHtml = DOMPurify.sanitize(post.content_html);
    const cinematicItem = movie || series;
    const mediaType = movie ? 'movie' : 'tv';

    useEffect(() => {
        if (post?.title) {
            document.title = `${post.title} | Deeper Weave`;
        }
    }, [post?.title]);

    const dateStr = new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

    return (
        <motion.article
            className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 pb-32 font-sans relative"
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            {/* --- STICKY NAV BAR --- */}
            <nav className="sticky top-0 z-[70] bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 h-14 w-full flex items-center px-4 md:px-6">
                <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Archive</span>
                    </button>

                    <motion.div
                        style={{ opacity: headerTitleOpacity }}
                        className="flex-1 flex justify-center px-4 overflow-hidden"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest truncate text-zinc-500 dark:text-zinc-400">
                            {post.title}
                        </span>
                    </motion.div>

                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 hidden md:block">
                            ID: {post.id.slice(0, 8)}
                        </span>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <div className="relative w-full h-[60vh] md:h-[75vh] flex flex-col justify-end overflow-hidden border-b border-zinc-200 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-950">
                {post.banner_url ? (
                    <Image src={post.banner_url} alt="" fill className="object-cover opacity-80 dark:opacity-50 transition-all duration-1000 scale-105" priority />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <span className={`${PlayWriteNewZealandFont.className} text-[20vw] text-zinc-900 dark:text-white`}>Archive</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent" />

                <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-12 md:pb-20">
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="bg-zinc-900 dark:bg-white text-white dark:text-black px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                                ID: {post.id.slice(0, 8)}
                            </span>
                            <span className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase">{dateStr}</span>
                            <div className="flex gap-2">
                                {post.is_premium && <PremiumBadge />}
                                {post.is_nsfw && <NsfwBadge />}
                                {post.has_spoilers && <SpoilerBadge />}
                            </div>
                        </div>

                        <h1 className={`${PlayWriteNewZealandFont.className} text-5xl md:text-8xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white max-w-4xl`}>
                            {post.title}
                        </h1>

                        {rating && (
                            <div className="flex items-center gap-1 pt-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`h-1 w-8 ${i < rating ? 'bg-amber-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- CONTENT WRAPPER (RELATIVE FOR OVERLAY) --- */}
            <div className="relative min-h-[500px]">

                {/* --- REDDIT-STYLE NSFW OVERLAY (ABSOLUTE within Content Wrapper) --- */}
                <AnimatePresence>
                    {nsfw && !showContent && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            // Changed from fixed inset-0 to absolute inset-0
                            className="absolute inset-0 z-50 flex items-start justify-center pt-32 bg-white/95 dark:bg-black/95 backdrop-blur-md"
                        >
                            <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-4">
                                <div className="w-16 h-16 mb-6 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                                    <LockClosedIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
                                </div>
                                <h2 className="text-xl font-bold uppercase tracking-[0.2em] mb-2 text-zinc-900 dark:text-white">
                                    Restricted Access
                                </h2>
                                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-8 leading-relaxed">
                                    This entry contains NSFW material. <br/> Access restricted to authorized personnel.
                                </p>
                                <button
                                    onClick={() => setShowContent(true)}
                                    className="flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-xl border border-transparent hover:scale-105"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                    View (must be 18+)
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- MAIN CONTENT AREA --- */}
                {/* Applied blur effect here if content is hidden */}
                <motion.div
                    className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 px-6 pt-16 md:pt-24 transition-all duration-500 ${!showContent ? 'blur-md opacity-20 pointer-events-none select-none h-[600px] overflow-hidden' : ''}`}
                    variants={contentVariants}
                >

                    {/* Left Sidebar */}
                    <div className="lg:col-span-3">
                        <div className="lg:sticky lg:top-24 space-y-8">
                            <Link href={`/profile/${author.username}`} className="group block space-y-4">
                                <div className="relative w-16 h-16 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 grayscale group-hover:grayscale-0 transition-all">
                                    <Image src={author.profile_pic_url || '/placeholder-user.jpg'} alt="" fill className="object-cover" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{author.display_name}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-400 transition-colors">@{author.username}</p>
                                </div>
                            </Link>

                            <div className="pt-8 border-t border-zinc-200 dark:border-zinc-900 space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                                    <Eye size={12} />
                                    <span>{post.view_count.toLocaleString()} Views</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Area */}
                    <div className="lg:col-span-9 space-y-20">
                        <section className="prose prose-zinc dark:prose-invert max-w-none">
                            <div
                                className="font-light leading-relaxed text-zinc-700 dark:text-zinc-300 first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-zinc-900 dark:first-letter:text-white"
                                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                            />
                        </section>

                        {post.type === 'review' && cinematicItem && (
                            <div className="space-y-6 pt-12 border-t border-zinc-200 dark:border-zinc-900">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">Archive Dossier</h3>
                                <div
                                    onClick={() => setIsCinematicModalOpen(true)}
                                    className="group cursor-pointer flex flex-col md:flex-row border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 hover:border-zinc-900 dark:hover:border-zinc-500 transition-all duration-500"
                                >
                                    <div className="relative w-full md:w-32 h-48 grayscale group-hover:grayscale-0 transition-all duration-700">
                                        {cinematicItem.poster_url ? (
                                            <Image src={cinematicItem.poster_url} alt="" fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-zinc-100 dark:bg-zinc-900"><FilmIcon className="w-6 h-6 text-zinc-300 dark:text-zinc-700"/></div>
                                        )}
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col justify-center">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[9px] font-bold uppercase tracking-widest bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-zinc-700 dark:text-zinc-300">{mediaType === 'movie' ? 'Film' : 'Series'}</span>
                                            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600">// {new Date(cinematicItem.release_date).getFullYear()}</span>
                                        </div>
                                        <h4 className={`${PlayWriteNewZealandFont.className} text-3xl font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors`}>
                                            {cinematicItem.title}
                                        </h4>
                                        <div className="mt-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                                            <span>Access Data</span>
                                            <ArrowUpRightIcon className="w-3 h-3 translate-y-0.5 opacity-0 group-hover:opacity-100 transition-all" />
                                        </div>
                                    </div>
                                </div>

                                <CinematicInfoCard
                                    tmdbId={cinematicItem.tmdb_id}
                                    initialData={cinematicItem}
                                    mediaType={mediaType}
                                    isOpen={isCinematicModalOpen}
                                    onClose={() => setIsCinematicModalOpen(false)}
                                />
                            </div>
                        )}

                        <div className="space-y-12 pt-12 border-t border-zinc-200 dark:border-zinc-900">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <h3 className={`${PlayWriteNewZealandFont.className} text-4xl font-bold text-zinc-900 dark:text-white`}>Discourse.</h3>
                                <div className="flex items-center gap-6">
                                    <LikeButton postId={post.id} initialLikes={likeCount} userHasLiked={userHasLiked} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-900 px-2 py-1">Logs: {comments.length}</span>
                                </div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-900 p-6 md:p-12">
                                <CommentsSection
                                    postId={post.id}
                                    comments={comments}
                                    currentUserProfile={viewerData?.profile ?? null}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <ScrollToTop />
        </motion.article>
    );
}