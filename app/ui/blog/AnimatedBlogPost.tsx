// @/app/ui/blog/AnimatedBlogPost.tsx
'use client';

import { motion, Variants, AnimatePresence } from "framer-motion";
import { Eye, Calendar, ArrowUp, Crown, Star, AlertTriangle, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import MovieInfoCard from "@/app/ui/blog/MovieInfoCard";
import LikeButton from "@/app/ui/blog/LikeButton";
import CommentsSection from "@/app/ui/blog/CommentsSection";
import { Post, Movie, CommentWithAuthor, UserProfile } from "@/lib/definitions";
import DOMPurify from 'isomorphic-dompurify';
import { useState } from 'react';

// Animation variants (keeping existing ones + new ones)
const pageVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1
        }
    }
};

const heroVariants: Variants = {
    initial: {
        opacity: 0,
        scale: 1.1
    },
    animate: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

const titleVariants: Variants = {
    initial: {
        opacity: 0,
        y: 50
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            delay: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

const pillVariants: Variants = {
    initial: {
        opacity: 0,
        y: 30,
        scale: 0.9
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            delay: 0.5,
            ease: "backOut"
        }
    },
    hover: {
        scale: 1.05,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        transition: { duration: 0.2 }
    }
};

const contentVariants: Variants = {
    initial: {
        opacity: 0,
        y: 60
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            delay: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
        }
    }
};

const separatorVariants: Variants = {
    initial: {
        width: 0,
        opacity: 0
    },
    animate: {
        width: "6rem",
        opacity: 1,
        transition: {
            duration: 0.8,
            delay: 0.6,
            ease: "easeOut"
        }
    }
};

// 🔥 NEW: NSFW Warning Screen Variants
const nsfwOverlayVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.5, ease: "easeInOut" }
    }
};

const nsfwContentVariants: Variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
        scale: 1,
        opacity: 1,
        transition: {
            delay: 0.2,
            duration: 0.6,
            ease: "backOut"
        }
    }
};

// 🔥 NEW: Rating Component
const StarRating = ({ rating }: { rating: number }) => {
    return (
        <motion.div
            className="flex items-center gap-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <motion.div
                    key={star}
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{
                        delay: 0.8 + (star * 0.1),
                        duration: 0.5,
                        ease: "backOut"
                    }}
                    whileHover={{ scale: 1.2, rotate: 15 }}
                >
                    <Star
                        size={16}
                        className={`${
                            star <= rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                        } transition-colors duration-200`}
                    />
                </motion.div>
            ))}
            <span className="ml-2 text-sm font-medium text-white/90">
                {rating}/5
            </span>
        </motion.div>
    );
};

// 🔥 NEW: Premium Badge Component
const PremiumBadge = () => {
    return (
        <motion.div
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease: "backOut" }}
            whileHover={{
                scale: 1.05,
                boxShadow: "0 8px 25px -8px rgba(245, 158, 11, 0.5)"
            }}
        >
            <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <Crown size={16} />
            </motion.div>
            PREMIUM
        </motion.div>
    );
};

