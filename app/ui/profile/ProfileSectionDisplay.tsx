'use client';

import ProfileItemCard from './ProfileItemCard';
import {UnifiedProfileItem} from './ProfileItemCard';

export default function ProfileSectionDisplay({sections}: { sections: any[] }) {
    if (!sections || sections.length === 0) return null;

    return (
        <div className="flex flex-col gap-20 md:gap-32">
            {sections.map((section, idx) => (
                <section key={section.id} className="max-w-[1400px] mx-auto px-6 md:px-12 w-full">

                    {/* --- Numbered Line Header --- */}
                    <div className="mb-6 md:mb-12">
                        <div className="flex items-baseline gap-4 md:gap-8">
                            <div className="flex flex-col w-full">
                                <div className="flex items-center gap-6 w-full">
                                    <h2
                                        className="
        text-4xl md:text-6xl font-sans   tracking-tighter whitespace-nowrap pb-2
        bg-gradient-to-r from-cyan-300 via-fuchsia-500 to-yellow-300
        bg-[length:200%_auto] bg-clip-text text-transparent
        animate-gradient
        drop-shadow-[0_0_18px_rgba(0,255,255,0.45)]
    "
                                    >
                                        {section.title}
                                    </h2>
                                    <div className="flex-grow border-t-2 border-dotted border-zinc-800"/>
                                </div>
                            </div>
                            <span className="text-4xl md:text-8xl font-black tracking-tighter text-zinc-800 italic">
                                {String(idx + 1).padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    {/* --- Sharp 2/4 Grid --- */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 md:gap-x-12 md:gap-y-32 justify-evenly content-between">
                        {section.items.map((itemRow: any) => {
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

function normalizeItem(itemRow: any): UnifiedProfileItem | null {
    const type = itemRow.item_type;
    const data = itemRow.movie || itemRow.series || itemRow.person;
    if (!data) return null;

    return {
        id: data.tmdb_id,
        title: data.title || data.name,
        image_url: (data.poster_url || data.profile_path)
            ? `https://image.tmdb.org/t/p/w780${data.poster_url || data.profile_path}`
            : null,
        subtitle: type === 'person' ? data.known_for_department : new Date(data.release_date).getFullYear().toString(),
        type: type,
    };
}