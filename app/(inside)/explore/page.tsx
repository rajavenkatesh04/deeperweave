import { Suspense } from 'react';
import { getTrendingPeople, getGenreCollections } from '@/lib/actions/explore-actions';
import { Metadata } from 'next';
import TrendingStars from "@/app/ui/explore/TrendingStars";
import ExploreHero from "@/app/ui/explore/ExploreHero";
import GenreShowcase from "@/app/ui/explore/GenreShowcase";

export const metadata: Metadata = {
    title: 'Explore | Deeperweave',
    description: 'Curated collections, trending stars, and cinematic vibes.',
};

export default async function ExplorePage() {
    // Parallel Fetching
    const [people, genreSections] = await Promise.all([
        getTrendingPeople(),
        getGenreCollections(),
    ]);

    return (
        <main className="min-h-screen md:ml-14 bg-white dark:bg-black text-black dark:text-white">

            {/* 1. HERO: House of Deeperweave (Editorial) */}
            {/* Hardcoded or Fetched "Special Lists" */}
            <ExploreHero />

            <div className="m-1 md:px-12 space-y-16 mt-12">

                {/* 2. TRENDING STARS (Horizontal Circles) */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Trending Stars</h2>
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">People watching</span>
                    </div>
                    <TrendingStars people={people} />
                </section>

                {/* 3. VIBES & GENRES (Vertical List of Horizontal Rows) */}
                <div className="space-y-12">
                    {genreSections.map((section) => (
                        <GenreShowcase
                            key={section.title}
                            title={section.title}
                            items={section.items}
                            href={section.href}
                        />
                    ))}
                </div>

                {/* 4. CALL TO ACTION (Community) */}
                <div className="rounded-3xl bg-zinc-100 dark:bg-zinc-900 m-2 p-6 md:p-12 text-center">
                    <h3 className="text-2xl font-bold mb-4">Curate Your Own World</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto mb-8">
                        Create custom lists, rank your favorites, and share your taste with the community.
                    </p>
                    <button className="px-6 py-3    bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform">
                        Start a List
                    </button>
                </div>
            </div>
        </main>
    );
}