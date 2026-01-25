'use client';

import ProfileItemCard from './ProfileItemCard';
import {UnifiedProfileItem} from './ProfileItemCard';

export default function ProfileSectionDisplay({sections}: { sections: any[] }) {
    if (!sections || sections.length === 0) return null;

    return (
        <div className="flex flex-col gap-20 md:gap-40">
            {sections.map((section, idx) => (
                <section key={section.id} className="max-w-[1400px] mx-auto px-6 md:px-12 w-full">

                    {/* --- Responsive Header Section --- */}
                    <div className="mb-8 md:mb-16">
                        <div className="flex items-baseline gap-4 md:gap-8">
                            <div className="flex flex-col w-full">
                                <div className="flex items-center gap-6 w-full">
                                    <h2
                                        className="
                                            /* Fluid Font: Min 1.875rem, Scalable 5vw, Max 4rem */
                                            text-[clamp(1.875rem,5vw,4rem)]
                                            font-sans tracking-tighter whitespace-nowrap pb-2
                                            bg-gradient-to-r from-cyan-300 via-fuchsia-500 to-yellow-300
                                            bg-[length:200%_auto] bg-clip-text text-transparent
                                            animate-gradient
                                            drop-shadow-[0_0_18px_rgba(0,255,255,0.45)]
                                            leading-tight
                                        "
                                    >
                                        {section.title}
                                    </h2>
                                    <div className="flex-grow border-t-2 border-dotted border-zinc-800 self-center mt-2"/>
                                </div>
                            </div>
                            <span className="text-[clamp(2.5rem,8vw,8rem)] font-black tracking-tighter text-zinc-900/50 italic leading-none">
                                {String(idx + 1).padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    {/* --- Evenly Spaced 2/4 Grid --- */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-12 md:gap-y-32 justify-items-center">
                        {section.items.map((itemRow: any) => {
                            const uiItem = normalizeItem(itemRow);
                            if (!uiItem) return null;
                            return (
                                <div key={itemRow.id} className="w-full flex justify-center">
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
        image_url: (data.poster_url || data.profile_path)
            ? `https://image.tmdb.org/t/p/w780${data.poster_url || data.profile_path}`
            : null,
        subtitle: type === 'person'
            ? data.known_for_department
            : data.release_date ? new Date(data.release_date).getFullYear().toString() : '',
        type: type,
    };
}