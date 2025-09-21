// @/app/ui/blog/CreateBlogPage.tsx

'use client';

import { useState, useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { createPost, uploadBanner, CreatePostState } from '@/lib/actions/blog-actions';
import { ofetch } from 'ofetch';
import Breadcrumbs from '@/app/ui/Breadcrumbs';
import { XCircleIcon, FilmIcon, StarIcon } from '@heroicons/react/24/solid';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { clsx } from 'clsx';

type MovieSearchResult = { id: number; title: string; release_date: string; poster_path: string; };

function MovieSearchResults({ results, onSelectMovie, isLoading }: { results: MovieSearchResult[]; onSelectMovie: (movie: MovieSearchResult) => void; isLoading: boolean; }) {
    if (isLoading) return <div className="absolute z-10 w-full mt-1 p-4 text-center rounded-md shadow-lg bg-white dark:bg-zinc-800 border dark:border-zinc-700"><LoadingSpinner /></div>;
    if (results.length === 0) return null;
    return (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg dark:bg-zinc-800 dark:border-zinc-700 max-h-60 overflow-y-auto">
            {results.map((movie) => (
                <li key={movie.id} className="flex items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700" onClick={() => onSelectMovie(movie)}>
                    {movie.poster_path ? <Image src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt={movie.title} width={40} height={60} className="object-cover mr-3 rounded" /> : <div className="w-10 h-[60px] mr-3 rounded flex items-center justify-center bg-gray-200 dark:bg-zinc-700"><FilmIcon className="w-5 h-5 text-gray-400"/></div>}
                    <div><p className="font-semibold">{movie.title}</p><p className="text-sm text-gray-500">{movie.release_date?.split('-')[0]}</p></div>
                </li>
            ))}
        </ul>
    );
}

function StarRatingInput({ rating, setRating }: { rating: number; setRating: (rating: number) => void }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <label key={ratingValue}>
                        <input
                            type="radio"
                            name="rating"
                            value={ratingValue}
                            onClick={() => setRating(ratingValue)}
                            className="hidden"
                        />
                        <StarIcon
                            className="h-6 w-6 cursor-pointer transition-colors"
                            color={ratingValue <= (hover || rating) ? '#f59e0b' : '#e5e7eb'}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(0)}
                        />
                    </label>
                );
            })}
        </div>
    );
}