// 🔥 NEW: NSFW Warning Screen Component
const NSFWWarning = ({ onAccept, onReject }: { onAccept: () => void, onReject: () => void }) => {
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[100]"
                variants={nsfwOverlayVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                {/* Sexy background effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full"
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                    <motion.div
                        className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-orange-500/20 to-red-500/20 rounded-full"
                        animate={{
                            rotate: [360, 0],
                            scale: [1.2, 1, 1.2],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </div>

                <motion.div
                    className="relative max-w-md mx-auto p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 text-center text-white shadow-2xl"
                    variants={nsfwContentVariants}
                >
                    {/* Warning Icon */}
                    <motion.div
                        className="flex justify-center mb-6"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.4, duration: 0.8, ease: "backOut" }}
                    >
                        <div className="p-4 bg-red-500/20 rounded-full">
                            <AlertTriangle size={48} className="text-red-400" />
                        </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                        className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        Adult Content Warning
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        className="text-gray-300 mb-8 text-lg leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        This content is intended for mature audiences only.
                        You must be 18 or older to proceed.
                    </motion.p>

                    {/* Buttons */}
                    <motion.div
                        className="flex gap-4 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <motion.button
                            onClick={onAccept}
                            className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -3px rgba(239, 68, 68, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            I&apos;m 18+ - Continue
                        </motion.button>

                        <motion.button
                            onClick={onReject}
                            className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-full hover:bg-gray-700 transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Go Back
                        </motion.button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const ScrollToTop = () => {
    return (
        <motion.button
            className="fixed bottom-8 right-8 z-50 p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl"
            whileHover={{
                scale: 1.1,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 20 }}
        >
            <ArrowUp size={20} />
        </motion.button>
    );
};

const FloatingStats = ({ viewCount }: { viewCount: number }) => {
    return (
        <motion.div
            className="flex items-center gap-2 text-sm text-white/90"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
                <Eye size={16} />
            </motion.div>
            <span className="font-medium">
                {viewCount.toLocaleString()} views
            </span>
        </motion.div>
    );
};

interface AnimatedBlogPostProps {
    post: Post;
    author: Pick<UserProfile, 'username' | 'display_name' | 'profile_pic_url'>;
    movie?: Movie | null;
    likeCount: number;
    userHasLiked: boolean;
    comments: CommentWithAuthor[];
    viewerData: { profile: UserProfile | null } | null;
    nsfw: boolean;
    premium: boolean;
    rating?: number;
}

export default function AnimatedBlogPost({
                                             post,
                                             author,
                                             movie,
                                             likeCount,
                                             userHasLiked,
                                             comments,
                                             viewerData,
                                             nsfw,
                                             premium,
                                             rating
                                         }: AnimatedBlogPostProps) {

    const [nsfwAccepted, setNsfwAccepted] = useState(!nsfw);
    const sanitizedHtml = DOMPurify.sanitize(post.content_html);

    // 🔥 NSFW handlers
    const handleNsfwAccept = () => {
        setNsfwAccepted(true);
    };

    const handleNsfwReject = () => {
        window.history.back();
    };

    // 🔥 Show NSFW warning if not accepted
    if (nsfw && !nsfwAccepted) {
        return <NSFWWarning onAccept={handleNsfwAccept} onReject={handleNsfwReject} />;
    }

    return (
        <motion.article
            className="min-h-screen bg-white dark:bg-black relative overflow-hidden"
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            {/* Floating background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full"
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
                <motion.div
                    className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full"
                    animate={{
                        rotate: [360, 0],
                        scale: [1.2, 1, 1.2],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </div>

            {/* 🔥 Premium Badge - Top Left */}
            {premium && (
                <div className="fixed top-8 left-8 z-50">
                    <PremiumBadge />
                </div>
            )}

            {/* Hero Banner Section */}
            <motion.div
                className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden"
                variants={heroVariants}
            >
                {post.banner_url ? (
                    <>
                        <motion.div
                            className="absolute inset-0 z-0"
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        >
                            <Image
                                src={post.banner_url}
                                alt={`Banner for ${post.title}`}
                                fill
                                className="object-cover"
                                priority
                            />
                        </motion.div>

                        <motion.div
                            className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.3 }}
                        />
                        <motion.div
                            className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white dark:from-black to-transparent z-2"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                        />
                    </>
                ) : (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-800 dark:to-zinc-700 z-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    />
                )}

                {/* 🔥 Enhanced floating stats with rating */}
                <div className="absolute top-8 right-8 z-10 flex flex-col gap-4 items-end">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1, duration: 0.6 }}
                    >
                        <FloatingStats viewCount={post.view_count} />
                    </motion.div>

                    {/* Rating Display */}
                    {rating && rating > 0 && (
                        <StarRating rating={rating} />
                    )}
                </div>

                <header className="absolute bottom-0 left-0 z-10 w-full p-6 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        <motion.h1
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
                            variants={titleVariants}
                        >
                            {post.title}
                        </motion.h1>

                        <motion.div
                            className="flex items-center gap-4 bg-black/20 backdrop-blur-sm rounded-full py-3 px-5 w-fit border border-white/10"
                            variants={pillVariants}
                            whileHover="hover"
                        >
                            <Link href={`/profile/${author.username}`}>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <Image
                                        src={author.profile_pic_url || '/placeholder-user.jpg'}
                                        alt={author.display_name}
                                        width={48}
                                        height={48}
                                        className="h-12 w-12 rounded-full object-cover border-2 border-white/30 hover:border-white/50 transition-all duration-200"
                                    />
                                </motion.div>
                            </Link>
                            <div className="text-left">
                                <motion.p
                                    className="font-semibold text-white"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <Link href={`/profile/${author.username}`} className="hover:underline">
                                        {author.display_name}
                                    </Link>
                                </motion.p>
                                <motion.div
                                    className="flex items-center gap-2 text-sm text-white/80"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <Calendar size={14} />
                                    <span>
                                        {new Date(post.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}
                                    </span>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </header>
            </motion.div>

            <motion.div
                className="relative max-w-4xl mx-auto px-4 md:px-6 z-10"
                variants={contentVariants}
            >
                <div className="flex justify-center -mt-6 mb-12">
                    <motion.div
                        className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        variants={separatorVariants}
                    />
                </div>

                <motion.div
                    className="prose prose-lg dark:prose-invert max-w-none mb-8"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />

                {post.type === 'review' && post.movie_id && movie && (
                    <motion.div
                        className="mt-8"
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1 }}
                        whileHover={{ y: -4 }}
                    >
                        <MovieInfoCard
                            movieApiId={post.movie_id}
                            initialMovieData={movie}
                        />
                    </motion.div>
                )}

                <motion.div
                    className="mt-8 pt-6 p-6 border rounded-xl border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-zinc-900/50 dark:to-zinc-800/50 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.1 }}
                    whileHover={{
                        scale: 1.02,
                        boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                    }}
                >
                    <LikeButton postId={post.id} initialLikes={likeCount} userHasLiked={userHasLiked} />
                    <motion.p
                        className="text-sm font-medium text-gray-500 dark:text-zinc-400 flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                    >
                        <Eye size={16} />
                        {post.view_count.toLocaleString()} views
                    </motion.p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.3 }}
                >
                    <CommentsSection
                        postId={post.id}
                        comments={comments}
                        currentUserProfile={viewerData?.profile ?? null}
                    />
                </motion.div>
            </motion.div>

            <ScrollToTop />
        </motion.article>
    );
}