'use client';

import { useState, useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { createPost, CreatePostState } from '@/lib/actions/blog-actions';
import { ofetch } from 'ofetch';
import Breadcrumbs from '@/app/ui/Breadcrumbs';
import { XCircleIcon, FilmIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';
import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('@/app/ui/blog/TiptapEditor'), {
    ssr: false,
    loading: () => <div className="flex justify-center items-center min-h-[300px] w-full rounded-md border border-gray-300 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800"><LoadingSpinner /></div>,
});

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

function SubmitButton() {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className="flex h-10 items-center justify-center rounded-lg bg-gray-900 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">{pending ? <><LoadingSpinner className="mr-2"/> Publishing...</> : 'Publish Post'}</button>;
}

export default function CreateBlogPage() {
    const initialState: CreatePostState = { message: null, errors: {} };
    const [state, formAction] = useActionState(createPost, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const [content, setContent] = useState('');
    const [movieSearchQuery, setMovieSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<MovieSearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!state.errors && !state.message) {
            formRef.current?.reset();
            setContent('');
            setSelectedMovie(null);
            setMovieSearchQuery('');
            setBannerPreview(null);
        }
    }, [state]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (movieSearchQuery.trim().length < 3) {
                setSearchResults([]); return;
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
        setSelectedMovie(movie);
        setMovieSearchQuery(movie.title);
        setSearchResults([]);
    };

    const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setBannerPreview(file ? URL.createObjectURL(file) : null);
    };

    return (
        <main>
            <Breadcrumbs breadcrumbs={[{ label: 'Create Post', href: '/create', active: true }]} />
            <form ref={formRef} action={formAction} className="mt-6 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <label htmlFor="title" className="mb-2 block text-sm font-medium">Post Title</label>
                            <input id="title" name="title" type="text" placeholder="e.g., An Analysis of Interstellar's Cinematography" className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800" required />
                            {state.errors?.title && <p className="mt-2 text-xs text-red-500">{state.errors.title[0]}</p>}
                        </div>
                        <div>
                            <label htmlFor="content_html" className="mb-2 block text-sm font-medium">Your Content</label>
                            <TiptapEditor content={content} onChange={(newContent) => setContent(newContent)} />
                            <input type="hidden" name="content_html" value={content} />
                            {state.errors?.content_html && <p className="mt-2 text-xs text-red-500">{state.errors.content_html[0]}</p>}
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="text-base font-semibold">Link a Movie (Optional)</h2>
                            <div className="relative mt-4">
                                <input id="movieSearch" type="text" value={movieSearchQuery} onChange={(e) => setMovieSearchQuery(e.target.value)} placeholder="Search for a movie..." autoComplete="off" className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"/>
                                <MovieSearchResults results={searchResults} onSelectMovie={handleSelectMovie} isLoading={isSearching} />
                            </div>
                            {selectedMovie && (
                                <div className="mt-4 p-3 rounded-md border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50">
                                    <div className="flex items-start gap-3">
                                        {selectedMovie.poster_path && <Image src={`https://image.tmdb.org/t/p/w92${selectedMovie.poster_path}`} alt={selectedMovie.title} width={50} height={75} className="rounded" />}
                                        <div className="flex-1"><p className="font-semibold text-sm leading-tight">{selectedMovie.title}</p><p className="text-xs text-gray-500">{selectedMovie.release_date?.split('-')[0]}</p></div>
                                        <button type="button" onClick={() => setSelectedMovie(null)} className="p-1 text-gray-400 hover:text-red-500"><XCircleIcon className="h-5 w-5"/></button>
                                    </div>
                                    <input type="hidden" name="movieApiId" value={selectedMovie.id} />
                                    <input type="hidden" name="movieTitle" value={selectedMovie.title} />
                                    <input type="hidden" name="moviePosterUrl" value={selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` : ''} />
                                    <input type="hidden" name="movieReleaseDate" value={selectedMovie.release_date} />
                                </div>
                            )}
                        </div>
                        <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="text-base font-semibold">Banner Image (Optional)</h2>
                            {bannerPreview ? (
                                <div className="mt-4 relative"><Image src={bannerPreview} alt="Banner preview" width={300} height={150} className="w-full h-auto rounded-md object-cover" /><button type="button" onClick={() => { setBannerPreview(null); if (bannerInputRef.current) bannerInputRef.current.value = ''; }} className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/75"><XCircleIcon className="h-5 w-5"/></button></div>
                            ) : (
                                <div className="mt-4"><input ref={bannerInputRef} id="banner" name="banner" type="file" accept="image/*" onChange={handleBannerChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-zinc-700 dark:file:text-zinc-200 dark:hover:file:bg-zinc-600"/></div>
                            )}
                            {state.errors?.banner && <p className="mt-2 text-xs text-red-500">{state.errors.banner[0]}</p>}
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-200 pt-6 dark:border-zinc-800">
                    {state.message && <p className={`mr-auto text-sm text-red-600`}>{state.message}</p>}
                    <Link href="/" className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Cancel</Link>
                    <SubmitButton />
                </div>
            </form>
        </main>
    );
}