function ToggleSwitch({ label, isEnabled, setIsEnabled, name }: { label: string; isEnabled: boolean; setIsEnabled: (enabled: boolean) => void; name: string }) {
    return (
        <label htmlFor={name} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-gray-900 dark:text-zinc-200">{label}</span>
            <div className="relative">
                <input
                    id={name}
                    name={name}
                    type="checkbox"
                    className="sr-only"
                    checked={isEnabled}
                    onChange={() => setIsEnabled(!isEnabled)}
                />
                <div className={clsx("block h-6 w-10 rounded-full", isEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-zinc-700')}></div>
                <div className={clsx("dot absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform", isEnabled && 'translate-x-full')}></div>
            </div>
        </label>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className="flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400">{pending ? <><LoadingSpinner className="mr-2"/> Publishing...</> : 'Publish Post'}</button>;
}

export default function CreateBlogPage() {
    const initialState: CreatePostState = { message: null, errors: {} };
    const [state, formAction] = useActionState(createPost, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const justSelectedMovie = useRef(false);

    const [content, setContent] = useState('');
    const [movieSearchQuery, setMovieSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<MovieSearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [rating, setRating] = useState(0);
    const [isPremium, setIsPremium] = useState(false);
    const [isNsfw, setIsNsfw] = useState(false);

    const [bannerUrl, setBannerUrl] = useState<string | null>(null);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const [bannerError, setBannerError] = useState<string | null>(null);

    useEffect(() => {
        if (state.message === null && !state.errors) {
            formRef.current?.reset();
            setContent('');
            setSelectedMovie(null);
            setMovieSearchQuery('');
            setBannerUrl(null);
            setBannerError(null);
            if (bannerInputRef.current) bannerInputRef.current.value = '';
            setRating(0);
            setIsPremium(false);
            setIsNsfw(false);
        }
    }, [state]);

    useEffect(() => {
        if (justSelectedMovie.current) {
            justSelectedMovie.current = false;
            return;
        }

        const handler = setTimeout(() => {
            if (movieSearchQuery.trim().length < 3) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
            ofetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieSearchQuery)}`)
                .then(response => setSearchResults(response.results.slice(0, 5)))
                .catch(error => console.error("Failed to fetch movies:", error))
                .finally(() => setIsSearching(false));
        }, 500);
        return () => clearTimeout(handler);
    }, [movieSearchQuery]);

    const handleSelectMovie = (movie: MovieSearchResult) => {
        justSelectedMovie.current = true;
        setSelectedMovie(movie);
        setMovieSearchQuery(movie.title);
        setSearchResults([]);
    };

    const handleBannerChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingBanner(true);
        setBannerError(null);

        const formData = new FormData();
        formData.append('banner', file);

        const result = await uploadBanner(formData);

        if (result.success && result.url) {
            setBannerUrl(result.url);
        } else {
            setBannerError(result.error || 'Upload failed. Please try again.');
            if (bannerInputRef.current) {
                bannerInputRef.current.value = '';
            }
        }
        setIsUploadingBanner(false);
    };

    const clearSelectedMovie = () => {
        setSelectedMovie(null);
        setMovieSearchQuery('');
    };

    const handleEditorChange = (html: string) => {
        setContent(html) // Update your state when editor changes
    }

    return (
        <main className="max-w-5xl mx-auto px-4 ">
            <Breadcrumbs breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: 'Create Post', href: '/blog/create', active: true, }]} />

            <form ref={formRef} action={formAction} className="mt-6 space-y-8">
                {/* Top Section - Metadata Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Movie Search Card */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="text-lg font-semibold mb-4">Link a Movie</h2>
                        <div className="relative">
                            <input
                                id="movieSearch"
                                type="text"
                                value={movieSearchQuery}
                                onChange={(e) => setMovieSearchQuery(e.target.value)}
                                placeholder="Search for a movie..."
                                autoComplete="off"
                                className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
                            />
                            <MovieSearchResults results={searchResults} onSelectMovie={handleSelectMovie} isLoading={isSearching} />
                        </div>
                        {selectedMovie && (
                            <div className="mt-4 p-3 rounded-md border border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/50">
                                <div className="flex items-center gap-3">
                                    {selectedMovie.poster_path && <Image src={`https://image.tmdb.org/t/p/w92${selectedMovie.poster_path}`} alt={selectedMovie.title} width={40} height={60} className="rounded object-cover" />}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{selectedMovie.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-zinc-400">{selectedMovie.release_date?.split('-')[0]}</p>
                                    </div>
                                    <button type="button" onClick={clearSelectedMovie} className="p-1 text-gray-400 hover:text-red-500 flex-shrink-0">
                                        <XCircleIcon className="h-5 w-5"/>
                                    </button>
                                </div>
                                <input type="hidden" name="movieApiId" value={selectedMovie.id} />
                            </div>
                        )}
                    </div>

                    {/* Banner Upload Card */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="text-lg font-semibold mb-4">Banner Image</h2>
                        {bannerUrl ? (
                            <div className="relative aspect-video w-full">
                                <Image src={bannerUrl} alt="Banner preview" fill className="rounded-md object-cover" />
                                <button type="button" onClick={() => { setBannerUrl(null); if (bannerInputRef.current) bannerInputRef.current.value = ''; }} className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white transition-colors hover:bg-black/80">
                                    <XCircleIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        ) : (
                            <label htmlFor="banner-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:bg-zinc-800">
                                {isUploadingBanner ? (
                                    <LoadingSpinner />
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <CloudArrowUpIcon className="w-8 h-8 mb-2 text-gray-500 dark:text-zinc-400" />
                                        <p className="text-sm text-gray-500 dark:text-zinc-400 text-center">
                                            <span className="font-semibold">Click to upload</span><br />
                                            <span className="text-xs">PNG, JPG (MAX. 4MB)</span>
                                        </p>
                                    </div>
                                )}
                                <input
                                    ref={bannerInputRef}
                                    id="banner-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBannerChange}
                                    className="hidden"
                                    disabled={isUploadingBanner}
                                />
                            </label>
                        )}
                        {bannerError && <p className="mt-2 text-xs text-red-500">{bannerError}</p>}
                        {state.errors?.banner_url && <p className="mt-2 text-xs text-red-500">{state.errors.banner_url[0]}</p>}
                    </div>

                    {/* Rating & Options Card */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:col-span-2 xl:col-span-1">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Rating</h3>
                                <StarRatingInput rating={rating} setRating={setRating}/>
                                <input type="hidden" name="rating" value={rating} />
                            </div>
                            <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
                                <h3 className="text-lg font-semibold mb-3">Options</h3>
                                <div className="space-y-3">
                                    <ToggleSwitch label="Premium Content" isEnabled={isPremium} setIsEnabled={setIsPremium} name="is_premium" />
                                    <ToggleSwitch label="NSFW (18+)" isEnabled={isNsfw} setIsEnabled={setIsNsfw} name="is_nsfw" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Post Title */}
                <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                        Post Title
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="e.g., An Analysis of Interstellar's Cinematography"
                        className="block w-full rounded-md border-gray-300 bg-gray-50 py-3 px-4 text-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
                        required
                    />
                    {state.errors?.title && <p className="text-sm text-red-500">{state.errors.title[0]}</p>}
                </div>

                {/* Content Editor - Full Width */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                        Content
                    </label>
                    <div className="rounded-lg border border-gray-300 dark:border-zinc-700 ">
                        <SimpleEditor
                            value={content}                    // Current content flows down
                            onChange={handleEditorChange}     // Changes flow back up
                            placeholder="Start writing your blog post..."

                        />
                    </div>
                    <input type="hidden" name="content_html" value={content} />
                    {state.errors?.content_html && <p className="text-sm text-red-500">{state.errors.content_html[0]}</p>}
                </div>

                <input type="hidden" name="banner_url" value={bannerUrl || ''} />

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-zinc-700">
                    {state.message && <p className="text-sm text-red-600">{state.message}</p>}
                    <div className="flex items-center gap-4 ml-auto">
                        <Link
                            href="/blog"
                            className="flex h-10 items-center rounded-lg bg-gray-100 px-6 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                            Cancel
                        </Link>
                        <SubmitButton />
                    </div>
                </div>
            </form>
        </main>
    );
}