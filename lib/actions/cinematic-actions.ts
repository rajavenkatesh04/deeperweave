'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { RichCinematicDetails, CinematicSearchResult, CrewMember, PersonDetails } from '@/lib/definitions';

// Re-export types
export type { RichCinematicDetails, CinematicSearchResult, CrewMember, PersonDetails };

// Helper Types for Internal Use
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

const normalizeTmdbItem = (item: TmdbMultiSearchItem, forcedMediaType: 'movie' | 'tv' | null = null): CinematicSearchResult | null => {
    // Copy logic from discovery-actions if needed, or simply don't use it here since
    // getMovieDetails/getSeriesDetails map data manually below.
    // For now, I've inlined the mapping logic inside the detail functions to avoid dependencies.
    // If you need this helper here, paste the fixed version from discovery-actions.

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
        media_type: media_type || 'movie'
    };
};


// =====================================================================
// == PURE FETCH ACTIONS (DETAILS & ENTITIES)
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

        const allWriters = [...getCrew('Screenplay'), ...getCrew('Writer'), ...getCrew('Story')];
        const uniqueWriters = Array.from(new Map(allWriters.map(item => [item.id, item])).values());

        return {
            id: data.id,
            title: data.title,
            original_title: data.original_title,
            media_type: 'movie',
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

        const cast = (data.aggregate_credits?.cast || []).slice(0, 16).map((actor: any) => ({
            id: actor.id,
            name: actor.name,
            profile_path: actor.profile_path,
            character: actor.roles && actor.roles.length > 0 ? actor.roles[0].character : 'Unknown'
        }));

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

        if (!res.ok) throw new Error(`Failed to fetch person: ${res.status}`);

        const data = await res.json();
        const allCast = (data.combined_credits?.cast || []) as TmdbMultiSearchItem[];
        const sortedCast = allCast.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

        const knownFor = sortedCast
            .map((item) => normalizeTmdbItem(item))
            .filter((item): item is CinematicSearchResult => item !== null)
            .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
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
        throw error;
    }
}

// =====================================================================
// == CACHE HELPERS (FINAL "DEEP DATA" VERSIONS)
// =====================================================================

export async function cacheMovie(movieId: number) {
    const supabaseAdmin = await createAdminClient();
    const { data: existing } = await supabaseAdmin.from('movies').select('tmdb_id').eq('tmdb_id', movieId).maybeSingle();
    if (existing) return;

    const details = await getMovieDetails(movieId);

    await supabaseAdmin.from('movies').upsert({
        tmdb_id: details.id,
        title: details.title,
        poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
        backdrop_url: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
        release_date: details.release_date,
        director: details.director,
        overview: details.overview,
        genres: details.genres,
        cast: details.cast,
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
    const { data: existing } = await supabaseAdmin.from('series').select('tmdb_id').eq('tmdb_id', seriesId).maybeSingle();
    if (existing) return;

    const details = await getSeriesDetails(seriesId);

    await supabaseAdmin.from('series').upsert({
        tmdb_id: details.id,
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
    const { data: existing } = await supabaseAdmin.from('people').select('tmdb_id, updated_at').eq('tmdb_id', personId).maybeSingle();
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    const isStale = !existing || !existing.updated_at || (Date.now() - new Date(existing.updated_at).getTime() > ONE_WEEK);

    if (!isStale) return;

    const details = await getPersonDetails(personId);

    await supabaseAdmin.from('people').upsert({
        tmdb_id: details.id,
        name: details.name,
        biography: details.biography,
        birthday: details.birthday || null,
        deathday: details.deathday || null,
        place_of_birth: details.place_of_birth,
        profile_path: details.profile_path,
        known_for_department: details.known_for_department,
        gender: details.gender,
        also_known_as: details.also_known_as,
        updated_at: new Date().toISOString(),
    }, { onConflict: 'tmdb_id' });
}