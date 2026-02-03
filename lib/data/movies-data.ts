// app/lib/data/movies-data.ts (Updated)

import { unstable_noStore as noStore } from 'next/cache';
import { ofetch } from 'ofetch';

// The return type remains the same, so no changes are needed in your NotFound component
type RandomMovie = {
    backdrop_url: string;
    title: string;
} | null;

export async function getRandomMovie(): Promise<RandomMovie> {
    noStore();

    // ✨ 1. Get the TMDB API key from environment variables
    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) {
        console.error('TMDB API Key is not configured on the server.');
        return null;
    }

    try {
        // ✨ 2. Fetch the first page of "popular" movies from TMDB
        const data = await ofetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);

        if (!data.results || data.results.length === 0) {
            console.error('No popular movies found from TMDB API.');
            return null;
        }

        // ✨ 3. Pick a random movie from the list of results
        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];

        // Ensure the movie has a backdrop image to display
        if (!randomMovie.backdrop_path) {
            console.warn('Selected random movie does not have a backdrop path.');
            // You could try again here, but for simplicity, we'll just return null.
            return null;
        }

        // ✨ 4. Construct the full image URL and return the data
        // We use the 'original' size for the best quality background
        return {
            backdrop_url: `https://image.tmdb.org/t/p/original${randomMovie.backdrop_path}`,
            title: randomMovie.title,
        };

    } catch (error) {
        console.error('Error fetching random movie from TMDB:', error);
        return null;
    }
}