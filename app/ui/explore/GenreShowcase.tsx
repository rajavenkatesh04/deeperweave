'use client';


import { CinematicSearchResult } from '@/lib/definitions';
import CinematicRow from "@/app/ui/discover/CinematicRow";

export default function GenreShowcase({
                                          title,
                                          items,
                                          href
                                      }: {
    title: string;
    items: CinematicSearchResult[];
    href: string;
}) {
    return (
        <CinematicRow
            title={title}
            items={items}
            href={href}
        />
    );
}