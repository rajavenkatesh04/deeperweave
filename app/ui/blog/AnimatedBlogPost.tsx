'use client';

import { motion, Variants, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
    Eye,
    ArrowUp,
    Film,
    ExternalLink,
    ChevronLeft,
    Lock,
    MessageSquare,
    User, ArrowRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';

// Check if these paths are correct in your project structure
import MediaInfoCard from "@/app/ui/blog/MediaInfoCard";
import LikeButton from "@/app/ui/blog/LikeButton";
import CommentsSection from "@/app/ui/blog/CommentsSection";
import { SpoilerBadge, NsfwBadge, PremiumBadge } from "@/app/ui/blog/BlogPostBadges";

// --- ANIMATION VARIANTS ---
const pageVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

const contentVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }
};

const ScrollToTop = () => {
    return (
        <motion.button
            className="fixed bottom-6 right-6 z-40 p-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black rounded-full shadow-lg hover:scale-110 transition-transform"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.9 }}
        >
            <ArrowUp size={20} />
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
    const [showContent, setShowContent] = useState(!nsfw);
    const [isCinematicModalOpen, setIsCinematicModalOpen] = useState(false);

    const { scrollY } = useScroll();
    // Adjusted opacity logic since navbar is now "solid" visually due to padding
    const navTitleOpacity = useTransform(scrollY, [300, 400], [0, 1]);

    // Since we moved the banner down, we might want the navbar background to be always visible
    // or blend in. I've kept the transition but it will sit over the white/black page background now.
    const navBackgroundOpacity = useTransform(scrollY, [0, 100], [0, 1]);

    const sanitizedHtml = DOMPurify.sanitize(post.content_html);
    const cinematicItem = movie || series;
    const mediaType = movie ? 'movie' : 'tv';

    useEffect(() => {
        if (post?.title) {
            document.title = `${post.title} | Deeper Weave`;
        }
    }, [post?.title]);

    // Format date simply (e.g., "October 24, 2024")
    const dateStr = new Date(post.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <motion.article
            // Added pt-16 here to push all content (including Hero) down below the fixed navbar
            className="min-h-screen pt-16 bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800"
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            {/* --- NAV BAR --- */}
            <motion.nav
                // Logic: The navbar is fixed. Because we added pt-16 to the article,
                // the navbar now sits over the whitespace created by that padding.
                style={{ backgroundColor: `rgba(var(--background-rgb), ${navBackgroundOpacity})` }}
                className="fixed top-0 left-0 right-0 z-[60] h-16 flex items-center px-4 md:px-8 border-b border-transparent data-[scrolled=true]:border-zinc-200 dark:data-[scrolled=true]:border-zinc-900 transition-colors"
            >
                {/* Background blur */}
                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-md -z-10" />

                <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                        <ChevronLeft size={20} />
                        <span className="text-sm font-medium">Back</span>
                    </button>

                    <motion.div
                        style={{ opacity: navTitleOpacity }}
                        className="flex-1 flex justify-center px-4 overflow-hidden"
                    >
                        <span className="text-sm font-semibold truncate text-zinc-900 dark:text-white">
                            {post.title}
                        </span>
                    </motion.div>

                    <div className="w-[60px]" />
                </div>
            </motion.nav>

            {/* --- HERO SECTION --- */}
            {/* Increased height to h-[60vh] / md:h-[80vh] to make it look "proper" and larger */}
            <div className="relative w-full h-[60vh] md:h-[80vh] flex flex-col justify-end overflow-hidden bg-zinc-50 dark:bg-zinc-950">
                {post.banner_url && (
                    <div className="absolute inset-0">
                        <Image
                            src={post.banner_url}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-[2s] hover:scale-105 opacity-100 dark:opacity-60"
                            priority
                        />
                        {/* UPDATED GRADIENT:
                           1. Removed `from-white via-white/40` so light mode is clean (transparent).
                           2. Kept `dark:from-black...` so dark mode still has the fade for text readability.
                        */}
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent dark:from-black dark:via-black/60 dark:to-transparent" />
                    </div>
                )}

                <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-10 md:pb-16">
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Added a slight text shadow or background for light mode readability now that white fade is gone */}
                            <span className="text-zinc-900/80 dark:text-zinc-400 text-xs md:text-sm font-medium px-2 py-1 bg-white/50 dark:bg-transparent rounded-md backdrop-blur-sm dark:backdrop-blur-none">
                                {dateStr}
                            </span>
                            {(post.is_premium || post.is_nsfw || post.has_spoilers) && (
                                <div className="flex gap-2 scale-90 origin-left">
                                    {post.is_premium && <PremiumBadge />}
                                    {post.is_nsfw && <NsfwBadge />}
                                    {post.has_spoilers && <SpoilerBadge />}
                                </div>
                            )}
                        </div>

                        {/* Added explicit text shadow class for better readability on raw images in Light Mode */}
                        <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white max-w-3xl drop-shadow-sm dark:drop-shadow-none">
                            {post.title}
                        </h1>

                        {rating && (
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 w-6 rounded-full shadow-sm ${i < rating ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-300/80 dark:bg-zinc-800'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- CONTENT WRAPPER --- */}
            <div className="relative max-w-5xl mx-auto px-6 py-12 md:py-16">

                {/* --- NSFW GATE --- */}
                <AnimatePresence>
                    {nsfw && !showContent && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-x-0 top-0 z-20 h-[500px] flex flex-col items-center justify-center bg-white/90 dark:bg-black/90 backdrop-blur-sm text-center px-4"
                        >
                            <Lock className="w-10 h-10 mb-4 text-zinc-400" />
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                                Sensitive Content
                            </h2>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 max-w-md">
                                This post contains material that may not be suitable for all audiences.
                            </p>
                            <button
                                onClick={() => setShowContent(true)}
                                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-sm font-medium rounded-lg transition-colors"
                            >
                                View Content
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

                    {/* --- MAIN CONTENT (Left/Center) --- */}
                    <motion.div
                        className={`lg:col-span-8 space-y-12 transition-all duration-500 ${!showContent ? 'blur-sm opacity-50 h-[400px] overflow-hidden' : ''}`}
                        variants={contentVariants}
                    >
                        {/* Prose / Body Text */}
                        <div
                            className="
                                prose prose-lg prose-zinc dark:prose-invert max-w-none
                                prose-headings:font-serif prose-headings:font-semibold

                                /* Updated Font Weight: Normal instead of Light */
                                prose-p:font-normal prose-p:leading-8
                                prose-p:text-zinc-800 dark:prose-p:text-zinc-300

                                prose-a:text-zinc-900 dark:prose-a:text-white prose-a:no-underline hover:prose-a:underline

                                /* Image Fixes */
                                [&_img]:max-w-full [&_img]:w-auto [&_img]:mx-auto [&_img]:rounded-lg [&_img]:shadow-sm
                                [&_img]:max-h-[350px]
                                md:[&_img]:max-h-[550px]

                                /* First Letter */
                                first-letter:text-4xl first-letter:font-serif first-letter:font-bold
                                first-letter:mr-2 first-letter:float-left text-zinc-900 dark:text-white
                            "
                            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                        />

                        {/* --- POST META FOOTER --- */}
                        <aside className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-6">

                            {/* 1. Cinematic Card (Review Only) */}
                            {post.type === 'review' && cinematicItem && (
                                <div className="flex flex-col gap-3">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-1">
                                        In this post
                                    </h3>

                                    <div
                                        onClick={() => setIsCinematicModalOpen(true)}
                                        className="group cursor-pointer flex gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all bg-zinc-50 dark:bg-zinc-900/30"
                                    >
                                        {/* Poster - Standardized Aspect Ratio Container */}
                                        <div className="relative w-16 h-24 sm:w-20 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shadow-sm">
                                            {cinematicItem.poster_url ? (
                                                <Image src={cinematicItem.poster_url} alt="" fill className="object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <Film className="w-6 h-6 text-zinc-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col justify-center min-w-0">
                                            <h4 className="font-serif text-lg md:text-xl font-bold text-zinc-900 dark:text-white truncate group-hover:underline decoration-1 underline-offset-4">
                                                {cinematicItem.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                                <span className="capitalize">{mediaType === 'movie' ? 'Film' : 'Series'}</span>
                                                <span>•</span>
                                                <span>{new Date(cinematicItem.release_date).getFullYear()}</span>
                                            </div>
                                            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-zinc-900 dark:text-zinc-300">
                                                View Details <ExternalLink size={12} />
                                            </div>
                                        </div>
                                    </div>

                                    <MediaInfoCard
                                        tmdbId={cinematicItem.tmdb_id}
                                        initialData={cinematicItem}
                                        mediaType={mediaType}
                                        isOpen={isCinematicModalOpen}
                                        onClose={() => setIsCinematicModalOpen(false)}
                                    />
                                </div>
                            )}

                            {/* 2. Mobile Author Card (Horizontal Variant) */}
                            <div className="block lg:hidden flex flex-col gap-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 pl-1">
                                    Written By
                                </h3>

                                <Link
                                    href={`/profile/${author.username}`}
                                    className="group block relative w-full"
                                >
                                    <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all bg-zinc-50 dark:bg-zinc-900/30">

                                        {/* Avatar - Matches Poster Container styling logic */}
                                        <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm group-hover:scale-105 transition-transform">
                                            <Image
                                                src={author.profile_pic_url || '/placeholder-user.jpg'}
                                                alt={author.display_name || "Author"}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Content - Matches Cinematic Text Alignment */}
                                        <div className="flex flex-col justify-center min-w-0">
                                            <h4 className="font-serif text-lg font-bold text-zinc-900 dark:text-white group-hover:underline decoration-zinc-400 underline-offset-4 decoration-1">
                                                {author.display_name}
                                            </h4>
                                            <p className="text-sm font-medium text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-400 transition-colors">
                                                @{author.username}
                                            </p>
                                            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                                                View Profile <ArrowRight size={12} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </aside>

                        {/* Interaction & Comments Section */}
                        <div className="pt-2 space-y-8">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <h3 className="font-serif text-2xl font-bold text-zinc-900 dark:text-white">
                                    Discussion
                                </h3>
                                <div className="flex items-center gap-6">
                                    <LikeButton postId={post.id} initialLikes={likeCount} userHasLiked={userHasLiked} />

                                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                        <MessageSquare size={18} />
                                        <span>{comments.length}</span>
                                    </div>

                                    {/* MOVED: Views now sit here */}
                                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                        <Eye size={18} />
                                        <span>{post.view_count.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <CommentsSection
                                postId={post.id}
                                comments={comments}
                                currentUserProfile={viewerData?.profile ?? null}
                            />
                        </div>
                    </motion.div>

                    {/* --- SIDEBAR (Desktop Only - lg:block) --- */}
                    <div className="hidden lg:block lg:col-span-4 lg:pl-8 lg:border-l border-zinc-100 dark:border-zinc-800">
                        <div className="lg:sticky lg:top-24 space-y-8">

                            {/* Author Profile */}
                            <div className="text-center space-y-4">
                                <Link href={`/profile/${author.username}`} className="block relative group">
                                    <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-400 transition-colors">
                                        <Image
                                            src={author.profile_pic_url || '/placeholder-user.jpg'}
                                            alt={author.display_name || "Author"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </Link>
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Written By</p>
                                    <Link href={`/profile/${author.username}`} className="text-lg font-bold text-zinc-900 dark:text-white hover:underline">
                                        {author.display_name}
                                    </Link>
                                    <p className="text-sm text-zinc-500">@{author.username}</p>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <ScrollToTop />
        </motion.article>
    );
}