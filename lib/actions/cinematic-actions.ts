'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

// =====================================================================
// == TYPE DEFINITIONS
// =====================================================================

export type CinematicSearchResult = {
    id: number;
    title: string;          // Normalized: 'title' for movies, 'name' for TV
    release_date: string;   // Normalized: 'release_date' for movies, 'first_air_date' for TV
    poster_path: string | null;
    backdrop_path?: string | null;
    overview?: string;
    media_type: 'movie' | 'tv';
};

export interface RichCinematicDetails {
    // Core
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    media_type: 'movie' | 'tv';

    // Metadata
    genres: { id: number; name: string }[];
    runtime?: number; // Movies
    number_of_seasons?: number; // TV
    status?: string;
    tagline?: string;
    vote_average: number;

    // People
    director?: string;
    creator?: string;
    cast: { id: number; name: string; profile_path: string | null; character: string }[];

    // ✨ RICH DATA ✨
    certification: string; // "PG-13", "TV-MA", etc.
    keywords: { id: number; name: string }[];
    social_ids: { imdb_id?: string; instagram_id?: string; twitter_id?: string };
    watch_providers: {
        flatrate?: { provider_name: string; logo_path: string }[];
        rent?: { provider_name: string; logo_path: string }[];
        buy?: { provider_name: string; logo_path: string }[];
    };
    recommendations: CinematicSearchResult[];
    similar: CinematicSearchResult[];
    videos: { key: string; name: string; type: string }[];
    images: { backdrops: { file_path: string }[] };
}

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
}

interface TmdbMultiSearchResponse {
    results: TmdbMultiSearchItem[];
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
        include_adult: 'false', // Keeps the list clean
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
            .filter(item => !!item.backdrop_path)
            .slice(0, 20);

    } catch (error) {
        console.error(`TMDB Network Error for ${endpoint}:`, error);
        return [];
    }
}

// =====================================================================
// == EXPORTED SERVER ACTIONS (DISCOVERY)
// =====================================================================

// 👇 MASTER DISCOVER FUNCTION
export type DiscoverFilters = {
    type: 'movie' | 'tv';
    sort_by?: 'popularity.desc' | 'vote_average.desc' | 'first_air_date.desc' | 'release_date.desc';
    region?: string; // e.g., 'IN' for India, 'KR' for Korea
    with_original_language?: string; // e.g., 'ko', 'ja', 'ta' (Tamil)
    with_genres?: string; // comma separated IDs
    year?: number;
    page?: number;
};

export async function discoverMedia(filters: DiscoverFilters) {
    const params: Record<string, string> = {
        page: (filters.page || 1).toString(),
        sort_by: filters.sort_by || 'popularity.desc',
        'vote_count.gte': '200', // Filter out garbage with < 200 votes
    };

    if (filters.region) params.region = filters.region; // For movies
    if (filters.region && filters.type === 'tv') params.watch_region = filters.region; // For TV
    if (filters.with_original_language) params.with_original_language = filters.with_original_language;
    if (filters.with_genres) params.with_genres = filters.with_genres;
    if (filters.year) {
        if (filters.type === 'movie') params.primary_release_year = filters.year.toString();
        else params.first_air_date_year = filters.year.toString();
    }

    // Special handling for Anime (Genre 16 (Animation) + Japan)
    if (filters.with_genres === 'anime') {
        params.with_genres = '16';
        params.with_original_language = 'ja';
    }

    return fetchTmdbList(`/discover/${filters.type}`, params);
}

/**
 * 0. HERO SECTION MIX
 */
export async function getTrendingHero() {
    const [movies, tvShows] = await Promise.all([
        fetchTmdbList('/trending/movie/day', { region: 'IN' }),
        fetchTmdbList('/trending/tv/day', { timezone: 'Asia/Kolkata' })
    ]);

    const mixed: CinematicSearchResult[] = [];
    const length = Math.min(movies.length, tvShows.length, 5);

    for (let i = 0; i < length; i++) {
        mixed.push(movies[i]);
        mixed.push(tvShows[i]);
    }

    return mixed;
}

/**
 * 1. Trending All (Day)
 */
export async function getTrendingAll() {
    return fetchTmdbList('/trending/all/day', { language: 'en-US' });
}

/**
 * 2. Popular Movies
 */
export async function getPopularMovies() {
    return fetchTmdbList('/movie/now_playing', {
        language: 'en-US',
        page: '1',
        region: 'IN'
    });
}

/**
 * 3. Popular TV
 */
