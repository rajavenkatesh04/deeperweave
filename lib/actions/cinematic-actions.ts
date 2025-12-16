'use server';

import { createClient } from '@/utils/supabase/server';

// =====================================================================
// == TYPE DEFINITIONS
// =====================================================================

type CrewMember = {
    job: string;
    name: string;
};

export type CinematicSearchResult = {
    id: number;
    title: string;          // Normalized: 'title' for movies, 'name' for TV
    release_date: string;   // Normalized: 'release_date' for movies, 'first_air_date' for TV
    poster_path: string | null;
    backdrop_path?: string | null;
    overview?: string;
    media_type: 'movie' | 'tv';
};

// --- TMDB API Response Types ---

interface TmdbMultiSearchItem {
    id: number;
    media_type?: 'movie' | 'tv' | 'person';
    poster_path: string | null;
    backdrop_path?: string | null;
    overview?: string;
    title?: string;
    release_date?: string;
    name?: string;
    first_air_date?: string;
    origin_country?: string[];
}

interface TmdbMultiSearchResponse {
    results: TmdbMultiSearchItem[];
}

interface TmdbItemDetails {
    title?: string;
    name?: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date?: string;
    first_air_date?: string;
    genres: { id: number; name: string }[];
    created_by?: { name: string }[];
    number_of_seasons?: number;
}

interface TmdbCreditsResponse {
    cast: { name: string; profile_path: string | null; character: string }[];
    crew: CrewMember[];
}


// =====================================================================
// == HELPER FUNCTIONS
// =====================================================================

/**
 * Normalizes a raw TMDB item into our unified CinematicSearchResult type.
 */
const normalizeTmdbItem = (item: TmdbMultiSearchItem, forcedMediaType: 'movie' | 'tv' | null = null): CinematicSearchResult | null => {
    const media_type = (item.media_type as 'movie' | 'tv') || forcedMediaType;

    // Filter out people and items with no poster
    if ((media_type !== 'movie' && media_type !== 'tv') || !item.poster_path) {
        return null;
    }

    return {
        id: item.id,
        title: media_type === 'movie' ? item.title! : item.name!,
        release_date: media_type === 'movie' ? item.release_date! : item.first_air_date!,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        overview: item.overview,
        media_type: media_type
    };
};

/**
 * Generic fetcher for TMDB lists.
 * Uses native fetch for better stability in Next.js Server Actions.
 */
async function fetchTmdbList(endpoint: string, params: Record<string, string> = {}): Promise<CinematicSearchResult[]> {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) {
        console.error("TMDB API Key is not configured on the server.");
        return [];
    }

    let forcedMediaType: 'movie' | 'tv' | null = null;
    if (endpoint.startsWith('/movie')) {
        forcedMediaType = 'movie';
    } else if (endpoint.startsWith('/tv') || endpoint.startsWith('/discover/tv')) {
        forcedMediaType = 'tv';
    }

    const query = new URLSearchParams({
        api_key: TMDB_API_KEY,
        include_adult: 'false',
        ...params
    });

    const url = `https://api.themoviedb.org/3${endpoint}?${query.toString()}`;

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'CinematicApp/1.0'
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) {
            console.error(`TMDB API Error [${res.status}]: ${res.statusText} at ${endpoint}`);
            return [];
        }

        const data = await res.json() as TmdbMultiSearchResponse;

        return data.results
            .map(item => normalizeTmdbItem(item, forcedMediaType))
            .filter((item): item is CinematicSearchResult => item !== null)
            .filter(item => !!item.backdrop_path) // Ensure items have backdrops for hero/cards
            .slice(0, 20);

    } catch (error) {
        console.error(`TMDB Network Error for ${endpoint}:`, error);
        return [];
    }
}


// =====================================================================
// == EXPORTED SERVER ACTIONS (DISCOVERY)
// =====================================================================

/**
 * 0. HERO SECTION MIX
 * Gets top 5 Movies and top 5 TV Shows (Trending today) and interleaves them.
 * This guarantees your Hero slider has variety (Movie -> TV -> Movie -> TV).
 */
export async function getTrendingHero() {
    const [movies, tvShows] = await Promise.all([
        fetchTmdbList('/trending/movie/day', { region: 'IN' }), // Asia/India Bias
        fetchTmdbList('/trending/tv/day', { timezone: 'Asia/Kolkata' })
    ]);

    // Interleave the results: [Movie1, TV1, Movie2, TV2, ...]
    const mixed: CinematicSearchResult[] = [];
    const length = Math.min(movies.length, tvShows.length, 5); // Take top 5 of each

    for (let i = 0; i < length; i++) {
        mixed.push(movies[i]);
        mixed.push(tvShows[i]);
    }

    return mixed; // Returns 10 mixed items
}

/**
 * 1. Trending All (Day)
 * Used for "Trending This Week" row.
 */
export async function getTrendingAll() {
    return fetchTmdbList('/trending/all/day', { language: 'en-US' });
}

/**
 * 2. Popular Movies -> NOW PLAYING (India)
 */
export async function getPopularMovies() {
    return fetchTmdbList('/movie/now_playing', {
        language: 'en-US',
        page: '1',
        region: 'IN'
    });
}

/**
 * 3. Popular TV -> ON THE AIR (Asia Timezone)
 */
export async function getPopularTv() {
    return fetchTmdbList('/tv/on_the_air', {
        language: 'en-US',
        page: '1',
        timezone: 'Asia/Kolkata'
    });
}

