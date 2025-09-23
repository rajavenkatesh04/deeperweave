import FavoriteFilmsDisplay from '@/app/ui/profile/FavoriteFilmsDisplay';
import { getProfileByUsername } from '@/lib/data/user-data';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Movie } from '@/lib/definitions';

// Helper function to robustly fetch and format favorite films data
async function getFavoriteFilms(userId: string): Promise<{ rank: number; movies: Movie }[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('favorite_films')
        .select('rank, movies(*)') // This join fetches the full movie object
        .eq('user_id', userId)
        .order('rank');

    if (error || !data) {
        console.error("Error fetching favorite films:", error);
        return [];
    }

    // This correctly handles cases where Supabase returns a single object OR an array for the join.
    const formattedData = data
        .map(fav => ({
            rank: fav.rank,
            movies: Array.isArray(fav.movies) ? fav.movies[0] : fav.movies,
        }))
        .filter(fav => fav.movies); // Ensure no records are passed if the movie data is null

    return formattedData as { rank: number; movies: Movie; }[];
}

/**
 * The Page component for a user's "Home" tab.
 * In Next.js 15, params is now a Promise that needs to be awaited.
 */
export default async function ProfileHomePage({ params }: { params: Promise<{ username: string }> }) {
    // Await the params Promise
    const { username } = await params;

    const profile = await getProfileByUsername(username);
    if (!profile) {
        // If no profile is found for the given username, render a 404 page.
        notFound();
    }

    // Fetch the user's top films to display on their home feed.
    const favoriteFilms = await getFavoriteFilms(profile.id);

    return (
        <div className="space-y-8">
            <FavoriteFilmsDisplay favoriteFilms={favoriteFilms} />
            {/* You can add other home-feed components here, like recent activity, etc. */}
        </div>
    );
}