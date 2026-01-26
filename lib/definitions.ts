/**
 * =====================================================================
 * 👤 USER & AUTHENTICATION
 * Core user profile structures linked to Supabase Auth.
 * =====================================================================
 */

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
}

export interface ProfileSearchResult {
    id: string;
    username: string;
    display_name: string;
    bio?: string | null;
    profile_pic_url?: string | null;
}

/**
 * =====================================================================
 * 🎬 CINEMATIC DATA (Cache)
 * Stores data fetched from TMDB to avoid rate limits.
 * =====================================================================
 */

export interface Movie {
    tmdb_id: number; // Primary Key
    title: string;
    release_date: string;
    director?: string;
    poster_url: string | null;
    backdrop_url?: string | null;
}

export interface Series {
    tmdb_id: number; // Primary Key
    title: string;
    release_date: string;
    creator?: string;
    poster_url: string | null;
    backdrop_url?: string | null;
    number_of_seasons?: number;
}

export interface Person {
    tmdb_id: number; // Primary Key
    name: string;
    profile_path: string | null;
    known_for_department?: string;
    biography?: string; // Optional full bio
}

/**
 * =====================================================================
 * 🏗️ PROFILE SHOWCASE SYSTEM (Modular Sections)
 * Allows users to create "Top 3 Movies", "Favorite Stars", etc.
 * =====================================================================
 */

export interface SectionItem {
    id: string; // UUID
    section_id: string;
    item_type: 'movie' | 'tv' | 'person';
    rank: number;

    // Polymorphic Relations (Only one is populated)
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
 * Tracking what users watch, when, and their thoughts.
 * =====================================================================
 */

export interface TimelineEntry {
    id: string; // UUID
    user_id: string;
    watched_on: string; // ISO Date
    rating: number | null;
    notes: string | null;
    created_at: string;

    // Metadata
    is_rewatch: boolean;
    viewing_context: string | null; // e.g. "Cinema", "Netflix"
    photo_url: string | null; // User upload
    post_id: string | null; // Linked review post

    // Content References (Nullable because it's either Movie OR Series)
    movie_id: number | null;
    series_id: number | null;

    // Joined Data
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

// Joined type for Sharing features
export type TimelineEntryWithUser = TimelineEntry & {
    profiles: Pick<UserProfile, 'username' | 'display_name' | 'profile_pic_url'>;
};

/**
 * =====================================================================
 * 📝 POSTS & BLOG
 * Long-form content, reviews, and general updates.
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
    deleted_at?: string | null; // ✨ ADDED

    // Counters (New DB Columns)
    likes_count: number;    // ✨ ADDED
    comments_count: number; // ✨ ADDED

    // Review specific
    rating?: number;
    has_spoilers: boolean;
    movie_id?: number;
    series_id?: number;

    // Settings
    is_premium: boolean;
    is_nsfw: boolean;

    // ✨ REMOVED: author_username
    // ✨ REMOVED: author_profile_pic_url
}

export interface Comment {
    id: string;
    post_id: string;
    author_id: string;
    content: string;
    created_at: string;
    deleted_at?: string | null; // ✨ ADDED
}

export type CommentWithAuthor = Comment & {
    author: Pick<UserProfile, 'username' | 'display_name' | 'profile_pic_url'>;
};
/**
 * =====================================================================
 * ❤️ SOCIAL (Likes, Follows, Notifications)
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

/**
 * =====================================================================
 * 💾 SAVED ITEMS & COLLECTIONS
 * "Watch later", "Favorites", etc.
 * =====================================================================
 */

export type SaveableItemType = 'movie' | 'series' | 'person' | 'post' | 'profile';

export interface SavedItem {
    id: string;
    item_type: SaveableItemType;
    created_at: string;

    // Polymorphic Relations
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

/**
 * =====================================================================
 * 💬 CHAT SYSTEM
 * Real-time messaging structure.
 * =====================================================================
 */

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