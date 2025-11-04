'use server';

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUserProfile } from '@/lib/data/user-data';
// import { ofetch } from 'ofetch'; // ✨ 1. REMOVED ofetch
import { v4 as uuidv4 } from 'uuid';
// ✨ 2. ADDED IMPORTS from your new "library"
import { getMovieDetails, getSeriesDetails } from './cinematic-actions';

// =====================================================================
// == NEW ACTION: For Tiptap content image upload
// =====================================================================
const ContentImageSchema = z.object({
    image: z
        .instanceof(File, { message: 'A file is required.' })
        .refine((file) => file.size > 0, 'File cannot be empty.')
        .refine((file) => file.type.startsWith('image/'), 'File must be an image.')
        .refine((file) => file.size < 5 * 1024 * 1024, 'Image must be less than 5MB.'),
});

// (This function is unchanged)
export async function uploadContentImage(formData: FormData) {
    const supabase = await createClient();
    const userData = await getUserProfile();
    if (!userData?.user) {
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
    const filePath = `${userData.user.id}/content_images/${fileName}`;
    const { error: uploadError } = await supabase.storage
        .from('post_images')
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

// (This function is unchanged)
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
        const firstError = fieldErrors.banner?.[0];
        return { success: false, error: firstError || 'Invalid file.' };
    }
    const { banner } = validatedFields.data;
    const fileExtension = banner.name.split('.').pop();
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
export type CreatePostState = { message?: string | null; errors?: { title?: string[]; content_html?: string[]; banner_url?: string[]; cinematic?: string[]; }; };

// (This schema is unchanged)
const PostSchema = z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
    content_html: z.string().min(50, { message: 'Content must be at least 50 characters.' }),
    cinematicApiId: z.coerce.number().optional(),
    media_type: z.enum(['movie', 'tv']).optional(),
    banner_url: z.string().url({ message: "Invalid banner URL." }).optional().or(z.literal('')),
    rating: z.coerce.number().min(0).max(5).step(0.5).optional(),
    is_premium: z.string().optional().transform(value => value === 'on'),
    is_nsfw: z.string().optional().transform(value => value === 'on'),
    has_spoilers: z.string().optional().transform(value => value === 'on'),
});

// (This function is unchanged)
function createSlug(title: string) {
    const randomSuffix = (Math.random() + 1).toString(36).substring(7);
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '') + `-${randomSuffix}`;
}

// (This function is unchanged, but now relies on the imported caching functions)
export async function createPost(prevState: CreatePostState, formData: FormData): Promise<CreatePostState> {
    const supabase = await createClient();
    const userData = await getUserProfile();
    if (!userData?.user || !userData.profile) return { message: 'You must be logged in.' };

    const validatedFields = PostSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { title, content_html, banner_url, cinematicApiId, media_type, rating, is_premium, is_nsfw, has_spoilers } = validatedFields.data;
    const slug = createSlug(title);

    let movieId: number | undefined = undefined;
    let seriesId: number | undefined = undefined;

    // This logic now calls the caching functions from 'cinematic-actions.ts'
    if (cinematicApiId && media_type) {
        try {
            if (media_type === 'movie') {
                await getMovieDetails(cinematicApiId); // Calls the caching function
                movieId = cinematicApiId;
            } else if (media_type === 'tv') {
                await getSeriesDetails(cinematicApiId); // Calls the caching function
                seriesId = cinematicApiId;
            }
        } catch (error) {
            return { message: "Server Error: Could not fetch details for the linked item." };
        }
    } else if (cinematicApiId && !media_type) {
        return { errors: { cinematic: ['Media type is missing.'] } };
    }

    const postToInsert = {
        author_id: userData.user.id,
        title,
        content_html,
        slug,
        banner_url: banner_url || null,
        type: cinematicApiId ? 'review' as const : 'general' as const,
        movie_id: movieId,
        series_id: seriesId, // Make sure you've added this column to your 'posts' table
        rating: rating,
        is_premium: is_premium,
        is_nsfw: is_nsfw,
        has_spoilers: has_spoilers,
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

// =====================================================================
// == ACTION: For posting comments
// =====================================================================

// (This function is unchanged)
export async function postComment(postId: string, formData: FormData) {
    const supabase = await createClient();
    const userData = await getUserProfile();
    if (!userData?.user || !userData.profile) {
        return { error: 'You must be logged in to comment.' };
    }
    const content = formData.get('comment') as string;
    if (!content || content.trim().length < 3) {
        return { error: 'Comment must be at least 3 characters.' };
    }
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
    revalidatePath(`/blog/[slug]`, 'page');
    return { success: 'Comment posted!' };
}

// =====================================================================
// == ACTIONS: For likes
// =====================================================================

// (This function is unchanged)
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

// (This function is unchanged)
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

// ✨ 3. DELETED the duplicate CrewMember, getMovieDetails, and getSeriesDetails functions
// They are now correctly imported from cinematic-actions.ts