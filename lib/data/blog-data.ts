'use server';

import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import { CommentWithAuthor, Movie, Series, Post, UserProfile } from "@/lib/definitions";

export type PostForFeed = Post & {
    author: UserProfile;
    movie: Pick<Movie, 'title' | 'poster_url'> | null;
    series: Pick<Series, 'title' | 'poster_url'> | null;
    // ✨ REMOVED: likes & comments arrays (now using integer columns in Post)
};

export type PostForPage = Post & {
    author: UserProfile;
    movie: Movie | null;
    series: Series | null;
    comments: CommentWithAuthor[];
    // ✨ REMOVED: likes array
};

/**
 * Fetches a paginated list of posts for the main blog feed.
 */
export async function getPosts(): Promise<PostForFeed[]> {
    noStore();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:profiles!posts_author_id_fkey(*), 
            movie:movies(title, poster_url),
            series:series(title, poster_url)
        `)
        .is('deleted_at', null) // ✨ ADDED: Filter out soft deleted posts
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
    return data as PostForFeed[];
}

/**
 * Fetches a single, detailed post by its slug.
 */
export async function getPostBySlug(slug: string) {
    noStore();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // ✨ FIX: Use .maybeSingle() instead of .single() to avoid PGRST116 error on 404s
    const { data: post, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:profiles!posts_author_id_fkey(*),
            movie:movies(*),
            series:series(*),
            comments(*, author:profiles!comments_author_id_fkey(username, display_name, profile_pic_url))
        `)
        .eq('slug', slug)
        .is('deleted_at', null) // ✨ ADDED: Filter out soft deleted posts
        .maybeSingle<PostForPage>();

    if (error) {
        console.error('Error fetching post by slug:', error);
        return null;
    }

    if (!post) {
        return null; // Post not found, handled gracefully
    }

    // Sort comments manually since we are fetching them via join
    if (post.comments) {
        post.comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    let userHasLiked = false;
    if (user) {
        // ✨ FIX: Use .maybeSingle() here too for safety
        const { data: like } = await supabase
            .from('likes')
            .select('user_id')
            .match({ post_id: post.id, user_id: user.id })
            .maybeSingle();
        userHasLiked = !!like;
    }

    // ✨ UPDATED: Read directly from the new column
    const likeCount = post.likes_count || 0;

    return { ...post, likeCount, userHasLiked };
}

/**
 * Fetches all posts created by a specific user.
 */
export async function getPostsByUserId(userId: string): Promise<PostForFeed[]> {
    noStore();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:profiles!posts_author_id_fkey(*),
            movie:movies(title, poster_url),
            series:series(title, poster_url)
        `)
        .eq('author_id', userId)
        .is('deleted_at', null) // ✨ ADDED
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching user's posts:", error);
        return [];
    }

    return data as PostForFeed[];
}