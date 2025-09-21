// @/lib/actions/blog-actions.ts

'use server';

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUserProfile } from '@/lib/data/user-data';
import { ofetch } from 'ofetch';
import { v4 as uuidv4 } from 'uuid';


// =====================================================================
// == NEW ACTION: For Tiptap content image upload
// =====================================================================
const ContentImageSchema = z.object({
    image: z
        .instanceof(File, { message: 'A file is required.' })
        .refine((file) => file.size > 0, 'File cannot be empty.')
        .refine((file) => file.type.startsWith('image/'), 'File must be an image.')
        // Using the 5MB limit from your tiptap-utils.ts
        .refine((file) => file.size < 5 * 1024 * 1024, 'Image must be less than 5MB.'),
});

export async function uploadContentImage(formData: FormData) {
    const supabase = await createClient();
    const userData = await getUserProfile();

    if (!userData?.user) {
        // Return a JSON error, don't throw
        return { success: false, error: 'You must be logged in to upload images.' };
    }

    const validatedFields = ContentImageSchema.safeParse({
        image: formData.get('image'),
    });

    if (!validatedFields.success) {
        const fieldErrors = validatedFields.error.flatten().fieldErrors;
        const firstError = fieldErrors.image?.[0];
        return { success: false, error: firstError || 'Invalid file.' };
    }

    const { image } = validatedFields.data;
    const fileExtension = image.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // Suggestion: Use a different folder or bucket for content images
    const filePath = `${userData.user.id}/content_images/${fileName}`;

    // Suggestion: Create a new bucket named 'post_images' for organization
    const { error: uploadError } = await supabase.storage
        .from('post_images') // Using a new bucket for content images
        .upload(filePath, image);

    if (uploadError) {
        console.error('Content Image Upload Error:', uploadError);
        return { success: false, error: 'Could not upload the image.' };
    }

    const { data } = supabase.storage.from('post_images').getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
}

// =====================================================================
// == NEW ACTION: For immediate banner upload
// =====================================================================
const BannerSchema = z.object({
    banner: z
        .instanceof(File, { message: 'A file is required.' })
        .refine((file) => file.size > 0, 'File cannot be empty.')
        .refine((file) => file.type.startsWith('image/'), 'File must be an image.')
        .refine((file) => file.size < 4 * 1024 * 1024, 'Image must be less than 4MB.'),
});

export async function uploadBanner(formData: FormData) {
    const supabase = await createClient();
    const userData = await getUserProfile();

    if (!userData?.user) {
        return { success: false, error: 'You must be logged in to upload images.' };
    }

    const validatedFields = BannerSchema.safeParse({
        banner: formData.get('banner'),
    });

    if (!validatedFields.success) {
        const fieldErrors = validatedFields.error.flatten().fieldErrors;
        const firstError = fieldErrors.banner?.[0]; // Get the first error for the 'banner' field
        return { success: false, error: firstError || 'Invalid file.' };
    }

    const { banner } = validatedFields.data;
    const fileExtension = banner.name.split('.').pop();
    // Use a UUID for the filename to prevent conflicts
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${userData.user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('post_banners')
        .upload(filePath, banner);

    if (uploadError) {
        console.error('Banner Upload Error:', uploadError);
        return { success: false, error: 'Could not upload banner image.' };
    }

    const { data } = supabase.storage.from('post_banners').getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
}


// =====================================================================
// == MODIFIED ACTION: For creating the post
// =====================================================================
export type CreatePostState = { message?: string | null; errors?: { title?: string[]; content_html?: string[]; banner_url?: string[]; }; };

// The schema now expects a banner_url string, not a File object
const PostSchema = z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
    content_html: z.string().min(50, { message: 'Content must be at least 50 characters.' }),
    movieApiId: z.coerce.number().optional(),
    banner_url: z.string().url({ message: "Invalid banner URL." }).optional().or(z.literal('')), // Accept URL, empty string, or undefined
    rating: z.coerce.number().min(0).max(5).optional(),
    is_premium: z.string().optional().transform(value => value === 'on'),
    is_nsfw: z.string().optional().transform(value => value === 'on'),
});

// Helper to generate a URL-friendly and unique slug
function createSlug(title: string) {
    const randomSuffix = (Math.random() + 1).toString(36).substring(7);
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '') + `-${randomSuffix}`;
}


