'use server';

import { createClient } from '@/utils/supabase/server';
import { countries } from '@/lib/data/countries';

// =====================================================================
// == TYPE DEFINITIONS
// =====================================================================

export type CinematicSearchResult = {
    id: number;
    title: string;
    name?: string;
    release_date?: string;
    poster_path: string | null;
    profile_path?: string | null;
    backdrop_path?: string | null;
    overview?: string;
    media_type: 'movie' | 'tv' | 'person';
    department?: string;
    known_for_department?: string;
};

export interface RichCinematicDetails {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    media_type: 'movie' | 'tv';
    genres: { id: number; name: string }[];
    runtime?: number;
    number_of_seasons?: number;
    status?: string;
    tagline?: string;
    vote_average: number;
    director?: string;
    creator?: string;
    cast: { id: number; name: string; profile_path: string | null; character: string }[];
    certification: string;
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
    backdrop_path: string | null;
    social_ids: {
        instagram_id?: string;
        twitter_id?: string;
        imdb_id?: string;
        facebook_id?: string;
    };
    images: { file_path: string }[];
    known_for: CinematicSearchResult[];
    backdrops: { file_path: string }[];
}

interface TmdbMultiSearchItem {
    id: number;
    media_type?: 'movie' | 'tv' | 'person';
    poster_path?: string | null;
    backdrop_path?: string | null;
    overview?: string;
    title?: string;
    release_date?: string;
    vote_count?: number;
    name?: string;
    first_air_date?: string;
    profile_path?: string | null;
    known_for_department?: string;
}

interface TmdbMultiSearchResponse {
    results: TmdbMultiSearchItem[];
}

export type RegionSpecificSection = {
    title: string;
    items: CinematicSearchResult[];
    href: string;
};

// =====================================================================
// == HELPER FUNCTIONS
// =====================================================================

const normalizeTmdbItem = (item: TmdbMultiSearchItem, forcedMediaType: 'movie' | 'tv' | null = null): CinematicSearchResult | null => {
    const media_type = (item.media_type as 'movie' | 'tv' | 'person') || forcedMediaType;

    if (media_type === 'person') {
        if (!item.profile_path) return null;
        return {
            id: item.id,
            title: item.name || 'Unknown',
            name: item.name,
            poster_path: item.profile_path,
            profile_path: item.profile_path,
            media_type: 'person',
            department: item.known_for_department || 'Artist',
            known_for_department: item.known_for_department
        };
    }

    if (!item.poster_path) return null;

    return {
        id: item.id,
        title: media_type === 'movie' ? (item.title || 'Unknown') : (item.name || 'Unknown'),
        name: item.name,
        release_date: media_type === 'movie' ? item.release_date : item.first_air_date,
        poster_path: item.poster_path,
        profile_path: null,
        backdrop_path: item.backdrop_path,
        overview: item.overview,
        media_type: media_type
    };
};

async function getUserRegionProfile() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { country: 'US', content_preference: 'sfw', countryName: 'United States' };

        const { data } = await supabase
            .from('profiles')
            .select('country, content_preference')
            .eq('id', user.id)
            .single();

        let regionCode = 'US';
        let countryName = 'United States';

        if (data?.country) {
            const foundCountry = countries.find(c => c.name === data.country);
            if (foundCountry) {
                regionCode = foundCountry["alpha-2"];
                countryName = foundCountry.name;
            }
        }

        return {
            country: regionCode,
            countryName: countryName,
            content_preference: data?.content_preference || 'sfw'
        };
    } catch (error) {
        return { country: 'US', content_preference: 'sfw', countryName: 'United States' };
    }
}

