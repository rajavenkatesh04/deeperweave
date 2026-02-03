'use client';

import { useProfileHome } from '@/hooks/api/use-profile-home';
import ProfileItemCard, { UnifiedProfileItem } from './ProfileItemCard';
import Link from 'next/link';
import { MdOutlineLeaderboard, MdAdd, MdOutlineSentimentDissatisfied } from 'react-icons/md';
import { PodiumSkeleton } from "@/app/ui/skeletons";

export default function ProfileSectionDisplay({
                                                  username,
                                                  isOwnProfile
                                              }: {
    username: string;
    isOwnProfile: boolean;
}) {
    const { data: sections, isLoading } = useProfileHome(username);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center">
                <PodiumSkeleton />
                <p className="text-zinc-400 text-sm">Loading Podium...</p>
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
        <div className="flex flex-col gap-18 md:gap-32">
            {sections.map((section, idx) => (
                <section key={section.id} className="max-w-5xl mx-auto md:px-8 w-full">

                    {/* --- HEADER --- */}
                    <div className="mb-10 md:mb-12">
                        <div className="flex items-baseline gap-4 md:gap-8">
                            <div className="flex flex-col w-full">
                                <div className="flex items-center gap-6 w-full">
                                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-thin font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
                                        {section.title}
                                    </h2>
                                    <div className="flex-grow h-px bg-zinc-300/60 dark:bg-zinc-700/60 mt-4" />
                                </div>
                            </div>
                            <span className="text-5xl md:text-8xl font-black tracking-tighter opacity-30 select-none leading-none">
                                {String(idx + 1).padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    {/* --- GRID --- */}
                    <div className="grid grid-cols-3 gap-2.5 md:gap-8 lg:gap-10 justify-items-center">
                        {section.items.map((itemRow: any) => {
                            // 1. Normalize the data
                            const uiItem = normalizeItem(itemRow);
                            if (!uiItem) return null;

                            return (
                                <div key={itemRow.id} className="w-full">
                                    {/* 2. Pass to Card */}
                                    <ProfileItemCard
                                        item={uiItem}
                                        rank={itemRow.rank}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
}

// ... (Imports and Component remain the same) ...

// ✨ ROBUST FIX: Handle Arrays, Missing Data, and ID Extraction
function normalizeItem(itemRow: any): UnifiedProfileItem | null {
    const type = itemRow.item_type;

    // 1. Extract Joined Data
    // Supabase might return an object OR an array of 1 object. We handle both.
    const rawData = itemRow.movie || itemRow.series || itemRow.person;
    const data = Array.isArray(rawData) ? rawData[0] : rawData;

    // 2. Safety Check: If the linked movie/person was deleted, data might be null
    if (!data) return null;

    return {
        id: itemRow.id, // Keep Database ID for keys

        // 3. ✨ EXTRACT TMDB ID
        // Since we fetched (*), this column is guaranteed to exist if the record exists.
        tmdbId: data.tmdb_id,

        title: data.title || data.name,
        image_url: (data.poster_url || data.profile_path)
            ? `https://image.tmdb.org/t/p/w500${data.poster_url || data.profile_path}`
            : null,
        subtitle: type === 'person'
            ? data.known_for_department
            : data.release_date ? new Date(data.release_date).getFullYear().toString() : '',
        type: type,
    };
}