export async function createPost(prevState: CreatePostState, formData: FormData): Promise<CreatePostState> {
    const supabase = await createClient();
    const userData = await getUserProfile();
    if (!userData?.user || !userData.profile) return { message: 'You must be logged in.' };

    const validatedFields = PostSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    // De-structure the validated data, which now includes banner_url
    const { title, content_html, banner_url, movieApiId, rating, is_premium, is_nsfw } = validatedFields.data;
    const slug = createSlug(title);

    // The entire file upload block is now GONE from this action.

    if (movieApiId) {
        try {
            const movieDetails = await getMovieDetails(movieApiId);
            const { error: movieError } = await supabase.from('movies').upsert({
                tmdb_id: movieApiId,
                title: movieDetails.title,
                poster_url: movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : null,
                release_date: movieDetails.release_date,
                director: movieDetails.director,
            });
            if (movieError) {
                console.error("Movie upsert error:", movieError);
                return { message: "Database Error: Could not save movie details." };
            }
        } catch (error) {
            return { message: "Server Error: Could not fetch details for the linked movie." };
        }
    }

    const postToInsert = {
        author_id: userData.user.id,
        title,
        content_html,
        slug,
        banner_url: banner_url || null, // Use the URL from the form, or null if it's empty
        type: movieApiId ? 'review' as const : 'general' as const,
        movie_id: movieApiId,
        rating: rating || null,
        is_premium: is_premium,
        is_nsfw: is_nsfw,
        author_username: userData.profile.username,
        author_profile_pic_url: userData.profile.profile_pic_url,
    };

    const { error } = await supabase.from('posts').insert(postToInsert);
    if (error) {
        console.error("Post insert error:", error);
        return { message: `Database Error: Could not create post.` };
    }

    revalidatePath('/blog');
    redirect(`/blog/${slug}`);
}


// --- FOR MOVIE INFO CARD & POST CREATION ---

type CrewMember = {
    job: string;
    name: string;
};

export async function getMovieDetails(movieId: number) {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) throw new Error("TMDB API Key is not configured on the server.");
    try {
        const [movie, credits] = await Promise.all([
            ofetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`),
            ofetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`)
        ]);
        const director = credits.crew.find((person: CrewMember) => person.job === 'Director')?.name || 'N/A';        return {
            title: movie.title, overview: movie.overview, poster_path: movie.poster_path, release_date: movie.release_date,
            cast: credits.cast, director, genres: movie.genres
        };
    } catch (error) {
        console.error("TMDB Fetch Error:", error);
        throw new Error("Could not fetch movie details. Check the server logs for more info.");
    }
}

// =====================================================================
// == ACTION: For posting comments
// =====================================================================

// ✨ FIX: This function is now fully implemented.
export async function postComment(postId: string, formData: FormData) {
    const supabase = await createClient();

    // 1. Get User
    const userData = await getUserProfile();
    if (!userData?.user || !userData.profile) {
        return { error: 'You must be logged in to comment.' };
    }

    // 2. Validate Input
    const content = formData.get('comment') as string;
    if (!content || content.trim().length < 3) {
        return { error: 'Comment must be at least 3 characters.' };
    }

    // 3. Insert into Database
    const { error } = await supabase.from('comments').insert({
        post_id: postId,
        author_id: userData.user.id,
        content: content.trim(),
        author_username: userData.profile.username,
        author_profile_pic_url: userData.profile.profile_pic_url,
    });

    if (error) {
        console.error('Comment insert error:', error);
        return { error: 'Could not post comment. Please try again.' };
    }

    // 4. Revalidate and Return Success
    revalidatePath(`/blog/[slug]`, 'page');
    return { success: 'Comment posted!' };
}

// =====================================================================
// == ACTIONS: For likes
// =====================================================================

// ✨ FIX: This function is now fully implemented
export async function likePost(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'You must be logged in to like a post.' };

    const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: user.id });

    if (error) {
        console.error('Like error:', error);
        return { error: 'There was an error liking the post.' };
    }

    revalidatePath(`/blog/[slug]`, 'page');
    return { success: true };
}

// ✨ FIX: This function is now fully implemented
export async function unlikePost(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'You must be logged in to unlike a post.' };

    const { error } = await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id });

    if (error) {
        console.error('Unlike error:', error);
        return { error: 'There was an error unliking the post.' };
    }

    revalidatePath(`/blog/[slug]`, 'page');
    return { success: true };
}