function getDateWindow(daysBack: number) {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - daysBack);
    return {
        gte: past.toISOString().split('T')[0], // YYYY-MM-DD
        lte: today.toISOString().split('T')[0]
    };
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

    let region = params.region;
    let includeAdult = params.include_adult;

    if (!region || !includeAdult) {
        const profile = await getUserRegionProfile();
        if (!region) region = profile.country;
        if (!includeAdult) includeAdult = profile.content_preference === 'all' ? 'true' : 'false';
    }

    const queryParams = new URLSearchParams({
        api_key: TMDB_API_KEY,
        include_adult: includeAdult!,
        region: region!,
        watch_region: region!,
        ...params
    });

    try {
        const res = await fetch(`https://api.themoviedb.org/3${endpoint}?${queryParams.toString()}`, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) {
            console.error(`TMDB API Error [${res.status}]: ${res.statusText} at ${endpoint}`);
            return [];
        }

        const data = await res.json() as TmdbMultiSearchResponse;

        return data.results
            .map(item => normalizeTmdbItem(item, forcedMediaType))
            .filter((item): item is CinematicSearchResult => item !== null)
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
    release_date_gte?: string;
    release_date_lte?: string;
};

export async function discoverMedia(filters: DiscoverFilters) {
    const params: Record<string, string> = {
        page: (filters.page || 1).toString(),
        sort_by: filters.sort_by || 'popularity.desc',
        'vote_count.gte': '5',
    };

    if (filters.region) params.region = filters.region;
    if (filters.region && filters.type === 'tv') params.watch_region = filters.region;
    if (filters.with_original_language) params.with_original_language = filters.with_original_language;
    if (filters.with_genres) params.with_genres = filters.with_genres;
    if (filters.year) {
        if (filters.type === 'movie') params.primary_release_year = filters.year.toString();
        else params.first_air_date_year = filters.year.toString();
    }

    if (filters.release_date_gte) {
        if (filters.type === 'movie') params['primary_release_date.gte'] = filters.release_date_gte;
        else params['first_air_date.gte'] = filters.release_date_gte;
    }
    if (filters.release_date_lte) {
        if (filters.type === 'movie') params['primary_release_date.lte'] = filters.release_date_lte;
        else params['first_air_date.lte'] = filters.release_date_lte;
    }

    if (filters.with_genres === 'anime') {
        params.with_genres = '16';
        params.with_original_language = 'ja';
    }

    return fetchTmdbList(`/discover/${filters.type}`, params);
}

export async function getRegionalDiscoverSections(): Promise<RegionSpecificSection[]> {
    const { country, countryName } = await getUserRegionProfile();
    const sections: RegionSpecificSection[] = [];
    const recentWindow = getDateWindow(45);

    if (country === 'IN') {
        const [bollywood, tollywood, kollywood, topTrending] = await Promise.all([
            discoverMedia({
                type: 'movie',
                sort_by: 'popularity.desc',
                with_original_language: 'hi',
                region: 'IN',
                release_date_gte: recentWindow.gte,
                release_date_lte: recentWindow.lte
            }),
            discoverMedia({
                type: 'movie',
                sort_by: 'popularity.desc',
                with_original_language: 'te',
                region: 'IN',
                release_date_gte: recentWindow.gte,
                release_date_lte: recentWindow.lte
            }),
            discoverMedia({
                type: 'movie',
                sort_by: 'popularity.desc',
                with_original_language: 'ta',
                region: 'IN',
                release_date_gte: recentWindow.gte,
                release_date_lte: recentWindow.lte
            }),
            fetchTmdbList('/trending/all/day', { region: 'IN' })
        ]);

        sections.push({ title: 'Trending Now in India', items: topTrending, href: '/discover/trending' });
        sections.push({ title: 'New in Bollywood (Hindi)', items: bollywood, href: '/discover/movies' });
        sections.push({ title: 'Just Released (Telugu)', items: tollywood, href: '/discover/movies' });
        sections.push({ title: 'Just Released (Tamil)', items: kollywood, href: '/discover/movies' });
    }
    else if (country === 'KR') {
        const [kMovies, kDramas] = await Promise.all([
            discoverMedia({
                type: 'movie',
                sort_by: 'popularity.desc',
                with_original_language: 'ko',
                region: 'KR',
                release_date_gte: recentWindow.gte,
                release_date_lte: recentWindow.lte
            }),
            discoverMedia({
                type: 'tv',
                sort_by: 'popularity.desc',
                with_original_language: 'ko',
                region: 'KR',
                release_date_gte: recentWindow.gte,
                release_date_lte: recentWindow.lte
            }),
        ]);
        sections.push({ title: 'New Korean Movies', items: kMovies, href: '/discover/movies' });
        sections.push({ title: 'Airing K-Dramas', items: kDramas, href: '/discover/kdramas' });
    }
    else if (country === 'JP') {
        const [anime, liveAction] = await Promise.all([
            discoverMedia({
                type: 'tv',
                with_genres: '16',
                region: 'JP',
                release_date_gte: recentWindow.gte,
                release_date_lte: recentWindow.lte
            }),
            discoverMedia({
                type: 'movie',
                with_original_language: 'ja',
                region: 'JP',
                release_date_gte: recentWindow.gte,
                release_date_lte: recentWindow.lte
            }),
        ]);
        sections.push({ title: 'Airing Anime', items: anime, href: '/discover/anime' });
        sections.push({ title: 'New Japanese Movies', items: liveAction, href: '/discover/movies' });
    }
    else {
        const [trending] = await Promise.all([
            fetchTmdbList('/trending/all/day', { region: country }),
        ]);
        sections.push({ title: `Trending in ${countryName}`, items: trending, href: '/discover/trending' });
    }

    return sections;
}

