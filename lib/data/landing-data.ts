'use server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// --- TMDB Response Interfaces ---
interface TmdbMovieResult {
    id: number;
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
}

interface TmdbTvResult {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
}

interface TmdbResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

// --- Helper Functions ---
const getFetchOptions = (revalidateSeconds = 3600): RequestInit => ({
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`
    },
    next: { revalidate: revalidateSeconds }
});

const tmdbUrl = (endpoint: string, params: Record<string, string> = {}) => {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    if (!process.env.TMDB_READ_ACCESS_TOKEN && TMDB_API_KEY) {
        url.searchParams.append('api_key', TMDB_API_KEY);
    }
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
    return url.toString();
};

// --- Main Data Fetching Function ---
export async function getLandingPageData() {
    if (!TMDB_API_KEY && !process.env.TMDB_READ_ACCESS_TOKEN) {
        throw new Error("TMDB API Key or Read Access Token is missing");
    }

    try {
        const options = getFetchOptions(86400); // Cache for 24 hours

        // 1. Parallel Fetch ALL needed data points
        const [popularMoviesRes, popularTvRes, animeRes, kDramaRes] = await Promise.all([
            fetch(tmdbUrl('/movie/popular', { language: 'en-US', page: '1' }), options),
            fetch(tmdbUrl('/tv/top_rated', { language: 'en-US', page: '1' }), options),
            fetch(tmdbUrl('/discover/tv', { with_genres: '16', with_original_language: 'ja', sort_by: 'popularity.desc' }), options),
            fetch(tmdbUrl('/discover/tv', { with_original_language: 'ko', sort_by: 'popularity.desc' }), options),
        ]);

        if (!popularMoviesRes.ok || !popularTvRes.ok || !animeRes.ok || !kDramaRes.ok) {
            throw new Error("One or more TMDB fetches failed");
        }

        // Use generic interfaces to type the JSON responses
        const [movies, tv, anime, kDrama] = await Promise.all([
            popularMoviesRes.json() as Promise<TmdbResponse<TmdbMovieResult>>,
            popularTvRes.json() as Promise<TmdbResponse<TmdbTvResult>>,
            animeRes.json() as Promise<TmdbResponse<TmdbTvResult>>,
            kDramaRes.json() as Promise<TmdbResponse<TmdbTvResult>>
        ]);

        // --- PROCESS DATA ---

        // 1. Hero Posters Marquee
        const heroPosters = [
            ...movies.results.slice(0, 10).map(m => m.poster_path),
            ...tv.results.slice(0, 10).map(t => t.poster_path),
            ...anime.results.slice(0, 10).map(a => a.poster_path)
        ].filter((path): path is string => Boolean(path))
            .sort(() => Math.random() - 0.5);

        // 2. Hero Rotating Backgrounds
        // Ensure we have a fallback or handle potential undefined results safely
        const heroItems = [
            { label: "Movies", bg: movies.results[0]?.backdrop_path ?? "" },
            { label: "Anime", bg: anime.results[0]?.backdrop_path ?? "" },
            { label: "TV Shows", bg: tv.results[0]?.backdrop_path ?? "" },
            { label: "K-Dramas", bg: kDrama.results[0]?.backdrop_path ?? "" }
        ];

        // 3. Search Demo Items
        const searchDemoItems = [
            {
                title: anime.results[1]?.name || "Attack on Titan",
                year: (anime.results[1]?.first_air_date || "").split('-')[0],
                type: "Anime",
                color: "text-pink-500",
                img: anime.results[1]?.poster_path ?? ""
            },
            {
                title: movies.results[1]?.title || "Dune",
                year: (movies.results[1]?.release_date || "").split('-')[0],
                type: "Movie",
                color: "text-amber-500",
                img: movies.results[1]?.poster_path ?? ""
            },
            {
                title: tv.results[1]?.name || "Succession",
                year: (tv.results[1]?.first_air_date || "").split('-')[0],
                type: "TV Series",
                color: "text-blue-500",
                img: tv.results[1]?.poster_path ?? ""
            }
        ];

        // 4. Bento Grid Items
        const bentoItems = {
            anime: {
                title: "Anime",
                href: "/discover/anime",
                img: anime.results[2]?.backdrop_path || anime.results[0]?.poster_path || "",
                description: "Seasons, OVAs, Movies. All linked."
            },
            movie: {
                title: "Film",
                href: "/discover/movie",
                img: movies.results[2]?.poster_path || "",
                description: "Letterboxd style logging, but for everything."
            },
            kdrama: {
                title: "K-Drama",
                href: "/discover/kdrama",
                img: kDrama.results[1]?.backdrop_path || "",
                description: "Track your idols."
            },
            tv: {
                title: "TV",
                href: "/discover/tv",
                img: tv.results[2]?.backdrop_path || "",
                description: "Binge worthy series."
            }
        };

        return {
            heroPosters,
            heroItems,
            searchDemoItems,
            bentoItems
        };

    } catch (error) {
        console.error("Error in getLandingPageData:", error);
        throw error;
    }
}