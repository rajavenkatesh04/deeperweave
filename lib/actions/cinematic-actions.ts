'use server';

import { ofetch } from 'ofetch';
import { createClient } from '@/utils/supabase/server';

// --- Type Definitions ---

type CrewMember = {
    job: string;
    name: string;
};

export type CinematicSearchResult = {
    id: number;
    title: string;          // 'title' for movie, 'name' for TV
    release_date: string;   // 'release_date' for movie, 'first_air_date' for TV
    poster_path: string | null;
    backdrop_path?: string | null; // Added for Hero component
    overview?: string; // Added for Hero component
    media_type: 'movie' | 'tv';
};

// This is what TMDB's /search/multi endpoint returns
interface TmdbMultiSearchItem {
    id: number;
    media_type: 'movie' | 'tv' | 'person';
    poster_path: string | null;
    backdrop_path?: string | null;
    overview?: string;
    // Movie-specific
    title?: string;
    release_date?: string;
    // TV-specific
    name?: string;
    first_air_date?: string;
}

interface TmdbMultiSearchResponse {
    results: TmdbMultiSearchItem[];
}

// This is what TMDB's /movie/:id and /tv/:id endpoints return
interface TmdbItemDetails {
    title?: string;
    name?: string;
    overview: string;
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    genres: { id: number; name: string }[];
    created_by?: { name: string }[]; // For TV
    number_of_seasons?: number;
}

// This is what TMDB's /credits endpoints return
interface TmdbCreditsResponse {
    cast: { name: string; profile_path: string; character: string }[];
    crew: CrewMember[];
}


// --- Helper Function ---
// A single, reusable function to normalize TMDB results
const normalizeTmdbItem = (item: TmdbMultiSearchItem): CinematicSearchResult | null => {
    const media_type = item.media_type as 'movie' | 'tv';

    // We only want movies and TV, and they MUST have a poster
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

// --- Your Existing Functions (Unchanged) ---

export async function searchCinematic(query: string): Promise<CinematicSearchResult[]> {
    if (query.trim().length < 2) return [];
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) { console.error("TMDB API Key missing"); return []; }
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
    try {
        const data = await ofetch<TmdbMultiSearchResponse>(url);
        return data.results
            .map(normalizeTmdbItem)
            .filter((item): item is CinematicSearchResult => item !== null)
            .slice(0, 20);
    } catch (error) {
        console.error("TMDB Multi-Search Fetch Error:", error);
        return [];
    }
}

export async function getMovieDetails(movieId: number) {
    const supabase = await createClient();
    const { data: cachedMovie } = await supabase.from('movies').select('*').eq('tmdb_id', movieId).maybeSingle();
    if (cachedMovie && cachedMovie.overview) {
        return {
            title: cachedMovie.title, overview: cachedMovie.overview,
            poster_path: cachedMovie.poster_url?.replace('https://image.tmdb.org/t/p/w500', ''),
            release_date: cachedMovie.release_date, director: cachedMovie.director,
            genres: cachedMovie.genres, cast: cachedMovie.cast
        };
    }
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key not configured.");
    try {
        const [movie, credits] = await Promise.all([
            ofetch<TmdbItemDetails>(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`),
            ofetch<TmdbCreditsResponse>(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`)
        ]);
        const director = credits.crew.find((person: CrewMember) => person.job === 'Director')?.name || 'N/A';
        const details = {
            title: movie.title!, overview: movie.overview, poster_path: movie.poster_path,
            release_date: movie.release_date!, cast: credits.cast, director, genres: movie.genres
        };
        supabase.from('movies').upsert({
            tmdb_id: movieId, title: details.title,
            poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
            release_date: details.release_date, director: details.director,
            overview: details.overview, genres: details.genres, "cast": details.cast
        }).then(({ error }) => { if (error) console.error("Movie cache upsert error:", error); });
        return details;
    } catch (error) {
        console.error("TMDB Fetch Error:", error);
        throw new Error("Could not fetch movie details.");
    }
}

