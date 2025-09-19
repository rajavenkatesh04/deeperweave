'use server';

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUserProfile } from '@/lib/data';
import { ofetch } from 'ofetch';
import {Movie} from "@/lib/definitions";

// Helper to generate a URL-friendly and unique slug
function createSlug(title: string) {
    const randomSuffix = (Math.random() + 1).toString(36).substring(7);
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '') + `-${randomSuffix}`;
}

// --- FOR CREATING POSTS ---
export type CreatePostState = { message?: string | null; errors?: { title?: string[]; content_html?: string[]; banner?: string[]; }; };

const PostSchema = z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
    content_html: z.string().min(50, { message: 'Content must be at least 50 characters.' }),
    movieApiId: z.coerce.number().optional(),
    movieTitle: z.string().optional(),
    moviePosterUrl: z.string().optional(),
    movieReleaseDate: z.string().optional(),
    banner: z.instanceof(File).refine(file => file.size === 0 || file.type.startsWith('image/'), "File must be an image.").refine(file => file.size < 4_000_000, "Image must be less than 4MB.").optional(),
});

export async function createPost(prevState: CreatePostState, formData: FormData): Promise<CreatePostState> {
    const supabase = await createClient();
    const userData = await getUserProfile();
    if (!userData?.user || !userData.profile) return { message: 'You must be logged in.' };

    const validatedFields = PostSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return { errors: validatedFields.error.flatten().fieldErrors };

    const { title, content_html, banner, movieApiId, movieTitle, moviePosterUrl, movieReleaseDate } = validatedFields.data;
    const slug = createSlug(title);
    let bannerUrl: string | undefined = undefined;

    if (banner && banner.size > 0) {
        const fileExtension = banner.name.split('.').pop();
        const filePath = `${userData.user.id}/${slug}.${fileExtension}`;
        const { error: uploadError } = await supabase.storage.from('post_banners').upload(filePath, banner);
        if (uploadError) return { message: 'Database Error: Could not upload banner image.' };
        bannerUrl = supabase.storage.from('post_banners').getPublicUrl(filePath).data.publicUrl;
    }

    if (movieApiId) {
        const { error: movieError } = await supabase.from('movies').upsert({
            tmdb_id: movieApiId, title: movieTitle, poster_url: moviePosterUrl, release_date: movieReleaseDate,
        });
        if (movieError) return { message: "Database Error: Could not save movie details." };
    }

    const postToInsert = {
        author_id: userData.user.id, title, content_html, slug, banner_url: bannerUrl,
        type: movieApiId ? 'review' : 'general' as const,
        movie_id: movieApiId,
        author_username: userData.profile.username,
        author_profile_pic_url: userData.profile.profile_pic_url,
    };

    const { error } = await supabase.from('posts').insert(postToInsert);
    if (error) return { message: `Database Error: ${error.message}` };

    revalidatePath('/blog');
    redirect(`/blog/${slug}`);
}

// --- FOR MOVIE INFO CARD ---
interface TMDBMovie {
    overview: string;
    genres: Array<{ id: number; name: string }>;
}

interface TMDBCredits {
    cast: Array<{ id: number; name: string; character: string }>;
    crew: Array<{ id: number; name: string; job: string }>;
}

export async function getMovieDetails(movieId: number) {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key is not configured on the server.");

    try {
        const [movie, credits] = await Promise.all([
            ofetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`),
            ofetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`)
        ]);
        const director = credits.crew.find((p: TMDBMovie) => p.overview === 'Director')?.name || 'N/A';
        return { poster:movie.poster ,overview: movie.overview, cast: credits.cast, director, genres: movie.genres };
    } catch (error) {
        // ✨ FIX: Log the actual error to your server terminal for debugging
        console.error("TMDB Fetch Error:", error);
        throw new Error("Could not fetch movie details. Check the server logs for more info.");
    }
}

// --- FOR POSTING COMMENTS ---
export async function postComment(postId: string, formData: FormData) {
    const content = formData.get('comment') as string;
    if (!content || content.trim().length < 3) return { error: 'Comment must be at least 3 characters.' };

    const supabase = await createClient();
    const userData = await getUserProfile();
    if (!userData?.user || !userData.profile) return { error: 'You must be logged in to comment.' };

    const { error } = await supabase.from('comments').insert({
        post_id: postId,
        author_id: userData.user.id,
        content: content,
        author_username: userData.profile.username,
        author_profile_pic_url: userData.profile.profile_pic_url,
    });
    if (error) return { error: 'Could not post comment.' };

    revalidatePath(`/blog/[slug]`, 'page');
    return { success: 'Comment posted!' };
}


// --- FOR LIKES ---
export async function likePost(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'You must be logged in.' };

    const { error } = await supabase.from('likes').upsert({ post_id: postId, user_id: user.id });
    if (error) return { error: 'Could not like post.' };

    revalidatePath(`/blog/[slug]`, 'page');
    return { success: true };
}

export async function unlikePost(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'You must be logged in.' };

    const { error } = await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id });
    if (error) return { error: 'Could not unlike post.' };

    revalidatePath(`/blog/[slug]`, 'page');
    return { success: true };
}