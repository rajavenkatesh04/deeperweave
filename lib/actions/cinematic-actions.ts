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
    title: string;
    release_date: string;
    poster_path: string | null;
    media_type: 'movie' | 'tv';
};

// This is what TMDB's /search/multi endpoint returns
interface TmdbMultiSearchItem {
    id: number;
    media_type: 'movie' | 'tv' | 'person';
    poster_path: string | null;
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

// ✨ 1. THIS IS THE FIX
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
    number_of_seasons?: number; // ✨ ADDED THIS (it's optional, so it works for movies too)
}

// This is what TMDB's /credits endpoints return
interface TmdbCreditsResponse {
    cast: { name: string; profile_path: string; character: string }[];
    crew: CrewMember[];
}


// --- searchCinematic (Unchanged) ---
export async function searchCinematic(query: string): Promise<CinematicSearchResult[]> {
    if (query.trim().length < 2) {
        return [];
    }
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) {
        console.error("TMDB API Key is not configured on the server.");
        return [];
    }
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;

    try {
        const data = await ofetch<TmdbMultiSearchResponse>(url);

        const results = data.results
            .filter((item: TmdbMultiSearchItem) => // <-- Use type
                (item.media_type === 'movie' || item.media_type === 'tv') &&
                item.poster_path
            )
            .map((item: TmdbMultiSearchItem) => { // <-- Use type
                return {
                    id: item.id,
                    title: item.media_type === 'movie' ? item.title! : item.name!,
                    release_date: item.media_type === 'movie' ? item.release_date! : item.first_air_date!,
                    poster_path: item.poster_path,
                    media_type: item.media_type as 'movie' | 'tv'
                } as CinematicSearchResult;
            });
        return results.slice(0, 20);
    } catch (error) {
        console.error("TMDB Multi-Search Fetch Error:", error);
        return [];
    }
}


// --- getMovieDetails (Unchanged) ---
export async function getMovieDetails(movieId: number) {
    const supabase = await createClient();

    // 1. Check cache first
    const { data: cachedMovie } = await supabase
        .from('movies')
        .select('*')
        .eq('tmdb_id', movieId)
        .maybeSingle();

    if (cachedMovie && cachedMovie.overview) {
        return {
            title: cachedMovie.title,
            overview: cachedMovie.overview,
            poster_path: cachedMovie.poster_url?.replace('https://image.tmdb.org/t/p/w500', ''),
            release_date: cachedMovie.release_date,
            director: cachedMovie.director,
            genres: cachedMovie.genres,
            cast: cachedMovie.cast
        };
    }

    // 2. If not in cache, fetch from TMDB
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key is not configured on the server.");

    try {
        const [movie, credits] = await Promise.all([
            ofetch<TmdbItemDetails>(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`),
            ofetch<TmdbCreditsResponse>(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`)
        ]);
        const director = credits.crew.find((person: CrewMember) => person.job === 'Director')?.name || 'N/A';

        const details = {
            title: movie.title!,
            overview: movie.overview,
            poster_path: movie.poster_path,
            release_date: movie.release_date!,
            cast: credits.cast,
            director,
            genres: movie.genres
        };

        // 3. Save to cache
        supabase.from('movies').upsert({
            tmdb_id: movieId,
            title: details.title,
            poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
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
        throw new Error("Could not fetch movie details. Check the server logs for more info.");
    }
}

// --- ✨ 2. UPDATED getSeriesDetails (No 'any') ---
export async function getSeriesDetails(seriesId: number) {
    const supabase = await createClient();

    // 1. Check cache first
    const { data: cachedSeries } = await supabase
        .from('series')
        .select('*')
        .eq('tmdb_id', seriesId)
        .maybeSingle();

    if (cachedSeries && cachedSeries.overview) {
        return {
            title: cachedSeries.title,
            overview: cachedSeries.overview,
            poster_path: cachedSeries.poster_url?.replace('https://image.tmdb.org/t/p/w500', ''),
            release_date: cachedSeries.release_date,
            creator: cachedSeries.creator,
            number_of_seasons: cachedSeries.number_of_seasons,
            genres: cachedSeries.genres,
            cast: cachedSeries.cast
        };
    }

    // 2. If not in cache, fetch from TMDB
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key is not configured on the server.");

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
            release_date: series.first_air_date!,
            cast: credits.cast,
            creator: creator,
            genres: series.genres,
            number_of_seasons: series.number_of_seasons // ✨ REMOVED 'as any'
        };

        // 3. Save to cache
        supabase.from('series').upsert({
            tmdb_id: seriesId,
            title: details.title,
            poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
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
        throw new Error("Could not fetch series details. Check the server logs.");
    }
}