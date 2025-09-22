// @/app/ui/blog/PostCard.tsx

'use client';

// ✨ 1. Import useState
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PostForFeed } from '@/lib/data/blog-data';
import { EyeIcon, HeartIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/solid';
import { gsap } from 'gsap';
import { PremiumBadge, NsfwBadge } from '@/app/ui/blog/badges';

export default function PostCard({ post }: { post: PostForFeed }) {
    const cardRef = useRef<HTMLAnchorElement>(null);
    const bannerRef = useRef<HTMLDivElement>(null);
    const authorInfoRef = useRef<HTMLDivElement>(null);
    const statsInfoRef = useRef<HTMLDivElement>(null);
    const timeline = useRef<gsap.core.Timeline | null>(null);

    // ✨ 2. Add state to track if the view is mobile
    const [isMobile, setIsMobile] = useState(false);

    const likeCount = post.likes[0]?.count || 0;
    const commentCount = post.comments[0]?.count || 0;
    const plainTextContent = post.content_html?.replace(/<[^>]+>/g, '') || '';

    // ✨ 3. This effect now checks for screen size and sets up the correct animation
    useEffect(() => {
        const checkDevice = () => {
            setIsMobile(window.innerWidth < 768); // Tailwind's `md` breakpoint
        };
        // Check on initial load
        checkDevice();
        // Add listener for window resize
        window.addEventListener('resize', checkDevice);

        // Initial GSAP setup
        gsap.set(statsInfoRef.current, { opacity: 0, y: 10 });

        // Kill any existing animations before creating a new one
        timeline.current?.kill();

        if (window.innerWidth < 768) {
            // --- MOBILE ANIMATION ---
            // Infinitely loops back and forth with a 3-second pause between cycles
            timeline.current = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 3 })
                .to(authorInfoRef.current, {
                    opacity: 0,
                    y: -10,
                    duration: 0.5,
                    ease: 'power2.inOut',
                })
                .to(statsInfoRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: 'power2.inOut',
                }, "-=0.3");
        } else {
            // --- DESKTOP ANIMATION ---
            // Paused timeline controlled by hover events
            timeline.current = gsap.timeline({ paused: true })
                .to(authorInfoRef.current, {
                    opacity: 0,
                    y: -10,
                    duration: 0.5,
                    ease: 'power2.inOut',
                })
                .to(statsInfoRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: 'power2.inOut',
                }, "-=0.3");
        }

        // Cleanup function to remove listener and kill animation
        return () => {
            window.removeEventListener('resize', checkDevice);
            timeline.current?.kill();
        };
    }, [isMobile]); // Rerun this effect if isMobile changes

    // ✨ 4. Handlers now check if it's not mobile before running
    const handleMouseEnter = () => {
        if (!isMobile) {
            timeline.current?.play();
            gsap.to(bannerRef.current, { scale: 1.05, duration: 0.6, ease: 'power2.inOut' });
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile) {
            timeline.current?.reverse();
            gsap.to(bannerRef.current, { scale: 1, duration: 0.6, ease: 'power2.inOut' });
        }
    };

    return (
        <Link
            href={`/blog/${post.slug}`}
            ref={cardRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
            {post.banner_url && (
                <div ref={bannerRef} className="relative h-48 w-full overflow-hidden">
                    <Image
                        src={post.banner_url}
                        alt={`Banner for ${post.title}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                    />
                </div>
            )}
            <div className="flex flex-1 flex-col p-6">
                <div className="flex-1">
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 transition-colors group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-sky-400 group-hover:bg-clip-text group-hover:text-transparent">
                        {post.title}
                    </h2>

                    <p className="mt-3 text-base text-gray-600 dark:text-zinc-400 line-clamp-3">
                        {plainTextContent}
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                        {post.is_premium && <PremiumBadge />}
                        {post.is_nsfw && <NsfwBadge />}
                    </div>
                </div>

                <div className="relative mt-6 h-12 border-t border-gray-200 pt-4 dark:border-zinc-800">
                    <div ref={authorInfoRef} className="absolute inset-0 flex items-center gap-3 pt-4">
                        <Image
                            src={post.author.profile_pic_url || '/placeholder-user.jpg'}
                            alt={post.author.display_name}
                            width={40} height={40}
                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-zinc-200">{post.author.display_name}</p>
                            <p className="text-xs text-gray-500 dark:text-zinc-500">@{post.author.username}</p>
                        </div>
                    </div>

                    <div ref={statsInfoRef} className="absolute inset-0 flex items-center justify-between pt-4 text-sm text-gray-500 dark:text-zinc-400">
                        <p className="font-semibold text-gray-800 dark:text-zinc-200">Post Stats</p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5" title={`${likeCount} likes`}><HeartIcon className="h-4 w-4 text-red-500/80" /><span>{likeCount}</span></div>
                            <div className="flex items-center gap-1.5" title={`${commentCount} comments`}><ChatBubbleOvalLeftEllipsisIcon className="h-4 w-4 text-sky-500/80" /><span>{commentCount}</span></div>
                            <div className="flex items-center gap-1.5" title={`${post.view_count} views`}><EyeIcon className="h-4 w-4 text-gray-500/80" /><span>{post.view_count}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}