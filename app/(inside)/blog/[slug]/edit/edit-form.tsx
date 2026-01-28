// app/(inside)/blog/[slug]/edit/edit-form.tsx
'use client';

import { useState, useRef, useActionState, useEffect } from 'react';
import { updatePost, uploadBanner, CreatePostState } from '@/lib/actions/blog-actions';
import Breadcrumbs from '@/app/ui/Breadcrumbs';
import { XCircleIcon, CloudArrowUpIcon, StarIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '@/app/ui/loading-spinner';
import Image from 'next/image';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { clsx } from 'clsx';
import { useFormStatus } from 'react-dom';

// --- Helper Components ---
function ToggleSwitch({ label, isEnabled, setIsEnabled, name }: any) {
    return (
        <label htmlFor={name} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-gray-900 dark:text-zinc-200">{label}</span>
            <div className="relative">
                <input id={name} name={name} type="checkbox" className="sr-only" checked={isEnabled} onChange={() => setIsEnabled(!isEnabled)} />
                <div className={clsx("block h-6 w-10 rounded-full transition-colors", isEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-zinc-700')}></div>
                <div className={clsx("dot absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform", isEnabled && 'translate-x-full')}></div>
            </div>
        </label>
    );
}

function StarRatingInput({ rating, setRating }: any) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star === rating ? 0 : star)}>
                    <StarIcon className={clsx("h-6 w-6", star <= rating ? "text-yellow-500" : "text-gray-300")} />
                </button>
            ))}
            <input type="hidden" name="rating" value={rating} />
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className="flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">{pending ? 'Updating...' : 'Update Post'}</button>;
}

// --- Main Form Component ---
export default function EditPostForm({ post }: { post: any }) {
    const initialState: CreatePostState = { message: null, errors: {} };
    const [state, formAction] = useActionState(updatePost, initialState);

    // Initial State from DB
    const [content, setContent] = useState(post.content_html || '');
    const [rating, setRating] = useState(post.rating || 0);
    const [isPremium, setIsPremium] = useState(post.is_premium || false);
    const [isNsfw, setIsNsfw] = useState(post.is_nsfw || false);
    const [hasSpoilers, setHasSpoilers] = useState(post.has_spoilers || false);
    const [bannerUrl, setBannerUrl] = useState<string | null>(post.banner_url);

    // Handle Linked Movie/TV (Visual only logic for display)
    const initialMedia = post.movie ? { ...post.movie, id: post.movie.tmdb_id }
        : post.series ? { ...post.series, id: post.series.tmdb_id }
            : null;
    const [selectedMovie] = useState<any | null>(initialMedia);

    // Banner Upload Logic
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const handleBannerChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsUploadingBanner(true);
        const formData = new FormData();
        formData.append('banner', file);
        const result = await uploadBanner(formData);
        if (result.success && result.url) setBannerUrl(result.url);
        setIsUploadingBanner(false);
    };

    return (
        <>
            <Breadcrumbs breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: post.title, href: `/blog/${post.slug}` }, { label: 'Edit', href: '#', active: true }]} />

            <form action={formAction} className="mt-6 space-y-8">
                <input type="hidden" name="postId" value={post.id} />

                {/* --- Banner Section --- */}
                <div className="rounded-lg border bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold mb-4">Banner Image</h2>
                    {bannerUrl ? (
                        <div className="relative aspect-video w-full max-w-md">
                            <Image src={bannerUrl} alt="Banner" fill className="rounded-md object-cover" />
                            <button type="button" onClick={() => setBannerUrl(null)} className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full"><XCircleIcon className="h-5 w-5"/></button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800">
                            {isUploadingBanner ? <LoadingSpinner /> : <CloudArrowUpIcon className="w-8 h-8 text-gray-400" />}
                            <input ref={bannerInputRef} type="file" onChange={handleBannerChange} className="hidden" accept="image/*" />
                        </label>
                    )}
                    <input type="hidden" name="banner_url" value={bannerUrl || ''} />
                </div>

                {/* --- Settings --- */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-white rounded-lg border dark:bg-zinc-900 dark:border-zinc-800">
                        <h3 className="font-semibold mb-3">Post Settings</h3>
                        <div className="space-y-4">
                            <ToggleSwitch label="Premium" isEnabled={isPremium} setIsEnabled={setIsPremium} name="is_premium" />
                            <ToggleSwitch label="NSFW" isEnabled={isNsfw} setIsEnabled={setIsNsfw} name="is_nsfw" />
                            <ToggleSwitch label="Spoilers" isEnabled={hasSpoilers} setIsEnabled={setHasSpoilers} name="has_spoilers" />
                        </div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border dark:bg-zinc-900 dark:border-zinc-800">
                        <h3 className="font-semibold mb-3">Rating</h3>
                        <StarRatingInput rating={rating} setRating={setRating} />
                    </div>
                </div>

                {/* --- Title & Content --- */}
                <div className="space-y-4">
                    <input name="title" defaultValue={post.title} className="w-full text-2xl font-bold bg-transparent border-0 border-b border-gray-200 focus:ring-0 px-0 dark:border-zinc-700" placeholder="Post Title" />
                    <div className="min-h-[400px] border rounded-lg dark:border-zinc-700">
                        <SimpleEditor value={content} onChange={setContent} />
                        <input type="hidden" name="content_html" value={content} />
                    </div>
                    {state.errors?.content_html && <p className="text-red-500">{state.errors.content_html[0]}</p>}
                </div>

                {/* --- Hidden Fields for Cinematic Data --- */}
                {selectedMovie && (
                    <>
                        <input type="hidden" name="cinematicApiId" value={selectedMovie.id} />
                        <input type="hidden" name="media_type" value={post.movie_id ? 'movie' : 'tv'} />
                    </>
                )}

                <div className="flex justify-end gap-4">
                    <SubmitButton />
                </div>
                {state.message && <p className="text-red-500 text-right">{state.message}</p>}
            </form>
        </>
    );
}