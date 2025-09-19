// definitions.ts

// =====================================================================
// == User & Profile Structures
// =====================================================================

/**
 * Represents the public user profile.
 * Stored in the 'profiles' table. Linked to Supabase Auth.
 */
export interface UserProfile {
    id: string; // This is the UUID from Supabase Auth
    username: string; // The unique, public @handle
    display_name: string; // The user's full name
    date_of_birth: string; // ISO Date string (e.g., "1990-01-15"). Used for age verification (18+).
    country?: string; // ISO 3166-1 alpha-2 country code (e.g., "IN" for India)
    gender?: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say';
    bio?: string;
    profile_pic_url?: string;
    // For monetization and content filtering
    subscription_status: 'free' | 'premium'; // Managed via webhooks from a payment provider
    content_preference: 'sfw' | 'all'; // Default to 'sfw'. User must be 18+ to change to 'all'.
    visibility: 'public' | 'private';
}

// =====================================================================
// == Core Content Structures (Posts & Movies)
// =====================================================================

/**
 * Represents a single blog post. Can be a movie review or a general post.
 * Stored in the 'posts' table.
 */
export interface Post {
    id: string;
    author_id: string;
    slug: string; // Add this
    type: 'review' | 'general';
    movie_id?: number;
    title: string;
    content_html: string;
    banner_url?: string | null; // Add this
    rating?: number;
    is_premium: boolean;
    is_nsfw: boolean;
    created_at: string;
    view_count: number; // Add this
    author_username: string;
    author_profile_pic_url?: string;
}

// Add this new type for comments that are joined with author profiles
export type CommentWithAuthor = {
    id: string;
    post_id: string;
    author_id: string;
    content: string;
    created_at: string;
    author: Pick<UserProfile, 'username' | 'display_name' | 'profile_pic_url'>;
};

/**
 * Represents movie data from an external API like TMDB.
 * Stored in a 'movies' table to cache data and avoid re-fetching.
 */
export interface Movie {
    tmdb_id: number; // The Movie Database ID is the primary key
    title: string;
    release_date: string;
    director?: string;
    poster_url: string;
    backdrop_url?: string;
}

/**
 * Join table to track user interest in movies for the "Explore" feature.
 * Stored in the 'movie_interests' table.
 */
export interface MovieInterest {
    user_id: string; // Foreign key to profiles.id
    movie_tmdb_id: number; // Foreign key to movies.tmdb_id
    status: 'interested' | 'watched';
    created_at: string;
}

// =====================================================================
// == Social Interaction Structures
// =====================================================================

/**
 * Represents a "like" on a post.
 * Stored in the 'likes' table.
 */
export interface Like {
    post_id: string;
    user_id: string;
    created_at: string;
}

/**
 * Represents a follow relationship.
 * Stored in the 'followers' table.
 */
export interface Follow {
    follower_id: string; // The user who is doing the following
    following_id: string; // The user who is being followed
    created_at: string;
}

/**
 * Represents a notification for a user.
 * Stored in the 'notifications' table.
 */
export interface Notification {
    id: string;
    recipient_id: string; // The user who should receive the notification
    actor_id: string; // The user who triggered the notification
    actor_username: string; // Denormalized for easy display

    type: 'new_follower' | 'like' | 'comment';
    target_post_id?: string; // Which post was liked/commented on
    is_read: boolean;
    created_at: string;
}

// =====================================================================
// == Chat System Structures
// =====================================================================

/**
 * Represents a chat room's metadata.
 * Stored in the 'chat_rooms' table.
 */
export interface ChatRoom {
    id: string; // Unique UUID for the room
    type: 'dm' | 'group' | 'public' | 'temp';
    created_by: string; // Foreign key to profiles.id
    name?: string; // Required for 'group' and 'public' types
    description?: string; // For public rooms to show in discovery

    // For temporary rooms, this timestamp determines when it gets deleted
    expires_at?: string; // ISO timestamp
    created_at: string;
}

/**
 * Join table linking users to the chat rooms they are in.
 * Stored in the 'chat_participants' table.
 */
export interface ChatParticipant {
    room_id: string; // Foreign key to chat_rooms.id
    user_id: string; // Foreign key to profiles.id
    role: 'admin' | 'member';
    joined_at: string;
}

/**
 * Represents a single message within a chat room.
 * Stored in the 'messages' table.
 */
export interface Message {
    id: string;
    room_id: string; // Foreign key to chat_rooms.id
    author_id: string; // Foreign key to profiles.id
    content: string; // The text of the message
    created_at: string;

    // Denormalized author data for faster display
    author_username: string;
    author_profile_pic_url?: string;
}

/**
 * Tracks when a user has read a specific message. Essential for 'seen' and 'read by' features.
 * Stored in the 'message_read_receipts' table.
 */
export interface ReadReceipt {
    message_id: string; // Foreign key to messages.id
    user_id: string; // The user who read the message
    read_at: string; // ISO timestamp
}



/**
 * Represents a comment on a blog post.
 * Designed for guests, so it only requires a name.
 */
export interface Comment {
    id: string; // Or number
    createdAt: string;
    postId: string; // Foreign key linking to the BlogPost
    authorName: string; // The name the commenter provides
    content: string;
}


export interface ProfileSearchResult {
    id: string;
    username: string;
    display_name: string;
    bio?: string | null;
    profile_pic_url?: string | null;
}