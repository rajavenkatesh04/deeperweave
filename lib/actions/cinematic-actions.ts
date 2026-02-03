'use server';

import { cache } from 'react';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { countries } from '@/lib/data/countries';
import { RichCinematicDetails, CinematicSearchResult, CrewMember, PersonDetails } from '@/lib/definitions';

// Re-export types so existing imports in your app don't break
export type { RichCinematicDetails, CinematicSearchResult, CrewMember, PersonDetails };

// =====================================================================
// == TYPE DEFINITIONS (Internal TMDB Types)
// =====================================================================

interface TmdbMultiSearchItem {
    id: number;
    media_type?: 'movie' | 'tv' | 'person';
    poster_path?: string | null;
    backdrop_path?: string | null;
    overview?: string;
    title?: string;
    release_date?: string;
    name?: string;
    first_air_date?: string;
    profile_path?: string | null;
    known_for_department?: string;

    // Add these so we can read them from the API response
    vote_count?: number;
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

// =====================================================================
// == HELPER FUNCTIONS
// =====================================================================

const normalizeTmdbItem = (item: TmdbMultiSearchItem, forcedMediaType: 'movie' | 'tv' | null = null): CinematicSearchResult | null => {
    // Determine Media Type
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

    // ✨ LOGIC FIX: Check title first, then name.
    // This fixes "Unknown" for movies in discovery lists where media_type is missing.
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
        media_type: media_type || 'movie', // Default to movie if strictly unknown

        // ✨ NOW VALID: Map the vote data
        vote_count: item.vote_count,
        vote_average: item.vote_average
    };
};

// ✨ OPTIMIZATION: Request Memoization
// This function now runs only ONCE per page load, no matter how many times it is called.
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

// ✨ THE BUG FIX IS HERE
export async function fetchTmdbList(endpoint: string, params: Record<string, string> = {}): Promise<CinematicSearchResult[]> {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) {
        console.error("TMDB API Key is not configured on the server.");
        return [];
    }

    let forcedMediaType: 'movie' | 'tv' | null = null;

    // 🛠️ FIX: Use .includes() instead of .startsWith()
    // This catches '/discover/movie', '/movie/popular', etc.
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
// == PUBLIC DISCOVERY & FEED ACTIONS (Restored)
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
    'vote_count.gte'?: string;
};

