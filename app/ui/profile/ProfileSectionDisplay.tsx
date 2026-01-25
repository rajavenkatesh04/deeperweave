'use client';

import { useState } from 'react';
import { Movie, Series, Person, ProfileSection } from '@/lib/definitions';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import ProfileItemCard from './ProfileItemCard';

// Shared type definition
export type UnifiedProfileItem = {
    id: number | string;
    title: string;
    image_url: string | null;
    subtitle: string;
    type: 'movie' | 'tv' | 'person';
    originalObject: Movie | Series | Person;
};

export default function ProfileSectionDisplay({ sections }: { sections: ProfileSection[] }) {
    if (!sections || sections.length === 0) return null;

    return (
        <div className="space-y-24 pb-24">
            {sections.map((section) => (
                <section key={section.id} className="w-full">

                    {/* --- Section Header --- */}
                    <div className="max-w-5xl mx-auto px-4 md:px-0 mb-8 flex flex-col md:flex-row md:items-end gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] md:text-xs font-mono font-medium text-zinc-500 uppercase tracking-widest">
                                {section.type === 'mixed' ? 'Collection' : `${section.type} Archive`}
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
                                {section.title}
                            </h2>
                        </div>
                    </div>

                    {/* --- Content Layout --- */}

                    {/* 1. Mobile: Horizontal Scroll */}
                    <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-8 -mx-4 scrollbar-hide">
                        {section.items.map((itemRow) => {
                            const uiItem = normalizeItem(itemRow);
                            if (!uiItem) return null;
                            return (
                                <div key={itemRow.id} className="snap-center shrink-0 w-[40vw]"> {/* Slightly smaller on mobile for peek effect */}
                                    <ProfileItemCard
                                        item={uiItem}
                                        rank={itemRow.rank}
                                    />
                                </div>
                            );
                        })}
                        <div className="w-4 shrink-0" />
                    </div>

                    {/* 2. Desktop: Constrained Grid */}
                    <div className="hidden md:grid max-w-5xl mx-auto grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {section.items.map((itemRow) => {
                            const uiItem = normalizeItem(itemRow);
                            if (!uiItem) return null;
                            return (
                                <ProfileItemCard
                                    key={itemRow.id}
                                    item={uiItem}
                                    rank={itemRow.rank}
                                />
                            );
                        })}
                    </div>

                </section>
            ))}
        </div>
    );
}

// ... normalizeItem helper remains the same ...
function normalizeItem(itemRow: any): UnifiedProfileItem | null {
    if (itemRow.item_type === 'movie' && itemRow.movie) {
        return {
            id: itemRow.movie.tmdb_id,
            title: itemRow.movie.title,
            image_url: itemRow.movie.poster_url ? `https://image.tmdb.org/t/p/w500${itemRow.movie.poster_url}` : null,
            subtitle: `${new Date(itemRow.movie.release_date).getFullYear() || 'Unknown'}`,
            type: 'movie',
            originalObject: itemRow.movie
        };
    } else if (itemRow.item_type === 'tv' && itemRow.series) {
        return {
            id: itemRow.series.tmdb_id,
            title: itemRow.series.title,
            image_url: itemRow.series.poster_url ? `https://image.tmdb.org/t/p/w500${itemRow.series.poster_url}` : null,
            subtitle: `${new Date(itemRow.series.release_date).getFullYear() || 'Unknown'}`,
            type: 'tv',
            originalObject: itemRow.series
        };
    } else if (itemRow.item_type === 'person' && itemRow.person) {
        return {
            id: itemRow.person.tmdb_id,
            title: itemRow.person.name,
            image_url: itemRow.person.profile_path ? `https://image.tmdb.org/t/p/w500${itemRow.person.profile_path}` : null,
            subtitle: itemRow.person.known_for_department?.toUpperCase() || 'Artist',
            type: 'person',
            originalObject: itemRow.person
        };
    }
    return null;
}