/**
 * 4. Popular Anime -> FRESH AIRING (Last 3 Months)
 */
export async function getDiscoverAnime() {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const dateString = threeMonthsAgo.toISOString().split('T')[0];

    return fetchTmdbList('/discover/tv', {
        with_keywords: '210024', // Anime
        sort_by: 'popularity.desc',
        'air_date.gte': dateString,
        with_original_language: 'ja',
        page: '1'
    });
}

/**
 * 5. Top K-Dramas -> FRESH AIRING (Last 4 Months)
 */
export async function getDiscoverKdramas() {
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    const dateString = fourMonthsAgo.toISOString().split('T')[0];

    return fetchTmdbList('/discover/tv', {
        with_original_language: 'ko',
        sort_by: 'popularity.desc',
        'air_date.gte': dateString,
        page: '1'
    });
}


// =====================================================================
// == SEARCH & DETAILS
// =====================================================================

export async function searchCinematic(query: string): Promise<CinematicSearchResult[]> {
    if (query.trim().length < 2) return [];
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) return [];

    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
        );

        if (!res.ok) return [];

        const data = await res.json() as TmdbMultiSearchResponse;
        return data.results
            .map(item => normalizeTmdbItem(item))
            .filter((item): item is CinematicSearchResult => item !== null)
            .slice(0, 20);
    } catch (error) {
        console.error("TMDB Multi-Search Fetch Error:", error);
        return [];
    }
}

export async function getMovieDetails(movieId: number) {
    const supabase = await createClient();

    // 1. Check DB Cache
    const { data: cached } = await supabase
        .from('movies')
        .select('*')
        .eq('tmdb_id', movieId)
        .maybeSingle();

    if (cached && cached.overview) {
        return {
            title: cached.title,
            overview: cached.overview,
            poster_path: cached.poster_url?.replace('https://image.tmdb.org/t/p/w500', ''),
            backdrop_path: cached.backdrop_url?.replace('https://image.tmdb.org/t/p/original', ''),
            release_date: cached.release_date,
            director: cached.director,
            genres: cached.genres,
            cast: cached.cast
        };
    }

    // 2. Fetch TMDB
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key not configured.");

    try {
        const [movieRes, creditsRes] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`),
            fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`)
        ]);

        if (!movieRes.ok || !creditsRes.ok) throw new Error("Failed to fetch movie details");

        const movie = await movieRes.json() as TmdbItemDetails;
        const credits = await creditsRes.json() as TmdbCreditsResponse;

        const director = credits.crew.find((person) => person.job === 'Director')?.name || 'N/A';
        const details = {
            title: movie.title!,
            overview: movie.overview,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            release_date: movie.release_date!,
            cast: credits.cast.slice(0, 10),
            director,
            genres: movie.genres
        };

        // 3. Upsert Cache
        supabase.from('movies').upsert({
            tmdb_id: movieId,
            title: details.title,
            poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
            backdrop_url: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
            release_date: details.release_date,
            director: details.director,
            overview: details.overview,
            genres: details.genres,
            "cast": details.cast
        }).then(({ error }) => { if (error) console.error("Movie cache error:", error); });

        return details;
    } catch (error) {
        console.error("TMDB Fetch Error:", error);
        throw new Error("Could not fetch movie details.");
    }
}

export async function getSeriesDetails(seriesId: number) {
    const supabase = await createClient();

    // 1. Check DB Cache
    const { data: cached } = await supabase
        .from('series')
        .select('*')
        .eq('tmdb_id', seriesId)
        .maybeSingle();

    if (cached && cached.overview) {
        return {
            title: cached.title,
            overview: cached.overview,
            poster_path: cached.poster_url?.replace('https://image.tmdb.org/t/p/w500', ''),
            backdrop_path: cached.backdrop_url?.replace('https://image.tmdb.org/t/p/original', ''),
            release_date: cached.release_date,
            creator: cached.creator,
            number_of_seasons: cached.number_of_seasons,
            genres: cached.genres,
            cast: cached.cast
        };
    }

    // 2. Fetch TMDB
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key not configured.");

    try {
        const [seriesRes, creditsRes] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=${TMDB_API_KEY}`),
            fetch(`https://api.themoviedb.org/3/tv/${seriesId}/aggregate_credits?api_key=${TMDB_API_KEY}`)
        ]);

        if (!seriesRes.ok || !creditsRes.ok) throw new Error("Failed to fetch TV details");

        const series = await seriesRes.json() as TmdbItemDetails;
        const credits = await creditsRes.json() as TmdbCreditsResponse;

        const creator = series.created_by?.[0]?.name || 'N/A';
        const details = {
            title: series.name!,
            overview: series.overview,
            poster_path: series.poster_path,
            backdrop_path: series.backdrop_path,
            release_date: series.first_air_date!,
            cast: credits.cast.slice(0, 10),
            creator: creator,
            genres: series.genres,
            number_of_seasons: series.number_of_seasons
        };

        // 3. Upsert Cache
        supabase.from('series').upsert({
            tmdb_id: seriesId,
            title: details.title,
            poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
            backdrop_url: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
            release_date: details.release_date,
            creator: details.creator,
            number_of_seasons: details.number_of_seasons,
            overview: details.overview,
            genres: details.genres,
            "cast": details.cast
        }).then(({ error }) => { if (error) console.error("Series cache error:", error); });

        return details;
    } catch (error) {
        console.error("TMDB TV Fetch Error:", error);
        throw new Error("Could not fetch series details.");
    }
}