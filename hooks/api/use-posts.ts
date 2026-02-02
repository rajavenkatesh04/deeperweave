import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
// Ensure this path matches where you have the type defined, or remove it and use 'any' if it errors
import { PostForFeed } from "@/lib/data/blog-data";

const fetchUserPosts = async (username: string) => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:profiles!posts_author_id_fkey!inner(username, display_name, profile_pic_url),
            movie:movies(title, poster_url, release_date),
            series:series(title, poster_url, release_date)
        `)
        .eq('author.username', username)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Supabase Posts Error:", JSON.stringify(error, null, 2));
        throw error;
    }

    // 🛠️ NORMALIZATION: Flatten Arrays to Objects
    const normalizedData = (data || []).map((post: any) => ({
        ...post,
        author: Array.isArray(post.author) ? post.author[0] : post.author,
        movie: Array.isArray(post.movie) ? post.movie[0] : post.movie,
        series: Array.isArray(post.series) ? post.series[0] : post.series,
    }));

    return normalizedData as unknown as PostForFeed[];
};

export function usePosts(username: string) {
    return useQuery({
        queryKey: ['posts', username],
        queryFn: () => fetchUserPosts(username),
        staleTime: 5 * 60 * 1000,
    });
}