export async function getTrendingHero() {
    const [movies, tvShows] = await Promise.all([
        fetchTmdbList('/trending/movie/day'),
        fetchTmdbList('/trending/tv/day')
    ]);
    const mixed: CinematicSearchResult[] = [];
    const length = Math.min(movies.length, tvShows.length, 5);
    for (let i = 0; i < length; i++) {
        mixed.push(movies[i]);
        mixed.push(tvShows[i]);
    }
    return mixed;
}

export async function getTrendingAll() {
    return fetchTmdbList('/trending/all/day', { language: 'en-US' });
}

export async function getPopularMovies() {
    return fetchTmdbList('/movie/now_playing', { language: 'en-US', page: '1' });
}

export async function getPopularTv() {
    return fetchTmdbList('/tv/on_the_air', { language: 'en-US', page: '1' });
}

export async function getDiscoverAnime() {
    return discoverMedia({ type: 'tv', with_genres: 'anime' });
}

export async function getDiscoverKdramas() {
    return discoverMedia({ type: 'tv', with_original_language: 'ko' });
}

export async function searchCinematic(query: string): Promise<CinematicSearchResult[]> {
    if (query.trim().length < 2) return [];
    return fetchTmdbList('/search/multi', { query: encodeURIComponent(query) });
}

// =====================================================================
// == PURE FETCH ACTIONS (NO CACHE)
// =====================================================================

export async function getMovieDetails(movieId: number): Promise<RichCinematicDetails> {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key not configured.");

    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=videos,images,credits,recommendations,similar,keywords,external_ids,watch/providers,release_dates`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) throw new Error("Failed to fetch movie details");
        const data = await res.json();

        const recommendations = (data.recommendations?.results || []) as TmdbMultiSearchItem[];
        const director = data.credits?.crew?.find((p: any) => p.job === 'Director')?.name || 'N/A';
        const usRelease = data.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US');
        const certification = usRelease?.release_dates?.[0]?.certification || 'NR';
        const providers = data["watch/providers"]?.results?.IN || data["watch/providers"]?.results?.US || {};

        return {
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
            recommendations: recommendations.map((i) => normalizeTmdbItem(i, 'movie')).filter((item): item is CinematicSearchResult => item !== null).slice(0, 10),
            videos: data.videos?.results || [],
            images: data.images || { backdrops: [] },
            similar: []
        };
    } catch (error) {
        console.error("TMDB Fetch Error:", error);
        throw new Error("Could not fetch movie details.");
    }
}

export async function getSeriesDetails(seriesId: number): Promise<RichCinematicDetails> {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key not configured.");

    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${TMDB_API_KEY}&append_to_response=videos,images,aggregate_credits,recommendations,similar,keywords,external_ids,watch/providers,content_ratings`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) throw new Error("Failed to fetch TV details");
        const data = await res.json();

        const recommendations = (data.recommendations?.results || []) as TmdbMultiSearchItem[];
        const creator = data.created_by?.[0]?.name || 'N/A';
        const usRating = data.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US');
        const certification = usRating?.rating || 'NR';
        const providers = data["watch/providers"]?.results?.IN || data["watch/providers"]?.results?.US || {};

        return {
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
            recommendations: recommendations.map((i) => normalizeTmdbItem(i, 'tv')).filter((item): item is CinematicSearchResult => item !== null).slice(0, 10),
            videos: data.videos?.results || [],
            images: data.images || { backdrops: [] },
            similar: []
        };
    } catch (error) {
        console.error("TMDB TV Fetch Error:", error);
        throw new Error("Could not fetch series details.");
    }
}

