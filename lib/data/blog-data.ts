'use server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { unstable_noStore as noStore } from 'next/cache';
import { CommentWithAuthor } from "@/lib/definitions";

export async function getPostBySlug(slug: string) {
    noStore();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: post } = await supabase.from('posts').select('*, author:profiles!posts_author_id_fkey(*), likes(count), comments(*, author:profiles(username, display_name, profile_pic_url))').eq('slug', slug).single();
    if (!post) return null;
    let userHasLiked = false;
    if (user) {
        const { data: like } = await supabase.from('likes').select('user_id').match({ post_id: post.id, user_id: user.id }).single();
        userHasLiked = !!like;
    }
    const likeCount = post.likes[0]?.count || 0;
    const comments = post.comments as CommentWithAuthor[];
    return { ...post, likeCount, userHasLiked, comments };
}

export async function getPosts() {
    noStore();
    const supabase = await createAdminClient();
    const { data: posts, error } = await supabase.from('posts').select('*, author:profiles!posts_author_id_fkey(*)').order('created_at', { ascending: false }).limit(20);
    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
    return posts;
}