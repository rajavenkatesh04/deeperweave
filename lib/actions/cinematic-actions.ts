'use server';

import { createClient } from '@/utils/supabase/server';

// =====================================================================
// == TYPE DEFINITIONS
// =====================================================================

export type CinematicSearchResult = {
    id: number;
    title: string;          // Normalized: 'title' for movies, 'name' for TV/Person
    release_date?: string;   // Normalized: 'release_date' | 'first_air_date' (Undefined for Person)
    poster_path: string | null; // Normalized: 'poster_path' | 'profile_path'
    backdrop_path?: string | null; // Normalized: 'backdrop_path' | 'known_for[0].backdrop_path'
    overview?: string;
    media_type: 'movie' | 'tv' | 'person';
    department?: string;    // for persons (e.g., "Acting", "Directing")
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

    // ✨ RICH DATA (Maxed Out)
    certification: string; // "PG-13", "TV-MA"
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

export interface PersonDetails {
    id: number;
    name: string;
    biography: string;
    birthday: string | null;
    deathday: string | null;
    place_of_birth: string | null;
    profile_path: string | null;
    known_for_department: string;
    gender: number;
    also_known_as: string[];

    // Rich Data
    backdrop_path: string | null; // "Stolen" from their best movie or tagged image
    social_ids: {
        instagram_id?: string;
        twitter_id?: string;
        imdb_id?: string;
        facebook_id?: string;
    };
    images: { file_path: string }[]; // Portraits
    known_for: CinematicSearchResult[];
    backdrops: { file_path: string }[]; // Gallery of movie backdrops
}

// --- TMDB Internal Types ---

interface TmdbMultiSearchItem {
    id: number;
    media_type?: 'movie' | 'tv' | 'person';

    // Media fields
    poster_path?: string | null;
    backdrop_path?: string | null;
    overview?: string;
    title?: string;
    release_date?: string;

    // TV/Person fields
    name?: string;
    first_air_date?: string;

    // Person specific fields
    profile_path?: string | null;
    known_for_department?: string;
}

interface TmdbMultiSearchResponse {
    results: TmdbMultiSearchItem[];
}

// =====================================================================
// == HELPER FUNCTIONS
// =====================================================================

const normalizeTmdbItem = (item: TmdbMultiSearchItem, forcedMediaType: 'movie' | 'tv' | null = null): CinematicSearchResult | null => {
    const media_type = (item.media_type as 'movie' | 'tv' | 'person') || forcedMediaType;

    // ✨ HANDLE PERSON
    if (media_type === 'person') {
        if (!item.profile_path) return null; // Skip people with no image
        return {
            id: item.id,
            title: item.name!,
            poster_path: item.profile_path, // Map profile_path to poster_path
            media_type: 'person',
            department: item.known_for_department || 'Artist',
        };
    }

    // ✨ HANDLE MOVIE/TV
    // Filter out items with no poster
    if (!item.poster_path) return null;

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

// ✨ NEW HELPER: Check user preference for Adult Content
async function getAdultContentFlag(): Promise<string> {
    try {
        const supabase = await createClient();

        // 1. Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 'false'; // Guest = Safe Mode

        // 2. Check their profile setting
        const { data } = await supabase
            .from('profiles')
            .select('content_preference')
            .eq('id', user.id)
            .single();

        // 3. Return 'true' only if explicitly set to 'all'
        return data?.content_preference === 'all' ? 'true' : 'false';
    } catch (error) {
        // Fail safe to 'false' if any DB error occurs
        return 'false';
    }
}

async function fetchTmdbList(endpoint: string, params: Record<string, string> = {}): Promise<CinematicSearchResult[]> {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) {
        console.error("TMDB API Key is not configured on the server.");
        return [];
    }

    let forcedMediaType: 'movie' | 'tv' | null = null;
    if (endpoint.startsWith('/movie')) forcedMediaType = 'movie';
    else if (endpoint.startsWith('/tv') || endpoint.startsWith('/discover/tv')) forcedMediaType = 'tv';

    // ✨ DYNAMICALLY GET PREFERENCE
    // If 'include_adult' is already passed in params (e.g. override), use it.
    // Otherwise, fetch from user profile.
    let includeAdultParam = params.include_adult;
    if (!includeAdultParam) {
        includeAdultParam = await getAdultContentFlag();
    }

    const query = new URLSearchParams({
        api_key: TMDB_API_KEY,
        include_adult: includeAdultParam, // ✅ Uses dynamic user setting
        ...params
    });

    try {
        // Note: The cache key includes the query params.
        // So 'include_adult=true' and 'include_adult=false' will be cached separately.
        const res = await fetch(`https://api.themoviedb.org/3${endpoint}?${query.toString()}`, {
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
            // Allow items without backdrop if they are persons, but ensure quality for others
            .filter(item => item.media_type === 'person' || !!item.backdrop_path)
            .slice(0, 20);

    } catch (error) {
        console.error(`TMDB Network Error for ${endpoint}:`, error);
        return [];
    }
}

// =====================================================================
// == PUBLIC ACTIONS
// =====================================================================

export type DiscoverFilters = {
    type: 'movie' | 'tv';
    sort_by?: 'popularity.desc' | 'vote_average.desc' | 'first_air_date.desc' | 'release_date.desc';
    region?: string;
    with_original_language?: string;
    with_genres?: string;
    year?: number;
    page?: number;
};

export async function discoverMedia(filters: DiscoverFilters) {
    const params: Record<string, string> = {
        page: (filters.page || 1).toString(),
        sort_by: filters.sort_by || 'popularity.desc',
        'vote_count.gte': '200',
    };

    if (filters.region) params.region = filters.region;
    if (filters.region && filters.type === 'tv') params.watch_region = filters.region;
    if (filters.with_original_language) params.with_original_language = filters.with_original_language;
    if (filters.with_genres) params.with_genres = filters.with_genres;
    if (filters.year) {
        if (filters.type === 'movie') params.primary_release_year = filters.year.toString();
        else params.first_air_date_year = filters.year.toString();
    }

    if (filters.with_genres === 'anime') {
        params.with_genres = '16'; // Animation genre
        params.with_original_language = 'ja';
    }

    return fetchTmdbList(`/discover/${filters.type}`, params);
}

// 0. HERO SECTION MIX
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

// 1. Trending All
export async function getTrendingAll() {
    return fetchTmdbList('/trending/all/day', { language: 'en-US' });
}

// 2. Popular Movies
export async function getPopularMovies() {
    return fetchTmdbList('/movie/now_playing', { language: 'en-US', page: '1', region: 'IN' });
}

// 3. Popular TV
export async function getPopularTv() {
    return fetchTmdbList('/tv/on_the_air', { language: 'en-US', page: '1', timezone: 'Asia/Kolkata' });
}

// 4. Popular Anime (Optimized with discoverMedia)
export async function getDiscoverAnime() {
    return discoverMedia({ type: 'tv', with_genres: 'anime' });
}

// 5. Top K-Dramas (Optimized with discoverMedia)
export async function getDiscoverKdramas() {
    return discoverMedia({ type: 'tv', with_original_language: 'ko' });
}

// 6. Search
export async function searchCinematic(query: string): Promise<CinematicSearchResult[]> {
    if (query.trim().length < 2) return [];
    return fetchTmdbList('/search/multi', { query: encodeURIComponent(query) });
}

// =====================================================================
// == DETAILS & CACHING ACTIONS
// =====================================================================

// 7. MAXED OUT MOVIE DETAILS
export async function getMovieDetails(movieId: number): Promise<RichCinematicDetails> {
    const supabase = await createClient(); // Standard Client
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key not configured.");

    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=videos,images,credits,recommendations,similar,keywords,external_ids,watch/providers,release_dates`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) throw new Error("Failed to fetch movie details");
        const data = await res.json();

        const director = data.credits?.crew?.find((p: any) => p.job === 'Director')?.name || 'N/A';
        const usRelease = data.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US');
        const certification = usRelease?.release_dates?.[0]?.certification || 'NR';
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
            certification,
            keywords: data.keywords?.keywords || [],
            social_ids: data.external_ids || {},
            watch_providers: {
                flatrate: providers.flatrate || [],
                rent: providers.rent || [],
                buy: providers.buy || []
            },
            recommendations: data.recommendations?.results?.map((i: any) => normalizeTmdbItem(i, 'movie')).filter(Boolean).slice(0, 10) || [],
            videos: data.videos?.results || [],
            images: data.images || { backdrops: [] },
            similar: []
        };

        // Cache Movie
        supabase.from('movies').upsert({
            tmdb_id: movieId,
            title: details.title,
            poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
            backdrop_url: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
            release_date: details.release_date,
            director: details.director,
            overview: details.overview,
            genres: details.genres,
            cast: details.cast
        }).then(({ error }) => { if (error) console.error("Movie Cache Error:", error); });

        return details;

    } catch (error) {
        console.error("TMDB Fetch Error:", error);
        throw new Error("Could not fetch movie details.");
    }
}

// 8. MAXED OUT TV DETAILS
export async function getSeriesDetails(seriesId: number): Promise<RichCinematicDetails> {
    const supabase = await createClient();
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
            videos: data.videos?.results || [],
            images: data.images || { backdrops: [] },
            similar: []
        };

        // Cache TV
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
            cast: details.cast
        }).then(({ error }) => { if (error) console.error("TV Cache Error:", error); });

        return details;

    } catch (error) {
        console.error("TMDB TV Fetch Error:", error);
        throw new Error("Could not fetch series details.");
    }
}

// 9. MAXED OUT PERSON DETAILS
export async function getPersonDetails(personId: number): Promise<PersonDetails> {
    const supabase = await createClient(); // Standard Client
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key not configured.");

    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/person/${personId}?api_key=${TMDB_API_KEY}&append_to_response=combined_credits,images,tagged_images,external_ids`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) throw new Error("Failed to fetch person details");
        const data = await res.json();

        // Sort credits by popularity
        const allCast = (data.combined_credits?.cast || [])
            .sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0));

        const knownFor = allCast
            .map((item: any) => normalizeTmdbItem(item))
            .filter((item: any): item is CinematicSearchResult => item !== null)
            .filter((item: CinematicSearchResult, index: number, self: CinematicSearchResult[]) =>
                index === self.findIndex((t) => t.id === item.id)
            )
            .slice(0, 20);

        // Smart Backdrop Strategy:
        // 1. Try Tagged Images (Photos of them in movies, filter for Landscape > 1.6 aspect ratio)
        let backdrops = (data.tagged_images?.results || [])
            .filter((img: any) => img.aspect_ratio > 1.6)
            .map((img: any) => ({ file_path: img.file_path }));

        // 2. If no tagged images, use backdrops from their top known movies
        if (backdrops.length === 0) {
            backdrops = knownFor
                .filter((m: CinematicSearchResult) => m.backdrop_path)
                .map((m: CinematicSearchResult) => ({ file_path: m.backdrop_path }));
        }

        const details: PersonDetails = {
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

            backdrop_path: backdrops[0]?.file_path || null,
            social_ids: data.external_ids || {},
            images: data.images?.profiles || [],
            known_for: knownFor,
            backdrops: backdrops.slice(0, 10)
        };

        // Cache Person (Fire & Forget)
        supabase.from('people').upsert({
            tmdb_id: data.id,
            name: data.name,
            biography: data.biography,
            birthday: data.birthday || null,
            deathday: data.deathday || null,
            place_of_birth: data.place_of_birth,
            profile_path: data.profile_path,
            known_for_department: data.known_for_department,
            gender: data.gender,
            updated_at: new Date().toISOString(),
        }).then(({ error }) => {
            // Ignore error if table doesn't exist yet to prevent console spam
            if (error && error.code !== '42P01') console.error("Actor Cache Error:", error);
        });

        return details;

    } catch (error) {
        console.error("TMDB Person Fetch Error:", error);
        throw new Error("Could not fetch person details.");
    }
}