export async function getPersonDetails(personId: number): Promise<PersonDetails> {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key not configured.");

    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/person/${personId}?api_key=${TMDB_API_KEY}&append_to_response=combined_credits,images,tagged_images,external_ids`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) throw new Error("Failed to fetch person details");
        const data = await res.json();

        const allCast = (data.combined_credits?.cast || []) as TmdbMultiSearchItem[];
        const sortedCast = allCast.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

        const knownFor = sortedCast
            .map((item) => normalizeTmdbItem(item))
            .filter((item): item is CinematicSearchResult => item !== null)
            .filter((item, index, self) =>
                index === self.findIndex((t) => t.id === item.id)
            )
            .slice(0, 20);

        let backdrops = (data.tagged_images?.results || [])
            .filter((img: any) => img.aspect_ratio > 1.6)
            .map((img: any) => ({ file_path: img.file_path }));

        if (backdrops.length === 0) {
            backdrops = knownFor
                .filter((m) => m.backdrop_path)
                .map((m) => ({ file_path: m.backdrop_path! }));
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
            backdrop_path: backdrops[0]?.file_path || null,
            social_ids: data.external_ids || {},
            images: data.images?.profiles || [],
            known_for: knownFor,
            backdrops: backdrops.slice(0, 10)
        };
    } catch (error) {
        console.error("TMDB Person Fetch Error:", error);
        throw new Error("Could not fetch person details.");
    }
}

// =====================================================================
// == CACHE HELPERS (USE THESE FOR WRITE ACTIONS)
// =====================================================================

export async function cacheMovie(movieId: number) {
    const supabase = await createClient();
    // 1. Check if exists
    const { data: existing } = await supabase.from('movies').select('tmdb_id').eq('tmdb_id', movieId).maybeSingle();
    if (existing) return;

    // 2. Fetch
    const details = await getMovieDetails(movieId);

    // 3. Insert
    await supabase.from('movies').upsert({
        tmdb_id: details.id,
        title: details.title,
        poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
        backdrop_url: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
        release_date: details.release_date,
        director: details.director,
        overview: details.overview,
        genres: details.genres,
        cast: details.cast
    }, { onConflict: 'tmdb_id' });
}

export async function cacheSeries(seriesId: number) {
    const supabase = await createClient();
    // 1. Check if exists
    const { data: existing } = await supabase.from('series').select('tmdb_id').eq('tmdb_id', seriesId).maybeSingle();
    if (existing) return;

    // 2. Fetch
    const details = await getSeriesDetails(seriesId);

    // 3. Insert
    await supabase.from('series').upsert({
        tmdb_id: details.id,
        title: details.title,
        poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
        backdrop_url: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
        release_date: details.release_date,
        creator: details.creator,
        number_of_seasons: details.number_of_seasons,
        overview: details.overview,
        genres: details.genres,
        cast: details.cast
    }, { onConflict: 'tmdb_id' });
}

export async function cachePerson(personId: number) {
    const supabase = await createClient();
    // 1. Check if exists AND is fresh
    const { data: existing } = await supabase.from('people').select('tmdb_id, updated_at').eq('tmdb_id', personId).maybeSingle();

    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    const isStale = !existing || !existing.updated_at || (Date.now() - new Date(existing.updated_at).getTime() > ONE_WEEK);

    if (!isStale) return;

    // 2. Fetch
    const details = await getPersonDetails(personId);

    // 3. Insert
    await supabase.from('people').upsert({
        tmdb_id: details.id,
        name: details.name,
        biography: details.biography,
        birthday: details.birthday || null,
        deathday: details.deathday || null,
        place_of_birth: details.place_of_birth,
        profile_path: details.profile_path,
        known_for_department: details.known_for_department,
        gender: details.gender,
        updated_at: new Date().toISOString(),
    }, { onConflict: 'tmdb_id' });
}