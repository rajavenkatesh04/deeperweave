import FavoriteFilmsDisplay from '@/app/ui/profile/FavoriteFilmsDisplay';
import { getProfileByUsername } from '@/lib/data/user-data';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
// ✨ 1. IMPORT Series
import { Movie, Series } from '@/lib/definitions';

// ✨ 2. DEFINE the new return type
type FavoriteItem = {
    rank: number;
    movies: Movie | null;
    series: Series | null;
};

// ✨ 3. UPDATED this helper function
async function getFavoriteItems(userId: string): Promise<FavoriteItem[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('favorite_films')
        .select('rank, movies(*), series(*)') // ✨ Fetch both
        .eq('user_id', userId)
        .order('rank');

    if (error || !data) {
        console.error("Error fetching favorite items:", error);
        return [];
    }

    // ✨ 4. Safely map the new data structure
    const formattedData = data
        .map(fav => ({
            rank: fav.rank,
            movies: Array.isArray(fav.movies) ? fav.movies[0] : fav.movies,
            series: Array.isArray(fav.series) ? fav.series[0] : fav.series,
        }))
        .filter(fav => fav.movies || fav.series); // Ensure no empty records

    return formattedData as FavoriteItem[];
}

/**
 * The Page component for a user's "Home" tab.
 */
export default async function ProfileHomePage({ params }: { params: Promise<{ username: string }> }) {
    // Await the params Promise
    const { username } = await params;

    const profile = await getProfileByUsername(username);
    if (!profile) {
        notFound();
    }

    // ✨ 5. Renamed variable
    const favoriteItems = await getFavoriteItems(profile.id);

    return (
        <div className="space-y-8">
            {/* ✨ 6. Passed the correct prop name */}
            <FavoriteFilmsDisplay favoriteItems={favoriteItems} />
        </div>
    );
}