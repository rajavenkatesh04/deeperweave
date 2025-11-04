'use server';

import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';
import { CommentWithAuthor, Movie, Series, Post, UserProfile } from "@/lib/definitions"; // ✨ 1. IMPORT Series

// ✨ 2. UPDATE TYPES
export type PostForFeed = Post & {
    author: UserProfile;
    movie: Pick<Movie, 'title' | 'poster_url'> | null;
    series: Pick<Series, 'title' | 'poster_url'> | null; // ✨ ADDED
    likes: [{ count: number }];
    comments: [{ count: number }];
};

export type PostForPage = Post & {
    author: UserProfile;
    movie: Movie | null;
    series: Series | null; // ✨ ADDED
    comments: CommentWithAuthor[];
    likes: [{ count: number }];
};


/**
 * Fetches a paginated list of posts for the main blog feed.
 */
export async function getPosts(): Promise<PostForFeed[]> {
    noStore();
    const supabase = await createClient();

    // ✨ 3. UPDATE SELECT
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:profiles!posts_author_id_fkey(*), 
            movie:movies(title, poster_url),
            series:series(title, poster_url),
            likes(count),
            comments(count)
        `)
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

    // ✨ 4. UPDATE SELECT
    const { data: post, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:profiles!posts_author_id_fkey(*),
            movie:movies(*),
            series:series(*),
            comments(*, author:profiles!comments_author_id_fkey(username, display_name, profile_pic_url)),
            likes(count)
        `)
        .eq('slug', slug)
        .single<PostForPage>();

    if (error || !post) {
        console.error('Error fetching post by slug:', error);
        return null;
    }

    let userHasLiked = false;
    if (user) {
        const { data: like } = await supabase
            .from('likes')
            .select('user_id')
            .match({ post_id: post.id, user_id: user.id })
            .single();
        userHasLiked = !!like;
    }

    const likeCount = post.likes?.[0]?.count || 0;

    return { ...post, likeCount, userHasLiked };
}


/**
 * Fetches all posts created by a specific user.
 */
export async function getPostsByUserId(userId: string): Promise<PostForFeed[]> {
    noStore();
    const supabase = await createClient();

    // ✨ 5. UPDATE SELECT
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:profiles!posts_author_id_fkey(*),
            movie:movies(title, poster_url),
            series:series(title, poster_url),
            likes(count),
            comments(count)
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching user's posts:", error);
        return [];
    }

    return data as PostForFeed[];
}