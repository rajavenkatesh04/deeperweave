/**
 * =====================================================================
 * 👤 USER & AUTHENTICATION
 * Core user profile structures linked to Supabase Auth.
 * =====================================================================
 */

export type UserRole = 'user' | 'critic' | 'verified' | 'staff' | 'support' | 'tester';

export interface UserProfile {
    id: string; // UUID from Supabase Auth
    created_at: string;
    username: string; // Unique @handle
    display_name: string;
    date_of_birth: string; // ISO Date (YYYY-MM-DD)
    country?: string;
    gender?: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say';
    bio?: string;
    profile_pic_url?: string;

    // Settings & Preferences
    subscription_status: 'free' | 'premium';
    content_preference: 'sfw' | 'all';
    visibility: 'public' | 'private';
    role: UserRole;
}

export interface ProfileSearchResult {
    id: string;
    username: string;
    display_name: string;
    bio?: string | null;
    profile_pic_url?: string | null;
    role: UserRole;
    visibility: 'public' | 'private';
    follow_status: 'not_following' | 'pending' | 'accepted';
}

/**
 * =====================================================================
 * 🎬 CINEMATIC DATA (API & Cache)
 * =====================================================================
 */

// Basic search result (used in lists, feeds)
export interface CinematicSearchResult {
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
    vote_count?: number;
    vote_average?: number;
}

// Helper for Crew Cards
export interface CrewMember {
    id: number;
    name: string;
    profile_path: string | null;
    job: string;
    department?: string;
}

// Full Details for Page View
export interface RichCinematicDetails {
    id: number;
    title: string;
    original_title?: string; // ✨ NEW: For foreign titles
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
    certification: string;
    keywords: { id: number; name: string }[];
    social_ids: { imdb_id?: string; instagram_id?: string; twitter_id?: string };

    // Deep Data Fields
    original_language: string;
    spoken_languages: string[];
    production_companies: { id: number; name: string; logo_path: string | null }[];
    origin_country?: string[];

    // Movie Specifics
    director?: string;
    budget?: number;
    revenue?: number;
    collection?: { id: number; name: string; poster_path: string | null; backdrop_path: string | null } | null;

    // ✨ UPDATED: Crew is now rich objects (name + image)
    crew: {
        writers: CrewMember[];
        cinematographers: CrewMember[];
        editors: CrewMember[];
        composers: CrewMember[];
        producers: CrewMember[];
    };

    // TV/Anime Specifics
    creator?: string;
    networks?: { name: string; logo_path: string | null }[];
    type?: string;
    next_episode_to_air?: { air_date: string; episode_number: number; name: string } | null;
    last_episode_to_air?: { air_date: string; episode_number: number; name: string } | null;
    seasons?: {
        id: number;
        name: string;
        episode_count: number;
        air_date: string;
        poster_path: string | null;
        season_number: number;
    }[];

    cast: { id: number; name: string; profile_path: string | null; character: string }[];

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

// Database Cache Interfaces
export interface Movie {
    tmdb_id: number; // Primary Key
    title: string;
    release_date: string;
    director?: string;
    poster_url: string | null;
    backdrop_url?: string | null;

    // ✨ NEW: Deep Data Cache
    runtime?: number;
    budget?: number;
    revenue?: number;
    original_language?: string;
    production_companies?: string[]; // Array of Studio Names
}

export interface Series {
    tmdb_id: number; // Primary Key
    title: string;
    release_date: string;
    creator?: string;
    poster_url: string | null;
    backdrop_url?: string | null;
    number_of_seasons?: number;

