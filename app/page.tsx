import LandingPageClient from '@/app/ui/landing/LandingPageClient';
import { getLandingPageData } from '@/lib/data/landing-data'; // You'll create this new combined function
import { FilmIcon, TvIcon, SparklesIcon, HeartIcon } from "@heroicons/react/24/solid";

export const revalidate = 86400; // Daily revalidation

export default async function Home() {
    const data = await getLandingPageData();

    // Prepare data for Client Component.
    // NOTE: You can't pass server components (like HeroIcons) directly as props easily if they aren't serializable.
    // It's often easier to keep the static icon definitions in the client component if they don't change dynamically,
    // OR map them in the client component based on a string type passed from server.
    // For simplicity here, I've kept the icons in the Client Component and am just passing the raw data strings.

    return (
        <main>
            {/* You might need to map strings to icons inside the client component if you pass raw data */}
            <LandingPageClient
                heroPosters={data.heroPosters}
                heroItems={data.heroItems}
                searchDemoItems={data.searchDemoItems}
                bentoItems={data.bentoItems}
            />
        </main>
    );
}