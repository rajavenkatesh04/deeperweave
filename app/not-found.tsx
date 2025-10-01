// app/not-found.tsx (Updated)

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getRandomMovie } from '@/lib/data/movies-data'; // ✨ Import our new function

// A few fun, movie-themed quotes for the 404 page
const notFoundQuotes = [
    "This is not the page you are looking for.",
    "Looks like you've taken a wrong turn at Albuquerque.",
    "Houston, we have a problem.",
    "Where we're going, we don't need roads... or this page.",
    "I have a bad feeling about this.",
];

export default async function NotFound() {
    // ✨ Fetch a random movie on the server
    const randomMovie = await getRandomMovie();

    // ✨ Get a random quote from our array
    const quote = notFoundQuotes[Math.floor(Math.random() * notFoundQuotes.length)];

    // ✨ Set a fallback background color in case the movie fetch fails
    const backgroundStyle = randomMovie?.backdrop_url
        ? { backgroundImage: `url(${randomMovie.backdrop_url})` }
        : { backgroundColor: '#111827' }; // A dark gray fallback

    return (
        // The main container will have the movie backdrop
        <main
            className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat"
            style={backgroundStyle}
        >
            {/* This div provides a dark overlay for text readability */}
            <div className="flex min-h-screen w-full items-center justify-center bg-black/75 p-8">
                <div className="w-full max-w-lg text-center">
                    <h1 className="text-6xl font-bold tracking-tight text-white sm:text-8xl">
                        404
                    </h1>

                    <h2 className="mt-4 text-2xl font-semibold text-zinc-200">
                        Lost in Space?
                    </h2>

                    {/* ✨ Display our random movie quote */}
                    <p className="mt-4 text-lg italic text-zinc-400">
                        &ldquo;{quote}&rdquo;
                    </p>

                    <p className="mt-8 text-base text-zinc-300">
                        It seems you&apos;ve ventured into uncharted territory. The page you were looking for doesn&apos;t exist.
                    </p>

                    <div className="mt-10">
                        <Link
                            href="/"
                            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                        >
                            <ArrowLeftIcon className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
                            <span>Go Back Home</span>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}