export async function discoverMedia(filters: DiscoverFilters) {
    const params: Record<string, string> = {
        page: (filters.page || 1).toString(),
        sort_by: filters.sort_by || 'popularity.desc',
        // ✨ FIX: Use the value passed in filters, or default to '5' if missing
        'vote_count.gte': filters['vote_count.gte'] || '5',
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
    const recentWindow = getDateWindow(60); // Extended window

    if (country === 'IN') {
        const [
            bollywood,
            tollywood,
            kollywood,
            mollywood, // ✨ Malayalam
            sandalwood, // ✨ Kannada
            topTrending,
            criticsChoice, // ✨ High Rated
            panIndianAction // ✨ Genre Specific
        ] = await Promise.all([
            // 1. Hindi (Bollywood)
            discoverMedia({
                type: 'movie',
                sort_by: 'popularity.desc',
                with_original_language: 'hi',
                region: 'IN',
                release_date_gte: recentWindow.gte,
                release_date_lte: recentWindow.lte
            }),
            // 2. Telugu (Tollywood)
            discoverMedia({
                type: 'movie',
                sort_by: 'popularity.desc',
                with_original_language: 'te',
                region: 'IN',
                release_date_gte: recentWindow.gte,
                release_date_lte: recentWindow.lte
            }),
            // 3. Tamil (Kollywood)
            discoverMedia({
                type: 'movie',
                sort_by: 'popularity.desc',
                with_original_language: 'ta',
                region: 'IN',
                release_date_gte: recentWindow.gte,
                release_date_lte: recentWindow.lte
            }),
            // 4. ✨ Malayalam (Mollywood)
            discoverMedia({
                type: 'movie',
                sort_by: 'popularity.desc',
                with_original_language: 'ml',
                region: 'IN',
                release_date_gte: recentWindow.gte,
                release_date_lte: recentWindow.lte
            }),
            // 5. ✨ Kannada (Sandalwood)
            discoverMedia({
                type: 'movie',
                sort_by: 'popularity.desc',
                with_original_language: 'kn',
                region: 'IN',
                release_date_gte: recentWindow.gte,
                release_date_lte: recentWindow.lte
            }),
            // 6. Trending (Overall)
            fetchTmdbList('/trending/all/day', { region: 'IN' }),

            // 7. ✨ Critics' Choice
            discoverMedia({
                type: 'movie',
                sort_by: 'vote_average.desc',
                region: 'IN',
                release_date_gte: `${new Date().getFullYear()}-01-01`,
            }),

            // 8. ✨ Desi Action
            discoverMedia({
                type: 'movie',
                with_genres: '28',
                region: 'IN',
                sort_by: 'popularity.desc',
                release_date_gte: getDateWindow(90).gte
            }),
        ]);

        sections.push({ title: 'Trending in India', items: topTrending, href: '/discover/trending' });
        sections.push({ title: 'New in Bollywood (Hindi)', items: bollywood, href: '/discover/movies?lang=hi' });
        sections.push({ title: 'Latest Telugu Hits', items: tollywood, href: '/discover/movies?lang=te' });
        sections.push({ title: 'Best of Malayalam Cinema', items: mollywood, href: '/discover/movies?lang=ml' });
        sections.push({ title: 'Tamil Blockbusters', items: kollywood, href: '/discover/movies?lang=ta' });
        sections.push({ title: 'Kannada Action & Drama', items: sandalwood, href: '/discover/movies?lang=kn' });
        sections.push({ title: 'High Octane Indian Action', items: panIndianAction, href: '/discover/movies?genre=action' });

        const gems = criticsChoice.filter(m => m.vote_count && m.vote_count > 20).slice(0, 10);
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
// == PURE FETCH ACTIONS (DETAILS & DEEP DATA) - ✨ OPTIMIZED
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
        const usRelease = data.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US');
        const certification = usRelease?.release_dates?.[0]?.certification || 'NR';
        const providers = data["watch/providers"]?.results?.IN || data["watch/providers"]?.results?.US || {};

        // ✨ CREW EXTRACTION
        const crew = data.credits?.crew || [];
        const getCrew = (job: string): CrewMember[] => crew
            .filter((p: any) => p.job === job)
            .map((p: any) => ({
                id: p.id,
                name: p.name,
                profile_path: p.profile_path,
                job: p.job,
                department: p.department
            }));

        // Deduplicate writers
        const allWriters = [...getCrew('Screenplay'), ...getCrew('Writer'), ...getCrew('Story')];
        const uniqueWriters = Array.from(new Map(allWriters.map(item => [item.id, item])).values());

        return {
            id: data.id,
            title: data.title,
            original_title: data.original_title,
            media_type: 'movie',
            adult: data.adult,
            overview: data.overview,
            poster_path: data.poster_path,
            backdrop_path: data.backdrop_path,
            release_date: data.release_date,
            genres: data.genres,
            runtime: data.runtime,
            tagline: data.tagline,
            vote_average: data.vote_average,
            certification,
            keywords: data.keywords?.keywords || [],
            social_ids: data.external_ids || {},

            // Deep Data
            director: getCrew('Director')[0]?.name || undefined,
            original_language: data.original_language,
            spoken_languages: data.spoken_languages?.map((l: any) => l.english_name) || [],
            budget: data.budget,
            revenue: data.revenue,
            production_companies: data.production_companies || [],
            collection: data.belongs_to_collection,
            origin_country: data.origin_country || [],

            crew: {
                writers: uniqueWriters,
                cinematographers: getCrew('Director of Photography'),
                editors: getCrew('Editor'),
                composers: getCrew('Original Music Composer'),
                producers: getCrew('Producer')
            },

            cast: data.credits?.cast?.slice(0, 16) || [],

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
        console.error("TMDB Movie Fetch Error:", error);
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
        const creator = data.created_by?.[0]?.name || null;
        const usRating = data.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US');
        const certification = usRating?.rating || 'NR';
        const providers = data["watch/providers"]?.results?.IN || data["watch/providers"]?.results?.US || {};

        // ✨ TV CAST FIX: Safe extraction of character
        const cast = (data.aggregate_credits?.cast || []).slice(0, 16).map((actor: any) => ({
            id: actor.id,
            name: actor.name,
            profile_path: actor.profile_path,
            character: actor.roles && actor.roles.length > 0 ? actor.roles[0].character : 'Unknown'
        }));

        // ✨ TV CREW FIX: Safe extraction
        const rawCrew = data.aggregate_credits?.crew || [];
        const getTvCrew = (targetJob: string) => rawCrew.filter((p: any) =>
            p.jobs?.some((j: any) => j.job === targetJob)
        ).map((p: any) => ({
            id: p.id,
            name: p.name,
            profile_path: p.profile_path,
            job: targetJob,
            department: p.department
        }));

        return {
            id: data.id,
            title: data.name,
            original_title: data.original_name,
            media_type: 'tv',
            adult: data.adult,
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
            certification,
            keywords: data.keywords?.results || [],
            social_ids: data.external_ids || {},
            original_language: data.original_language,
            spoken_languages: data.spoken_languages?.map((l: any) => l.english_name) || [],
            production_companies: data.production_companies || [],
            networks: data.networks || [],
            type: data.type,
            origin_country: data.origin_country || [],
            next_episode_to_air: data.next_episode_to_air,
            last_episode_to_air: data.last_episode_to_air,
            seasons: data.seasons?.filter((s: any) => s.season_number > 0) || [],

            crew: {
                writers: getTvCrew('Writer'),
                cinematographers: getTvCrew('Director of Photography'),
                editors: getTvCrew('Editor'),
                composers: getTvCrew('Original Music Composer'),
                producers: [...getTvCrew('Executive Producer'), ...getTvCrew('Producer')]
            },

            cast: cast,

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

        if (!res.ok) {
            console.error(`TMDB Person Error ${res.status}: ${res.statusText}`);
            throw new Error(`Failed to fetch person: ${res.status}`);
        }

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
            adult: data.adult,
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
        throw error;
    }
}

// =====================================================================
// == CACHE ACTIONS (UPSERT TO SUPABASE)
// =====================================================================

export async function cacheMovie(movieId: number) {
    const supabaseAdmin = await createAdminClient();

    // 1. Check if exists to avoid unnecessary API calls
    const { data: existing } = await supabaseAdmin
        .from('movies')
        .select('tmdb_id')
        .eq('tmdb_id', movieId)
        .maybeSingle();

    if (existing) return;

    // 2. Fetch fresh deep data
    const details = await getMovieDetails(movieId);

    // 3. Upsert with all Deep Data fields
    await supabaseAdmin.from('movies').upsert({
        tmdb_id: details.id,
        title: details.title,
        adult: details.adult,
        poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
        backdrop_url: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
        release_date: details.release_date,
        director: details.director,
        overview: details.overview,
        genres: details.genres, // stored as jsonb
        cast: details.cast,     // stored as jsonb
        runtime: details.runtime,
        budget: details.budget,
        revenue: details.revenue,
        original_language: details.original_language,
        production_companies: details.production_companies,
        crew: details.crew
    }, { onConflict: 'tmdb_id' });
}

export async function cacheSeries(seriesId: number) {
    const supabaseAdmin = await createAdminClient();

    // 1. Check if exists
    const { data: existing } = await supabaseAdmin
        .from('series')
        .select('tmdb_id')
        .eq('tmdb_id', seriesId)
        .maybeSingle();

    if (existing) return;

    // 2. Fetch fresh deep data
    const details = await getSeriesDetails(seriesId);

    // 3. Upsert
    await supabaseAdmin.from('series').upsert({
        tmdb_id: details.id,
        adult: details.adult,
        title: details.title,
        poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
        backdrop_url: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
        release_date: details.release_date,
        creator: details.creator,
        number_of_seasons: details.number_of_seasons,
        overview: details.overview,
        genres: details.genres,
        cast: details.cast,
        status: details.status,
        original_language: details.original_language,
        networks: details.networks,
        production_companies: details.production_companies,
        crew: details.crew,
        last_air_date: details.last_episode_to_air?.air_date || null,
        next_episode_date: details.next_episode_to_air?.air_date || null
    }, { onConflict: 'tmdb_id' });
}

export async function cachePerson(personId: number) {
    const supabaseAdmin = await createAdminClient();

    // 1. Check for stale data (older than 7 days)
    const { data: existing } = await supabaseAdmin
        .from('people')
        .select('tmdb_id, updated_at')
        .eq('tmdb_id', personId)
        .maybeSingle();

    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    const isStale = !existing || !existing.updated_at || (Date.now() - new Date(existing.updated_at).getTime() > ONE_WEEK);

    if (!isStale) return;

    // 2. Fetch fresh details
    const details = await getPersonDetails(personId);

    // 3. Upsert
    await supabaseAdmin.from('people').upsert({
        tmdb_id: details.id,
        name: details.name,
        adult: details.adult,
        biography: details.biography,
        birthday: details.birthday || null,
        deathday: details.deathday || null,
        place_of_birth: details.place_of_birth,
        profile_path: details.profile_path,
        known_for_department: details.known_for_department,
        gender: details.gender,
        also_known_as: details.also_known_as, // stored as jsonb array

        updated_at: new Date().toISOString(),
    }, { onConflict: 'tmdb_id' });
}