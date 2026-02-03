'use server';

import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';
import { countries } from '@/lib/data/countries';
import {CinematicSearchResult} from "@/lib/definitions";

// =====================================================================
// == INTERNAL HELPERS
// =====================================================================

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
    vote_average?: number;
}

interface TmdbMultiSearchResponse {
    results: TmdbMultiSearchItem[];
}

export type RegionSpecificSection = {
    title: string;
    items: CinematicSearchResult[];
    href: string;
};

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

    const title = item.title || item.name || 'Unknown';
    const date = item.release_date || item.first_air_date;

    return {
        id: item.id,
        title: title,
        name: item.name,
        release_date: date,
        poster_path: item.poster_path,
        profile_path: null,
        backdrop_path: item.backdrop_path,
        overview: item.overview,
        media_type: media_type || 'movie',
        vote_count: item.vote_count,
        vote_average: item.vote_average
    };
};

// Request Memoization for User Region
const getUserRegionProfile = cache(async () => {
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
});

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
    if (!TMDB_API_KEY) return [];

    let forcedMediaType: 'movie' | 'tv' | null = null;
    if (endpoint.includes('/movie')) forcedMediaType = 'movie';
    else if (endpoint.includes('/tv')) forcedMediaType = 'tv';

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

        if (!res.ok) return [];

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
// == PUBLIC DISCOVERY ACTIONS
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

    // 60-Day Window for "Just Released" sections
    const justReleasedWindow = getDateWindow(60);

    if (country === 'IN') {
        const [
            // --- 1. JUST RELEASED (Last 60 Days) ---
            newBollywood, // Hindi
            newTollywood, // Telugu
            newKollywood, // Tamil
            newMollywood, // Malayalam
            newSandalwood, // Kannada

            // --- 2. TRENDING & CURATED ---
            topTrending,
            criticsChoice,
            panIndianAction
        ] = await Promise.all([
            // 1. Hindi (Bollywood) - Just Released
            discoverMedia({
                type: 'movie',
                sort_by: 'release_date.desc', // Sort by newest first
                with_original_language: 'hi',
                region: 'IN',
                release_date_gte: justReleasedWindow.gte,
                release_date_lte: justReleasedWindow.lte
            }),
            // 2. Telugu (Tollywood) - Just Released
            discoverMedia({
                type: 'movie',
                sort_by: 'release_date.desc',
                with_original_language: 'te',
                region: 'IN',
                release_date_gte: justReleasedWindow.gte,
                release_date_lte: justReleasedWindow.lte
            }),
            // 3. Tamil (Kollywood) - Just Released
            discoverMedia({
                type: 'movie',
                sort_by: 'release_date.desc',
                with_original_language: 'ta',
                region: 'IN',
                release_date_gte: justReleasedWindow.gte,
                release_date_lte: justReleasedWindow.lte
            }),
            // 4. Malayalam (Mollywood) - Just Released
            discoverMedia({
                type: 'movie',
                sort_by: 'release_date.desc',
                with_original_language: 'ml',
                region: 'IN',
                release_date_gte: justReleasedWindow.gte,
                release_date_lte: justReleasedWindow.lte
            }),
            // 5. Kannada (Sandalwood) - Just Released
            discoverMedia({
                type: 'movie',
                sort_by: 'release_date.desc',
                with_original_language: 'kn',
                region: 'IN',
                release_date_gte: justReleasedWindow.gte,
                release_date_lte: justReleasedWindow.lte
            }),

            // 6. Trending (Overall)
            fetchTmdbList('/trending/all/day', { region: 'IN' }),

            // 7. Critics' Choice (High Rated, broader window)
            discoverMedia({
                type: 'movie',
                sort_by: 'vote_average.desc',
                region: 'IN',
                release_date_gte: `${new Date().getFullYear()}-01-01`,
            }),

            // 8. Desi Action
            discoverMedia({
                type: 'movie',
                with_genres: '28',
                region: 'IN',
                sort_by: 'popularity.desc',
                release_date_gte: getDateWindow(90).gte
            }),
        ]);

        // --- ORDERING THE SECTIONS ---

        // 1. Hero: What's everyone talking about?
        sections.push({ title: 'Trending in India', items: topTrending, href: '/discover/trending' });

        // 2. JUST RELEASED BLOCKS (The new experience)
        if (newBollywood.length > 0) sections.push({ title: 'Just Released: Bollywood (Hindi)', items: newBollywood, href: '/discover/movies?lang=hi' });
        if (newTollywood.length > 0) sections.push({ title: 'Just Released: Tollywood (Telugu)', items: newTollywood, href: '/discover/movies?lang=te' });
        if (newKollywood.length > 0) sections.push({ title: 'Just Released: Kollywood (Tamil)', items: newKollywood, href: '/discover/movies?lang=ta' });
        if (newMollywood.length > 0) sections.push({ title: 'Just Released: Mollywood (Malayalam)', items: newMollywood, href: '/discover/movies?lang=ml' });
        if (newSandalwood.length > 0) sections.push({ title: 'Just Released: Sandalwood (Kannada)', items: newSandalwood, href: '/discover/movies?lang=kn' });

        // 3. Special Collections
        sections.push({ title: 'High Octane Indian Action', items: panIndianAction, href: '/discover/movies?genre=action' });

        // 4. Hidden Gems
        const gems = criticsChoice.filter(m => m.vote_count !== undefined && m.vote_count > 20).slice(0, 10);
        if (gems.length > 0) {
            sections.push({ title: `Critically Acclaimed (${new Date().getFullYear()})`, items: gems, href: '/discover/top-rated' });
        }
    }
    else if (country === 'KR') {
        const [kMovies, kDramas] = await Promise.all([
            discoverMedia({
                type: 'movie',
                sort_by: 'popularity.desc',
                with_original_language: 'ko',
                region: 'KR',
                release_date_gte: justReleasedWindow.gte,
                release_date_lte: justReleasedWindow.lte
            }),
            discoverMedia({
                type: 'tv',
                sort_by: 'popularity.desc',
                with_original_language: 'ko',
                region: 'KR',
                release_date_gte: justReleasedWindow.gte,
                release_date_lte: justReleasedWindow.lte
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
                release_date_gte: justReleasedWindow.gte,
                release_date_lte: justReleasedWindow.lte
            }),
            discoverMedia({
                type: 'movie',
                with_original_language: 'ja',
                region: 'JP',
                release_date_gte: justReleasedWindow.gte,
                release_date_lte: justReleasedWindow.lte
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