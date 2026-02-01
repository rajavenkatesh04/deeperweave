import Link from 'next/link';
import Image from 'next/image';
import { CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import { FilmIcon, TvIcon, StarIcon } from '@heroicons/react/24/outline';

export default function CinematicResultCard({ media }: { media: CinematicSearchResult }) {
    const isPerson = media.media_type === 'person';

    // Format Subtitle (Year or Department)
    const subtitle = isPerson
        ? media.department
        : (media.release_date ? media.release_date.split('-')[0] : 'N/A');

    // Determine Link
    const href = isPerson
        ? `/discover/actor/${media.id}`
        : `/discover/${media.media_type}/${media.id}`;

    return (
        <Link
            href={href}
            className="group block bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-all hover:shadow-lg overflow-hidden"
        >
            {/* Poster / Profile Image */}
            <div className="relative w-full aspect-[2/3] bg-zinc-100 dark:bg-zinc-900">
                {media.poster_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                        alt={media.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        {media.media_type === 'movie' && <FilmIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />}
                        {media.media_type === 'tv' && <TvIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />}
                        {media.media_type === 'person' && <StarIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />}
                    </div>
                )}

                {/* Media Type Badge */}
                <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 border text-[9px] font-bold uppercase tracking-wider ${
                        isPerson
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-500'
                            : 'bg-white/90 dark:bg-black/90 border-zinc-200 dark:border-zinc-800 text-zinc-500'
                    }`}>
                        {media.media_type === 'movie' ? 'FILM' : media.media_type === 'tv' ? 'TV' : 'STAR'}
                    </span>
                </div>
            </div>

            {/* Text Content */}
            <div className="p-3">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight group-hover:underline decoration-1 underline-offset-2 line-clamp-2 mb-1">
                    {media.title}
                </p>
                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    {subtitle}
                </p>
            </div>
        </Link>
    );
}