export async function getSeriesDetails(seriesId: number) {
    const supabase = await createClient();
    const { data: cachedSeries } = await supabase.from('series').select('*').eq('tmdb_id', seriesId).maybeSingle();
    if (cachedSeries && cachedSeries.overview) {
        return {
            title: cachedSeries.title, overview: cachedSeries.overview,
            poster_path: cachedSeries.poster_url?.replace('https://image.tmdb.org/t/p/w500', ''),
            release_date: cachedSeries.release_date, creator: cachedSeries.creator,
            number_of_seasons: cachedSeries.number_of_seasons, genres: cachedSeries.genres, cast: cachedSeries.cast
        };
    }
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key not configured.");
    try {
        const [series, credits] = await Promise.all([
            ofetch<TmdbItemDetails>(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=${TMDB_API_KEY}`),
            ofetch<TmdbCreditsResponse>(`https://api.themoviedb.org/3/tv/${seriesId}/aggregate_credits?api_key=${TMDB_API_KEY}`)
        ]);
        const creator = series.created_by?.[0]?.name || 'N/A';
        const details = {
            title: series.name!, overview: series.overview, poster_path: series.poster_path,
            release_date: series.first_air_date!, cast: credits.cast, creator: creator,
            genres: series.genres, number_of_seasons: series.number_of_seasons
        };
        supabase.from('series').upsert({
            tmdb_id: seriesId, title: details.title,
            poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
            release_date: details.release_date, creator: details.creator,
            number_of_seasons: details.number_of_seasons, overview: details.overview,
            genres: details.genres, "cast": details.cast
        }).then(({ error }) => { if (error) console.error("Series cache upsert error:", error); });
        return details;
    } catch (error) {
        console.error("TMDB TV Fetch Error:", error);
        throw new Error("Could not fetch series details.");
    }
}

// --- ✨ NEW DISCOVERY FUNCTIONS ✨ ---

const TMDB_API_KEY_FALLBACK = process.env.TMDB_API_KEY;

// Generic fetcher for discover rows
async function fetchTmdbList(endpoint: string, params: Record<string, string> = {}): Promise<CinematicSearchResult[]> {
    if (!TMDB_API_KEY_FALLBACK) {
        console.error("TMDB API Key is not configured on the server.");
        return [];
    }

    const query = new URLSearchParams({
        api_key: TMDB_API_KEY_FALLBACK,
        ...params
    });

    const url = `https://api.themoviedb.org/3${endpoint}?${query.toString()}`;

    try {
        const data = await ofetch<TmdbMultiSearchResponse>(url);
        return data.results
            .map(normalizeTmdbItem)
            .filter((item): item is CinematicSearchResult => item !== null) // Filter out nulls
            .slice(0, 20); // Get top 20
    } catch (error) {
        console.error(`TMDB Fetch Error for ${endpoint}:`, error);
        return [];
    }
}

// For the Hero Component
export async function getTrendingAll() {
    return fetchTmdbList('/trending/all/day');
}

// For the "Popular Movies" row
export async function getPopularMovies() {
    return fetchTmdbList('/movie/popular', { language: 'en-US', page: '1' });
}

// For the "Popular TV" row
export async function getPopularTv() {
    return fetchTmdbList('/tv/popular', { language: 'en-US', page: '1' });
}

// For the "Popular Anime" row
export async function getDiscoverAnime() {
    return fetchTmdbList('/discover/tv', {
        with_keywords: '210024', // TMDB keyword for "anime"
        sort_by: 'popularity.desc',
        language: 'en-US',
        page: '1'
    });
}

// For the "Popular K-Dramas" row
export async function getDiscoverKdramas() {
    return fetchTmdbList('/discover/tv', {
        with_original_language: 'ko', // Korean
        sort_by: 'popularity.desc',
        language: 'en-US',
        page: '1'
    });
}