export async function getPopularTv() {
    return fetchTmdbList('/tv/on_the_air', {
        language: 'en-US',
        page: '1',
        timezone: 'Asia/Kolkata'
    });
}

/**
 * 4. Popular Anime (Preserved for compatibility, but `discoverMedia` is better)
 */
export async function getDiscoverAnime() {
    return discoverMedia({ type: 'tv', with_genres: 'anime' });
}

/**
 * 5. Top K-Dramas (Preserved for compatibility)
 */
export async function getDiscoverKdramas() {
    return discoverMedia({ type: 'tv', with_original_language: 'ko' });
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
            `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false` // Explicitly false for safety
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

// 👇 UPGRADED MOVIE FETCHER
export async function getMovieDetails(movieId: number): Promise<RichCinematicDetails> {
    // USE ADMIN CLIENT FOR CACHING TO AVOID RLS ERRORS
    const supabaseAdmin = await createAdminClient();
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key not configured.");

    try {
        // ✨ MAGIC LINE: We ask for EVERYTHING in one go
        const res = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=videos,images,credits,recommendations,similar,keywords,external_ids,watch/providers,release_dates`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) throw new Error("Failed to fetch movie details");
        const data = await res.json();

        // Extract Director
        const director = data.credits?.crew?.find((p: any) => p.job === 'Director')?.name || 'N/A';

        // Extract Certification (e.g., US PG-13)
        const usRelease = data.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US');
        const certification = usRelease?.release_dates?.[0]?.certification || 'NR';

        // Extract Watch Providers (Using IN for India, fallback to US)
        const providers = data["watch/providers"]?.results?.IN || data["watch/providers"]?.results?.US || {};

        const details: RichCinematicDetails = {
            id: data.id,
            title: data.title,
            media_type: 'movie',
            overview: data.overview,
            poster_path: data.poster_path,
            backdrop_path: data.backdrop_path,
            release_date: data.release_date,
            genres: data.genres,
            runtime: data.runtime,
            tagline: data.tagline,
            vote_average: data.vote_average,

            director,
            cast: data.credits?.cast?.slice(0, 12) || [],

            // Rich Data Mapping
            certification,
            keywords: data.keywords?.keywords || [],
            social_ids: data.external_ids || {},
            watch_providers: {
                flatrate: providers.flatrate || [],
                rent: providers.rent || [],
                buy: providers.buy || []
            },
            recommendations: data.recommendations?.results?.map((i: any) => normalizeTmdbItem(i, 'movie')).filter(Boolean).slice(0, 10) || [],
            similar: data.similar?.results?.map((i: any) => normalizeTmdbItem(i, 'movie')).filter(Boolean).slice(0, 10) || [],
            videos: data.videos?.results || [],
            images: data.images || { backdrops: [] }
        };

        // CACHE TO SUPABASE (Using Admin Client)
        supabaseAdmin.from('movies').upsert({
            tmdb_id: movieId,
            title: details.title,
            poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
            backdrop_url: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
            release_date: details.release_date,
            director: details.director,
            overview: details.overview,
            genres: details.genres,
            cast: details.cast
        }).then(({ error }) => { if (error) console.error("Cache error:", error); });

        return details;

    } catch (error) {
        console.error("TMDB Fetch Error:", error);
        throw new Error("Could not fetch movie details.");
    }
}

// 👇 UPGRADED SERIES FETCHER
export async function getSeriesDetails(seriesId: number): Promise<RichCinematicDetails> {
    // USE ADMIN CLIENT FOR CACHING
    const supabaseAdmin = await createAdminClient();
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key not configured.");

    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${TMDB_API_KEY}&append_to_response=videos,images,aggregate_credits,recommendations,similar,keywords,external_ids,watch/providers,content_ratings`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) throw new Error("Failed to fetch TV details");
        const data = await res.json();

        const creator = data.created_by?.[0]?.name || 'N/A';

        // Extract Content Rating
        const usRating = data.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US');
        const certification = usRating?.rating || 'NR';

        const providers = data["watch/providers"]?.results?.IN || data["watch/providers"]?.results?.US || {};

        const details: RichCinematicDetails = {
            id: data.id,
            title: data.name,
            media_type: 'tv',
            overview: data.overview,
            poster_path: data.poster_path,
            backdrop_path: data.backdrop_path,
            release_date: data.first_air_date,
            genres: data.genres,
            number_of_seasons: data.number_of_seasons,
            status: data.status,
            tagline: data.tagline,
            vote_average: data.vote_average,

            creator,
            cast: data.aggregate_credits?.cast?.slice(0, 12) || [],

            certification,
            keywords: data.keywords?.results || [],
            social_ids: data.external_ids || {},
            watch_providers: {
                flatrate: providers.flatrate || [],
                rent: providers.rent || [],
                buy: providers.buy || []
            },
            recommendations: data.recommendations?.results?.map((i: any) => normalizeTmdbItem(i, 'tv')).filter(Boolean).slice(0, 10) || [],
            similar: data.similar?.results?.map((i: any) => normalizeTmdbItem(i, 'tv')).filter(Boolean).slice(0, 10) || [],
            videos: data.videos?.results || [],
            images: data.images || { backdrops: [] }
        };

        // CACHE TO SUPABASE (Using Admin Client)
        supabaseAdmin.from('series').upsert({
            tmdb_id: seriesId,
            title: details.title,
            poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
            backdrop_url: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
            release_date: details.release_date,
            creator: details.creator,
            number_of_seasons: details.number_of_seasons,
            overview: details.overview,
            genres: details.genres,
            cast: details.cast
        }).then(({ error }) => { if (error) console.error("Cache error:", error); });

        return details;

    } catch (error) {
        console.error("TMDB TV Fetch Error:", error);
        throw new Error("Could not fetch series details.");
    }
}