    // ✨ NEW: Deep Data Cache
    status?: string;
    networks?: string[];
    last_air_date?: string;
    next_episode_date?: string;
}

export interface Person {
    tmdb_id: number; // Primary Key
    name: string;
    profile_path: string | null;
    known_for_department?: string;
    biography?: string;
}

/**
 * =====================================================================
 * 🏗️ PROFILE SHOWCASE SYSTEM (Modular Sections)
 * =====================================================================
 */

export interface SectionItem {
    id: string; // UUID
    section_id: string;
    item_type: 'movie' | 'tv' | 'person';
    rank: number;
    movie?: Movie | null;
    series?: Series | null;
    person?: Person | null;
}

export interface ProfileSection {
    id: string;
    user_id: string;
    title: string;
    type: 'mixed' | 'movie' | 'tv' | 'person';
    rank: number;
    items: SectionItem[];
}

/**
 * =====================================================================
 * 📅 TIMELINE & LOGGING
 * =====================================================================
 */

export interface TimelineEntry {
    id: string; // UUID
    user_id: string;
    watched_on: string; // ISO Date
    rating: number | null;
    notes: string | null;
    created_at: string;
    is_rewatch: boolean;
    rewatch_count?: number;
    viewing_context: string | null;
    photo_url: string | null;
    post_id: string | null;
    movie_id: number | null;
    series_id: number | null;
    movies: Movie | null;
    series: Series | null;
    posts: { slug: string } | null;
    timeline_collaborators: TimelineCollaboratorWithProfile[];
}

export interface TimelineCollaborator {
    entry_id: string;
    user_id: string;
}

export type TimelineCollaboratorWithProfile = TimelineCollaborator & {
    profiles: Pick<UserProfile, 'id' | 'username' | 'profile_pic_url'>;
};

export type TimelineEntryWithUser = TimelineEntry & {
    profiles: Pick<UserProfile, 'username' | 'display_name' | 'profile_pic_url'>;
};

/**
 * =====================================================================
 * 📝 POSTS & BLOG
 * =====================================================================
 */

export interface Post {
    id: string;
    author_id: string;
    slug: string;
    type: 'review' | 'general';
    title: string;
    content_html: string;
    banner_url?: string | null;
    created_at: string;
    view_count: number;
    deleted_at?: string | null;
    likes_count: number;
    comments_count: number;
    rating?: number;
    has_spoilers: boolean;
    movie_id?: number;
    series_id?: number;
    is_premium: boolean;
    is_nsfw: boolean;
}

export interface Comment {
    id: string;
    post_id: string;
    author_id: string;
    content: string;
    created_at: string;
    deleted_at?: string | null;
}

export type CommentWithAuthor = Comment & {
    author: Pick<UserProfile, 'username' | 'display_name' | 'profile_pic_url'>;
};

/**
 * =====================================================================
 * ❤️ SOCIAL, SAVED & CHAT
 * =====================================================================
 */

export interface Like {
    post_id: string;
    user_id: string;
    created_at: string;
}

export interface Follow {
    follower_id: string;
    following_id: string;
    created_at: string;
}

export interface Notification {
    id: string;
    recipient_id: string;
    actor_id: string;
    actor_username: string;
    type: 'new_follower' | 'like' | 'comment';
    target_post_id?: string;
    is_read: boolean;
    created_at: string;
}

export type SaveableItemType = 'movie' | 'series' | 'person' | 'post' | 'profile';

export interface SavedItem {
    id: string;
    item_type: SaveableItemType;
    created_at: string;
    movie?: { tmdb_id: number; title: string; poster_url: string | null };
    series?: { tmdb_id: number; title: string; poster_url: string | null };
    person?: { tmdb_id: number; name: string; profile_path: string | null };
    post?: { id: string; title: string; banner_url: string | null; slug: string };
    profile?: { username: string; display_name: string; profile_pic_url: string | null };
}

export interface MovieInterest {
    user_id: string;
    movie_tmdb_id: number;
    status: 'interested' | 'watched';
    created_at: string;
}

export interface ChatRoom {
    id: string;
    type: 'dm' | 'group' | 'public' | 'temp';
    created_by: string;
    name?: string;
    description?: string;
    expires_at?: string;
    created_at: string;
}

export interface ChatParticipant {
    room_id: string;
    user_id: string;
    role: 'admin' | 'member';
    joined_at: string;
    last_read_at: string;
}

export interface Message {
    id: string;
    room_id: string;
    author_id: string;
    content: string;
    created_at: string;
    author_username: string;
    author_profile_pic_url?: string;
}

export interface ReadReceipt {
    message_id: string;
    user_id: string;
    read_at: string;
}