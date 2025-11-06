'use server';

import { ofetch } from 'ofetch';
import { createClient } from '@/utils/supabase/server';

// =====================================================================
// == TYPE DEFINITIONS
// =====================================================================

// Used internally for fetching credits from TMDB
type CrewMember = {
    job: string;
    name: string;
};

// The unified result type used by our frontend components (search results, carousels)
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

// Raw item from /search/multi, /trending, /discover
interface TmdbMultiSearchItem {
    id: number;
    media_type?: 'movie' | 'tv' | 'person'; // Optional because /discover endpoints don't return it
    poster_path: string | null;
    backdrop_path?: string | null;
    overview?: string;
    // Movie-specific fields
    title?: string;
    release_date?: string;
    // TV-specific fields
    name?: string;
    first_air_date?: string;
}

interface TmdbMultiSearchResponse {
    results: TmdbMultiSearchItem[];
}

// Detailed item from /movie/:id or /tv/:id
interface TmdbItemDetails {
    title?: string;
    name?: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date?: string;
    first_air_date?: string;
    genres: { id: number; name: string }[];
    created_by?: { name: string }[]; // TV specific
    number_of_seasons?: number;      // TV specific
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
 * Handles both movies and TV shows, and filters out items without posters.
 * * @param item The raw item from TMDB
 * @param forcedMediaType Optional media type to force if the API doesn't return it (e.g. /discover/tv)
 */
const normalizeTmdbItem = (item: TmdbMultiSearchItem, forcedMediaType: 'movie' | 'tv' | null = null): CinematicSearchResult | null => {
    // Use the media_type from the item if it exists, otherwise use the forced one
    const media_type = (item.media_type as 'movie' | 'tv') || forcedMediaType;

    // Filter out people and items with no poster
    if ((media_type !== 'movie' && media_type !== 'tv') || !item.poster_path) {
        return null;
    }

    return {
        id: item.id,
        // Use 'title' for movies, 'name' for TV. Fallback to empty string if missing (shouldn't happen on valid items)
        title: media_type === 'movie' ? item.title! : item.name!,
        release_date: media_type === 'movie' ? item.release_date! : item.first_air_date!,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        overview: item.overview,
        media_type: media_type
    };
};

/**
 * Generic fetcher for TMDB lists (trending, popular, discover).
 * Handles API key, URL construction, fetching, and normalization.
 */
async function fetchTmdbList(endpoint: string, params: Record<string, string> = {}): Promise<CinematicSearchResult[]> {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) {
        console.error("TMDB API Key is not configured on the server.");
        return [];
    }

    // Determine media_type based on the endpoint if possible
    let forcedMediaType: 'movie' | 'tv' | null = null;
    if (endpoint.startsWith('/movie')) {
        forcedMediaType = 'movie';
    } else if (endpoint.startsWith('/tv') || endpoint.startsWith('/discover/tv')) {
        forcedMediaType = 'tv';
    }

    const query = new URLSearchParams({
        api_key: TMDB_API_KEY,
        ...params
    });

    const url = `https://api.themoviedb.org/3${endpoint}?${query.toString()}`;

    try {
        const data = await ofetch<TmdbMultiSearchResponse>(url);
        return data.results
            // Pass the forced media type to the normalizer
            .map(item => normalizeTmdbItem(item, forcedMediaType))
            // Filter out any nulls (failed normalizations)
            .filter((item): item is CinematicSearchResult => item !== null)
            // Limit to top 20 results
            .slice(0, 20);
    } catch (error) {
        console.error(`TMDB Fetch Error for ${endpoint}:`, error);
        return [];
    }
}


// =====================================================================
// == EXPORTED SERVER ACTIONS (Used by UI Components)
// =====================================================================

// --- 1. Search ---
// Used by: TimeLineEntryForm, ProfileEditForm
export async function searchCinematic(query: string): Promise<CinematicSearchResult[]> {
    if (query.trim().length < 2) return [];
    // Re-uses the generic fetcher logic, but for the multi-search endpoint
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) return [];

    try {
        const data = await ofetch<TmdbMultiSearchResponse>(
            `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
        );
        return data.results
            .map(item => normalizeTmdbItem(item)) // No forced type needed for multi-search
            .filter((item): item is CinematicSearchResult => item !== null)
            .slice(0, 20);
    } catch (error) {
        console.error("TMDB Multi-Search Fetch Error:", error);
        return [];
    }
}

// --- 2. Discovery Lists ---
// Used by: app/discover/page.tsx, and specific category pages

export async function getTrendingAll() {
    return fetchTmdbList('/trending/all/day');
}

export async function getPopularMovies() {
    return fetchTmdbList('/movie/popular', { language: 'en-US', page: '1' });
}

export async function getPopularTv() {
    return fetchTmdbList('/tv/popular', { language: 'en-US', page: '1' });
}

export async function getDiscoverAnime() {
    return fetchTmdbList('/discover/tv', {
        with_keywords: '210024', // 'anime' keyword ID
        sort_by: 'popularity.desc',
        language: 'en-US',
        page: '1'
    });
}

export async function getDiscoverKdramas() {
    return fetchTmdbList('/discover/tv', {
        with_original_language: 'ko', // Korean language
        sort_by: 'popularity.desc',
        language: 'en-US',
        page: '1'
    });
}


// =====================================================================
// == DETAILED FETCHERS (With Caching)
// =====================================================================
// Used by: CinematicDetailPage, logEntry (timeline-actions), updateProfile (profile-actions)

// --- 1. Get Movie Details ---
export async function getMovieDetails(movieId: number) {
    const supabase = await createClient();

    // Check cache first
    const { data: cached } = await supabase
        .from('movies')
        .select('*')
        .eq('tmdb_id', movieId)
        .maybeSingle();

    // Return cached data ONLY if it's complete (has overview)
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

    // Cache miss or incomplete data: Fetch from TMDB
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key not configured.");

    try {
        const [movie, credits] = await Promise.all([
            ofetch<TmdbItemDetails>(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`),
            ofetch<TmdbCreditsResponse>(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`)
        ]);

        const director = credits.crew.find((person) => person.job === 'Director')?.name || 'N/A';

        const details = {
            title: movie.title!,
            overview: movie.overview,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            release_date: movie.release_date!,
            cast: credits.cast.slice(0, 10), // Store top 10 cast
            director,
            genres: movie.genres
        };

        // Upsert to DB (update if exists but incomplete, insert if new)
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
        }).then(({ error }) => {
            if (error) console.error("Movie cache upsert error:", error);
        });

        return details;
    } catch (error) {
        console.error("TMDB Fetch Error:", error);
        throw new Error("Could not fetch movie details.");
    }
}

// --- 2. Get Series Details ---
export async function getSeriesDetails(seriesId: number) {
    const supabase = await createClient();

    // Check cache first
    const { data: cached } = await supabase
        .from('series')
        .select('*')
        .eq('tmdb_id', seriesId)
        .maybeSingle();

    // Return cached data ONLY if complete
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

    // Cache miss: Fetch from TMDB
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key not configured.");

    try {
        const [series, credits] = await Promise.all([
            ofetch<TmdbItemDetails>(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=${TMDB_API_KEY}`),
            ofetch<TmdbCreditsResponse>(`https://api.themoviedb.org/3/tv/${seriesId}/aggregate_credits?api_key=${TMDB_API_KEY}`)
        ]);

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

        // Upsert to DB
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
        }).then(({ error }) => {
            if (error) console.error("Series cache upsert error:", error);
        });

        return details;
    } catch (error) {
        console.error("TMDB TV Fetch Error:", error);
        throw new Error("Could not fetch series details.");
    }
}