export interface PersonDetails {
    id: number;
    name: string;
    biography: string;
    birthday: string | null;
    deathday: string | null;
    place_of_birth: string | null;
    profile_path: string | null;
    known_for_department: string;
    gender: number; // 1: Female, 2: Male
    also_known_as: string[];

    // Rich Data
    social_ids: {
        instagram_id?: string;
        twitter_id?: string;
        imdb_id?: string;
        tiktok_id?: string;
        facebook_id?: string;
    };
    // We format these to match the "BackdropGallery" expectation
    backdrops: { file_path: string }[];
    profiles: { file_path: string }[];
    known_for: CinematicSearchResult[];
    credits: {
        cast: (CinematicSearchResult & { character: string })[];
        crew: (CinematicSearchResult & { job: string })[];
    };
}

export async function getPersonDetails(personId: number): Promise<PersonDetails> {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key not configured.");

    try {
        // ✨ MAXED OUT FETCH: Tagged Images, Credits, Socials, etc.
        const res = await fetch(
            `https://api.themoviedb.org/3/person/${personId}?api_key=${TMDB_API_KEY}&append_to_response=combined_credits,images,tagged_images,external_ids`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) throw new Error("Failed to fetch person details");
        const data = await res.json();

        // 1. Process Credits (Sorted by Popularity)
        const allCast = (data.combined_credits?.cast || [])
            .sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0));

        // "Known For" = Top 20 distinct items
        const knownFor = allCast
            .map((item: any) => normalizeTmdbItem(item))
            .filter((item: any): item is CinematicSearchResult => item !== null)
            .filter((item: CinematicSearchResult, index: number, self: CinematicSearchResult[]) =>
                index === self.findIndex((t) => t.id === item.id)
            )
            .slice(0, 20);

        // 2. BACKDROP STRATEGY
        // Priority A: Tagged Images (High quality photos of the person from movies) - Filter for Landscape
        let backdrops = (data.tagged_images?.results || [])
            .filter((img: any) => img.aspect_ratio > 1.6) // Only landscape
            .map((img: any) => ({ file_path: img.file_path }));

        // Priority B: If no tagged images, "Steal" backdrops from their top movies
        if (backdrops.length === 0) {
            backdrops = knownFor
                .filter((m: CinematicSearchResult) => m.backdrop_path)
                .map((m: CinematicSearchResult) => ({ file_path: m.backdrop_path }));
        }

        return {
            id: data.id,
            name: data.name,
            biography: data.biography,
            birthday: data.birthday,
            deathday: data.deathday,
            place_of_birth: data.place_of_birth,
            profile_path: data.profile_path,
            known_for_department: data.known_for_department,
            gender: data.gender,
            also_known_as: data.also_known_as || [],

            social_ids: data.external_ids || {},
            backdrops: backdrops.slice(0, 10), // Limit to 10 for the gallery
            profiles: data.images?.profiles || [],
            known_for: knownFor,
            credits: {
                cast: allCast.map((c: any) => ({ ...normalizeTmdbItem(c), character: c.character })).filter((i: any) => i && i.id),
                crew: (data.combined_credits?.crew || []).slice(0, 20)
            }
        };

    } catch (error) {
        console.error("TMDB Person Fetch Error:", error);
        throw new Error("Could not fetch person details.");
    }
}