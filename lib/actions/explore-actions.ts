'use server';

import { fetchTmdbList } from './cinematic-actions';
import { discoverMedia } from './discovery-actions';

// 1. EDITORIAL COLLECTIONS (Static IDs for "House of Deeperweave")
export async function getEditorialCollections() {
    return [
        {
            title: "Oscar Contenders 2025",
            description: "The films buzzing for gold this season.",
            backdrop: "/images/oscars-backdrop.jpg",
            query: { year: 2024, sort_by: 'vote_average.desc', 'vote_count.gte': '500' }
        },
        {
            title: "Cannes Palme d'Or Winners",
            description: "Cinema's most prestigious honor.",
            query: { with_keywords: '208365' }
        }
    ];
}

// 2. TRENDING STARS - ✨ DYNAMIC (Respects User Profile)
export async function getTrendingPeople() {
    // We do NOT pass { include_adult: 'false' } anymore.
    // fetchTmdbList will automatically check the user's 'content_preference'
    // and toggle adult content on/off accordingly.
    return fetchTmdbList('/trending/person/week');
}

// 3. GENRE COLLECTIONS (Vibes)
export async function getGenreCollections() {
    const [scifi, noir, romance] = await Promise.all([
        discoverMedia({ type: 'movie', with_genres: '878', sort_by: 'popularity.desc' }), // Sci-Fi
        discoverMedia({ type: 'movie', with_genres: '80', sort_by: 'vote_average.desc' }), // Crime (Noir-ish)
        discoverMedia({ type: 'movie', with_genres: '10749', sort_by: 'popularity.desc' }), // Romance
    ]);

    return [
        { title: "Mind-Bending Sci-Fi", items: scifi, href: '/discover/movies?genre=878' },
        { title: "Critically Acclaimed Crime", items: noir, href: '/discover/movies?genre=80' },
        { title: "Modern Romance", items: romance, href: '/discover/movies?genre=10749' },
    ];
}