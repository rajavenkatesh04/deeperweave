'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useProfileHome } from '@/hooks/api/use-profile-home';
import ProfileItemCard, { UnifiedProfileItem } from './ProfileItemCard';
import ContentGuard from '@/app/ui/shared/ContentGuard';
import { createClient } from '@/utils/supabase/client';
import { MdOutlineLeaderboard, MdAdd, MdOutlineSentimentDissatisfied, MdShare } from 'react-icons/md';
import { PodiumSkeleton } from "@/app/ui/skeletons";
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

export default function ProfileSectionDisplay({
                                                  username,
                                                  isOwnProfile
                                              }: {
    username: string;
    isOwnProfile: boolean;
}) {
    const { data: sections, isLoading } = useProfileHome(username);
    const [isSFW, setIsSFW] = useState(true);
    const [canShare, setCanShare] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Two refs: one for viewing, one hidden for generating the 9:16 story
    const hiddenStoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user?.user_metadata) {
                const pref = user.user_metadata.content_preference || 'sfw';
                setIsSFW(pref === 'sfw');

                // Check subscription status
                const status = user.user_metadata.subscription_status || 'free';
                setCanShare(status !== 'free');
            }
        };
        fetchUserData();
    }, []);

    const handleShare = useCallback(async () => {
        if (!hiddenStoryRef.current) return;
        setIsGenerating(true);

        try {
            // Wait a brief moment for the hidden element to fully render images
            await new Promise((resolve) => setTimeout(resolve, 500));

            const dataUrl = await toPng(hiddenStoryRef.current, {
                cacheBust: true,
                width: 1080,
                height: 1920,
                pixelRatio: 1, // 1 is enough for 1080x1920
                backgroundColor: '#09090b', // Default dark background for the image file itself
            });

            const link = document.createElement('a');
            link.download = `story_${username}_podium.png`;
            link.href = dataUrl;
            link.click();
            toast.success('Story saved to photos');
        } catch (err) {
            console.error('Generation failed:', err);
            toast.error('Failed to generate image');
        } finally {
            setIsGenerating(false);
        }
    }, [username]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center">
                <PodiumSkeleton />
                <p className="text-zinc-400 text-sm mt-4">Loading Podium...</p>
            </div>
        );
    }

    if (!sections || sections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-full mb-6 border border-zinc-100 dark:border-zinc-800">
                    {isOwnProfile ? (
                        <MdOutlineLeaderboard className="w-8 h-8 text-zinc-400" />
                    ) : (
                        <MdOutlineSentimentDissatisfied className="w-8 h-8 text-zinc-400" />
                    )}
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    {isOwnProfile ? "The Podium is Empty" : "No Ranks Yet"}
                </h3>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-8 leading-relaxed">
                    {isOwnProfile
                        ? "Start building your personal hall of fame. Add movies, shows, or people to showcase your taste."
                        : `${username} hasn't added any sections to their podium yet.`
                    }
                </p>

                {isOwnProfile && (
                    <Link
                        href="/profile/edit"
                        className="group flex items-center gap-2 px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-sm font-bold transition-all hover:bg-zinc-800 dark:hover:bg-white hover:scale-105"
                    >
                        <MdAdd className="w-4 h-4" />
                        <span>Customize Podium</span>
                    </Link>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-10">
                {/* Share Button (Gated) */}
                {canShare && (
                    <div className="flex justify-end px-4 md:px-0">
                        <button
                            onClick={handleShare}
                            disabled={isGenerating}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <span className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"/>
                            ) : (
                                <MdShare className="w-4 h-4" />
                            )}
                            <span>{isGenerating ? 'Generating Story...' : 'Share Story'}</span>
                        </button>
                    </div>
                )}

                {/* --- VISIBLE PODIUM (Standard Layout) --- */}
                <div className="flex flex-col gap-18 md:gap-32 md:p-8">
                    {sections.map((section, idx) => (
                        <PodiumSection key={section.id} section={section} idx={idx} isSFW={isSFW} />
                    ))}
                </div>
            </div>

            {/* --- HIDDEN STORY GENERATOR (Fixed 1080x1920) --- */}
            {/* This renders strictly for the screenshot, off-screen */}
            {isGenerating && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: '-9999px',
                        width: '1080px',
                        height: '1920px',
                        zIndex: -1,
                    }}
                >
                    <div
                        ref={hiddenStoryRef}
                        className="w-full h-full bg-zinc-950 text-white p-12 flex flex-col relative"
                    >
                        {/* Story Header */}
                        <div className="flex justify-between items-center mb-16 opacity-60">
                            <span className="text-2xl font-bold tracking-widest uppercase">deeperweave</span>
                            <span className="text-xl font-medium">@{username}</span>
                        </div>

                        {/* Story Content - Centered */}
                        <div className="flex-1 flex flex-col justify-center gap-20">
                            {/* We limit to top 2 sections for a cleaner story fit, or map all if they fit */}
                            {sections.slice(0, 2).map((section, idx) => (
                                <PodiumSection
                                    key={section.id}
                                    section={section}
                                    idx={idx}
                                    isSFW={isSFW}
                                    isStoryMode={true} // Special prop to tweak layout for 9:16
                                />
                            ))}
                        </div>

                        {/* Footer decorative */}
                        <div className="mt-auto pt-10 border-t border-white/10 flex justify-center">
                            <p className="text-lg text-white/40 font-light tracking-wide">My Personal Rankings</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// --- SUB COMPONENTS ---

