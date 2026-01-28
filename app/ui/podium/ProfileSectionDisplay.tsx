'use client';

import ProfileItemCard from './ProfileItemCard';
import { UnifiedProfileItem } from './ProfileItemCard';

export default function ProfileSectionDisplay({ sections }: { sections: any[] }) {
    if (!sections || sections.length === 0) return null;

    return (
        <div className="flex flex-col gap-24 md:gap-32">
            {sections.map((section, idx) => (
                <section key={section.id} className="max-w-5xl mx-auto md:px-8 w-full">

                    {/* --- HEADER SECTION --- */}
                    <div className="mb-10 md:mb-12">
                        <div className="flex items-baseline gap-4 md:gap-8">
                            <div className="flex flex-col w-full">
                                <div className="flex items-center gap-6 w-full">
                                    <h2
                                        className="
                                            /* 2. REFINED TYPOGRAPHY */
                                            text-3xl md:text-5xl lg:text-6xl
                                            font-sans font-bold tracking-tighter whitespace-nowrap pb-1

                                            /* 3. PUNCHIER METALLIC GRADIENT */
                                            /* Light: Deep Black -> Medium Grey -> Deep Black */
                                            /* Dark: Pure White -> Silver -> Steel Grey */
                                            bg-gradient-to-br
                                            from-black via-zinc-600 to-black
                                            dark:from-white dark:via-zinc-300 dark:to-zinc-500

                                            bg-clip-text text-transparent
                                            leading-tight
                                        "
                                    >
                                        {section.title}
                                    </h2>

                                    {/* Dotted Line */}
                                    <div className="flex-grow border-t-2 border-dotted border-zinc-300 dark:border-zinc-700 self-center mt-3 opacity-60" />
                                </div>
                            </div>

                            {/* Numbering: Adjusted color for better contrast/elegance */}
                            <span className="
                                text-5xl md:text-7xl font-black tracking-tighter
                                text-zinc-200 dark:text-zinc-800
                                italic leading-none select-none
                            ">
                                {String(idx + 1).padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    {/* --- GRID (Strict 3 Columns) --- */}
                    {/* Centered justify-items ensures cards don't stretch weirdly if content is low */}
                    <div className="grid grid-cols-3 gap-4 md:gap-8 lg:gap-10 justify-items-center">
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
        // Kept w500 for optimal loading
        image_url: (data.poster_url || data.profile_path)
            ? `https://image.tmdb.org/t/p/w500${data.poster_url || data.profile_path}`
            : null,
        subtitle: type === 'person'
            ? data.known_for_department
            : data.release_date ? new Date(data.release_date).getFullYear().toString() : '',
        type: type,
    };
}