'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CinematicSearchResult } from '@/lib/definitions';
import MediaInfoCard from '@/app/ui/blog/MediaInfoCard';
import clsx from 'clsx';

export default function TrendingStars({ people }: { people: CinematicSearchResult[] }) {
    const [selectedStar, setSelectedStar] = useState<CinematicSearchResult | null>(null);

    // ✨ HELPER: Construct full URL
    const getFullImageUrl = (path?: string | null) =>
        path ? `https://image.tmdb.org/t/p/w500${path}` : null;

    // 1. Prepare Data: Double list for infinite loop
    // Slicing to top 15 ensures high quality, duplication creates the loop
    const topStars = people.slice(0, 15);
    const marqueeList = [...topStars, ...topStars];

    return (
        <div className="w-full py-8 space-y-6">

            {/* Optional Header (Uncomment if needed) */}
            {/* <h2 className="px-4 text-sm font-medium tracking-widest text-zinc-500 uppercase">Trending Actors</h2> */}

            {/* --- MARQUEE CONTAINER --- */}
            <div className="relative w-full overflow-hidden select-none">

                {/* Side Fade Gradients (The "Fog" Effect) */}
                <div className="absolute left-0 top-0 bottom-0 z-20 w-12 md:w-32 bg-gradient-to-r from-white to-transparent dark:from-zinc-950 dark:to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 z-20 w-12 md:w-32 bg-gradient-to-l from-white to-transparent dark:from-zinc-950 dark:to-transparent pointer-events-none" />

                <div className="flex w-max gap-4 md:gap-6 animate-marquee hover:[animation-play-state:paused]">
                    {marqueeList.map((person, index) => (
                        <div
                            key={`${person.id}-${index}`}
                            onClick={() => setSelectedStar(person)}
                            className="group relative flex-shrink-0 cursor-pointer"
                        >
                            {/* Card Container */}
                            <div className="relative w-36 h-52 md:w-44 md:h-64 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-900 shadow-sm transition-transform duration-500 ease-out group-hover:-translate-y-2">

                                {/* Image Layer */}
                                {person.profile_path ? (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                                        alt={person.name || 'Actor'}
                                        fill
                                        sizes="(max-width: 768px) 150px, 200px"
                                        className={clsx(
                                            "object-cover transition-all duration-700 ease-out",
                                            "filter grayscale opacity-90 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100"
                                        )}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                                        <span className="text-xs uppercase tracking-widest">No Image</span>
                                    </div>
                                )}

                                {/* Gradient Overlay (Text Legibility) */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                                {/* Text Content (Overlay) */}
                                <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-white text-sm md:text-base font-semibold leading-tight truncate drop-shadow-md">
                                        {person.name}
                                    </p>
                                    <p className="text-zinc-400 text-[10px] uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                        {person.known_for_department || 'Artist'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- MEDIA MODAL --- */}
            {selectedStar && (
                <MediaInfoCard
                    tmdbId={selectedStar.id}
                    mediaType="person"
                    initialData={{
                        tmdb_id: selectedStar.id,
                        title: selectedStar.name || selectedStar.title,
                        poster_url: getFullImageUrl(selectedStar.profile_path || selectedStar.poster_path),
                        release_date: selectedStar.known_for_department || 'Artist',
                        backdrop_url: getFullImageUrl(selectedStar.profile_path || selectedStar.poster_path)
                    }}
                    isOpen={!!selectedStar}
                    onClose={() => setSelectedStar(null)}
                />
            )}

            {/* --- INLINE CSS FOR MARQUEE ANIMATION --- */}
            <style jsx>{`
                @keyframes scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: scroll 80s linear infinite; /* Slowed down to 80s for elegance */
                }
            `}</style>
        </div>
    );
}