function PodiumSection({
                           section,
                           idx,
                           isSFW,
                           isStoryMode = false
                       }: {
    section: any,
    idx: number,
    isSFW: boolean,
    isStoryMode?: boolean
}) {
    return (
        <section className={`w-full ${isStoryMode ? '' : 'max-w-5xl mx-auto md:px-8'}`}>
            <div className="mb-10 md:mb-12">
                <div className="flex items-baseline gap-4 md:gap-8">
                    <div className="flex flex-col w-full">
                        <div className="flex items-center gap-6 w-full">
                            <h2 className={`${isStoryMode ? 'text-5xl' : 'text-3xl md:text-5xl lg:text-6xl'} font-thin font-semibold tracking-tight text-inherit leading-tight`}>
                                {section.title}
                            </h2>
                            <div className="flex-grow h-px bg-current opacity-20 mt-4" />
                        </div>
                    </div>
                    <span className={`${isStoryMode ? 'text-6xl' : 'text-5xl md:text-8xl'} font-black tracking-tighter opacity-10 select-none leading-none`}>
                        {String(idx + 1).padStart(2, '0')}
                    </span>
                </div>
            </div>

            <div className={`grid grid-cols-3 gap-2.5 ${isStoryMode ? 'gap-4' : 'md:gap-8 lg:gap-10'} justify-items-center`}>
                {section.items.map((itemRow: any) => {
                    const uiItem = normalizeItem(itemRow);
                    if (!uiItem) return null;

                    return (
                        <div key={itemRow.id} className="w-full relative group/card">
                            <ContentGuard isAdult={uiItem.adult} isSFW={isSFW}>
                                <ProfileItemCard
                                    item={uiItem}
                                    rank={itemRow.rank}
                                />
                            </ContentGuard>
                            {uiItem.adult && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600 shadow-sm pointer-events-none z-20 opacity-50" />
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

// --- HELPERS ---

interface ExtendedUnifiedProfileItem extends UnifiedProfileItem {
    adult: boolean;
}

function normalizeItem(itemRow: any): ExtendedUnifiedProfileItem | null {
    const type = itemRow.item_type;
    const rawData = itemRow.movie || itemRow.series || itemRow.person;
    const data = Array.isArray(rawData) ? rawData[0] : rawData;

    if (!data) return null;

    return {
        id: itemRow.id,
        tmdbId: data.tmdb_id,
        title: data.title || data.name,
        // Using crossOrigin anonymous here via Component is handled in ProfileItemCard ideally,
        // but ensuring full URL is good practice.
        image_url: (data.poster_url || data.profile_path)
            ? `https://image.tmdb.org/t/p/w500${data.poster_url || data.profile_path}`
            : null,
        subtitle: type === 'person'
            ? data.known_for_department
            : data.release_date ? new Date(data.release_date).getFullYear().toString() : '',
        type: type,
        adult: data.adult === true
    };
}