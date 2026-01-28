'use server';

import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getUserProfile } from '@/lib/data/user-data';
import { v4 as uuidv4 } from 'uuid';
import { getMovieDetails, getSeriesDetails } from './cinematic-actions';
import { createNotification, deleteNotification } from "@/lib/actions/notification-actions";

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

    const { title, content_html, banner_url, cinematicApiId, media_type, rating, is_premium, is_nsfw, has_spoilers } = validatedFields.data;
    const slug = createSlug(title);

    let movieId: number | undefined = undefined;
    let seriesId: number | undefined = undefined;

    // Call caching functions from 'cinematic-actions.ts'
    if (cinematicApiId && media_type) {
        try {
            if (media_type === 'movie') {
                await getMovieDetails(cinematicApiId);
                movieId = cinematicApiId;
            } else if (media_type === 'tv') {
                await getSeriesDetails(cinematicApiId);
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
        series_id: seriesId,
        rating: rating,
        is_premium: is_premium,
        is_nsfw: is_nsfw,
        has_spoilers: has_spoilers,
        // ✨ REMOVED: author_username & author_profile_pic_url
        // (These columns are deleted; we now join on author_id to get profile data)
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
// == SOCIAL ACTIONS (LIKES, UNLIKES, COMMENTS)
// =====================================================================

// 1. LIKE POST (With Notifications)
export async function likePost(postId: string) {
    const supabase = await createClient();
    const userData = await getUserProfile();

    if (!userData?.user || !userData.profile) {
        return { error: 'You must be logged in.' };
    }

    // Insert Like
    const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: userData.user.id });

    if (error) {
        console.error('Like error:', error);
        return { error: 'Error liking post.' };
    }

    // Check Author for Notification
    const { data: post } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();

    // Send Notification if not liking own post
    if (post && post.author_id !== userData.user.id) {
        await createNotification({
            recipientId: post.author_id,
            actorId: userData.user.id,
            actorUsername: userData.profile.username,
            type: 'like',
            targetPostId: postId
        });
    }

    revalidatePath(`/blog/[slug]`, 'page');
    return { success: true };
}

// 2. UNLIKE POST
export async function unlikePost(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'You must be logged in to unlike a post.' };

    // 1. Remove the Like
    const { error } = await supabase
        .from('likes')
        .delete()
        .match({ post_id: postId, user_id: user.id });

    if (error) {
        console.error('Unlike error:', error);
        return { error: 'There was an error unliking the post.' };
    }

    // 2. Remove the notification
    await deleteNotification({
        actorId: user.id,
        type: 'like',
        targetPostId: postId
    });

    revalidatePath(`/blog/[slug]`, 'page');
    return { success: true };
}

// 3. POST COMMENT (With Notifications)
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
        // ✨ REMOVED: author_username & author_profile_pic_url
    });

    if (error) {
        console.error('Comment insert error:', error);
        return { error: 'Could not post comment. Please try again.' };
    }

    // Check Author for Notification
    const { data: post } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();

    if (post && post.author_id !== userData.user.id) {
        await createNotification({
            recipientId: post.author_id,
            actorId: userData.user.id,
            actorUsername: userData.profile.username,
            type: 'comment',
            targetPostId: postId
        });
    }

    revalidatePath(`/blog/[slug]`, 'page');
    return { success: 'Comment posted!' };
}

// =====================================================================
// == UPDATE POST ACTION
// =====================================================================
const UpdatePostSchema = z.object({
    postId: z.string().uuid(),
    title: z.string().min(3),
    content_html: z.string().min(50),
    // Optional because we might keep the existing one
    cinematicApiId: z.coerce.number().optional(),
    media_type: z.enum(['movie', 'tv']).optional(),
    banner_url: z.string().optional().or(z.literal('')),
    rating: z.coerce.number().min(0).max(5).step(0.5).optional(),
    is_premium: z.string().optional().transform(value => value === 'on'),
    is_nsfw: z.string().optional().transform(value => value === 'on'),
    has_spoilers: z.string().optional().transform(value => value === 'on'),
});

export async function updatePost(
    prevState: CreatePostState,
    formData: FormData
): Promise<CreatePostState> {
    const supabase = await createClient();
    const userData = await getUserProfile();

    // 1. Auth Check
    if (!userData?.user) return { message: 'You must be logged in.' };

    const postId = formData.get('postId') as string;

    // 2. Ownership Check
    const { data: existingPost } = await supabase
        .from('posts')
        .select('author_id, slug')
        .eq('id', postId)
        .single();

    if (!existingPost || existingPost.author_id !== userData.user.id) {
        return { message: 'Unauthorized: You do not own this post.' };
    }

    // 3. Validation
    const validatedFields = UpdatePostSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const {
        title, content_html, banner_url, cinematicApiId, media_type,
        rating, is_premium, is_nsfw, has_spoilers
    } = validatedFields.data;

    // 4. Handle Cinematic Data (Movies/TV)
    let movieId: number | null = null;
    let seriesId: number | null = null;

    if (cinematicApiId && media_type) {
        try {
            if (media_type === 'movie') {
                await getMovieDetails(cinematicApiId);
                movieId = cinematicApiId;
            } else if (media_type === 'tv') {
                await getSeriesDetails(cinematicApiId);
                seriesId = cinematicApiId;
            }
        } catch (error) {
            return { message: "Server Error: Could not fetch details for the linked item." };
        }
    }

    // 5. Update Database
    const { error } = await supabase
        .from('posts')
        .update({
            title,
            content_html,
            banner_url: banner_url || null, // Allow clearing banner
            type: cinematicApiId ? 'review' : 'general',
            movie_id: movieId,
            series_id: seriesId,
            rating,
            is_premium,
            is_nsfw,
            has_spoilers,
            // We typically DO NOT update the slug to prevent broken links
        })
        .eq('id', postId);

    if (error) {
        console.error("Update error:", error);
        return { message: `Database Error: Could not update post.` };
    }

    revalidatePath(`/blog/${existingPost.slug}`);
    revalidatePath('/blog');
    redirect(`/blog/${existingPost.slug}`);
}

// =====================================================================
// == DELETE POST ACTION
// =====================================================================
export async function deletePost(postId: string) {
    const supabase = await createClient();
    const userData = await getUserProfile();

    // ✨ FIX: Check for both user AND profile.
    // This tells TypeScript that subsequent access to 'userData.profile' is safe.
    if (!userData?.user || !userData.profile) {
        return { success: false, error: 'Unauthorized' };
    }

    // 1. Ownership Check
    const { data: post } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();

    if (!post || post.author_id !== userData.user.id) {
        return { success: false, error: 'You can only delete your own posts.' };
    }

    // 2. Soft Delete (Set deleted_at)
    const { error } = await supabase
        .from('posts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', postId);

    if (error) {
        console.error("Delete error", error);
        return { success: false, error: 'Failed to delete post' };
    }

    revalidatePath('/blog');
    // TypeScript is now happy because we guarded against null profile at the top
    revalidatePath(`/profile/${userData.profile.username}/posts`);
    return { success: true };
}