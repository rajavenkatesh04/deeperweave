// @/app/ui/profile/TimelineDisplay.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type TimelineEntry } from '@/lib/data/timeline-data';
import { StarIcon } from '@heroicons/react/24/solid';
import { CalendarDaysIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

// Card for a single timeline entry
function TimelineEntryCard({ entry }: { entry: TimelineEntry }) {
    const watchedDate = new Date(entry.watched_on);
    const formattedDate = watchedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
    });

    return (
        <div className="relative pl-8 pb-8 group">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-500 to-rose-300 dark:from-rose-600 dark:to-rose-800 group-last:bg-gradient-to-b group-last:from-rose-500 group-last:to-transparent" />

            {/* Timeline dot */}
            <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-rose-500 dark:bg-rose-600 border-4 border-white dark:border-zinc-900 shadow-lg group-hover:scale-110 transition-transform" />

            {/* Date badge */}
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                <CalendarDaysIcon className="w-3.5 h-3.5" />
                {formattedDate}
            </div>

            {/* Content card */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-4 p-4">
                    {/* Poster */}
                    <Link
                        href={`/movie/${entry.movies.tmdb_id}`}
                        className="shrink-0 mx-auto sm:mx-0"
                    >
                        <div className="relative group/poster">
                            <Image
                                src={entry.movies.poster_url || '/placeholder-poster.png'}
                                alt={`Poster for ${entry.movies.title}`}
                                width={100}
                                height={150}
                                className="rounded-lg object-cover shadow-md transition-all duration-300 group-hover/poster:shadow-xl group-hover/poster:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/poster:bg-black/10 rounded-lg transition-colors" />
                        </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <Link
                            href={`/movie/${entry.movies.tmdb_id}`}
                            className="group/title"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover/title:text-rose-600 dark:group-hover/title:text-rose-500 transition-colors line-clamp-2">
                                {entry.movies.title}
                            </h3>
                        </Link>

                        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                            {entry.movies.release_date?.split('-')[0]}
                        </p>

                        {/* Rating */}
                        {entry.rating && (
                            <div className="flex items-center gap-1 mt-3">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className={`w-5 h-5 transition-colors ${
                                            i < entry.rating!
                                                ? 'text-amber-400 dark:text-amber-500'
                                                : 'text-gray-300 dark:text-zinc-700'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Notes */}
                        {entry.notes && (
                            <div className="mt-3 text-sm text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800/50 p-3 rounded-lg border-l-2 border-rose-500 dark:border-rose-600">
                                <p className="italic line-clamp-3">&ldquo;{entry.notes}&rdquo;</p>
                            </div>
                        )}

                        {/* Review link */}
                        {entry.posts?.slug && (
                            <Link
                                href={`/blog/${entry.posts.slug}`}
                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-500 dark:hover:text-rose-400 transition-colors group/link"
                            >
                                <PencilSquareIcon className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
                                Read Full Review
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main display component
export default function TimelineDisplay({ timelineEntries }: { timelineEntries: TimelineEntry[] }) {
    return (
        <section>
            {timelineEntries.length > 0 ? (
                <div className="relative max-w-4xl">
                    {timelineEntries.map(entry => (
                        <TimelineEntryCard key={entry.id} entry={entry} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-4">
                    <div className="max-w-sm mx-auto">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                            <CalendarDaysIcon className="w-8 h-8 text-gray-400 dark:text-zinc-600" />
                        </div>
                        <p className="text-gray-600 dark:text-zinc-400 font-medium">
                            No films logged yet
                        </p>
                        <p className="text-sm text-gray-500 dark:text-zinc-500 mt-2">
                            Start building your movie diary by logging films you&apos;ve watched
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}