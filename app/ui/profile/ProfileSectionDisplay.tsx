'use client';

import ProfileItemCard from './ProfileItemCard';
import { UnifiedProfileItem } from './ProfileItemCard';

export default function ProfileSectionDisplay({ sections }: { sections: any[] }) {
    if (!sections || sections.length === 0) return null;

    return (
        <div className="flex flex-col gap-20 md:gap-40 pb-20">
            {sections.map((section, idx) => (
                <section key={section.id} className="max-w-[1400px] mx-auto px-3 md:px-12 w-full">

                    {/* --- HEADER SECTION (Restored Layout, New "Expensive" Style) --- */}
                    <div className="mb-8 md:mb-16">
                        <div className="flex items-baseline gap-4 md:gap-8">
                            <div className="flex flex-col w-full">
                                <div className="flex items-center gap-6 w-full">
                                    <h2
                                        className="
                                            /* Responsive Font Size */
                                            text-[clamp(1.875rem,5vw,4rem)]
                                            font-sans font-bold tracking-tighter whitespace-nowrap pb-2

                                            /* EXPENSIVE LOOK GRADIENT (No Glow) */
                                            /* Light: Deep Zinc to Black | Dark: White to Silver */
                                            bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-800
                                            dark:from-white dark:via-zinc-300 dark:to-zinc-500
                                            bg-clip-text text-transparent

                                            leading-tight
                                        "
                                    >
                                        {section.title}
                                    </h2>

                                    {/* Dotted Line (Restored) */}
                                    <div className="flex-grow border-t-2 border-dotted border-zinc-300 dark:border-zinc-800 self-center mt-2" />
                                </div>
                            </div>

                            {/* Big Number (Restored) */}
                            <span className="text-[clamp(2.5rem,8vw,8rem)] font-black tracking-tighter text-zinc-200 dark:text-zinc-800 italic leading-none">
                                {String(idx + 1).padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    {/* --- GRID (Strict 3 Columns) --- */}
                    <div className="grid grid-cols-3 gap-4 md:gap-8 lg:gap-12 justify-items-center">
                        {section.items.map((itemRow: any) => {
                            const uiItem = normalizeItem(itemRow);
                            if (!uiItem) return null;
                            return (
                                <div key={itemRow.id} className="w-full">
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

function normalizeItem(itemRow: any): UnifiedProfileItem | null {
    const type = itemRow.item_type;
    const data = itemRow.movie || itemRow.series || itemRow.person;
    if (!data) return null;

    return {
        id: data.tmdb_id,
        title: data.title || data.name,
        // Switched to w500 for better performance on small grids
        image_url: (data.poster_url || data.profile_path)
            ? `https://image.tmdb.org/t/p/w500${data.poster_url || data.profile_path}`
            : null,
        subtitle: type === 'person'
            ? data.known_for_department
            : data.release_date ? new Date(data.release_date).getFullYear().toString() : '',
        type: type,
    };
}