import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

export async function getPostBySlug(slug: string) {
    noStore();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: post } = await supabase
        .from('posts')
        .select('*, author:profiles(*), likes(count), comments(*, author:profiles(username, display_name, profile_pic_url))')
        .eq('slug', slug)
        .single();

    if (!post) return null;

    let userHasLiked = false;
    if (user && post) {
        const { data: like } = await supabase.from('likes').select('user_id').match({ post_id: post.id, user_id: user.id }).single();
        userHasLiked = !!like;
    }

    const likeCount = post.likes[0]?.count || 0;

    return { ...post, likeCount, userHasLiked };
}