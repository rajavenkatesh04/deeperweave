// app/onboarding/page.tsx

import { getUserProfile } from '@/lib/data/user-data';
import { OnboardingForm } from './onboarding-form';
import { redirect } from 'next/navigation';
import { getRandomMovie } from '@/lib/data/movies-data';

export default async function OnboardingPage() {
    const data = await getUserProfile();

    // If for some reason user is not logged in, send them to login
    if (!data?.user) {
        redirect('/auth/login');
    }

    // Fetch a random movie for the background
    const randomMovie = await getRandomMovie();

    // Provide a fallback if randomMovie is null
    const movieData = randomMovie || {
        backdrop_url: '',
        title: 'Default Background'
    };

    // Pass both profile and randomMovie to the client component
    return <OnboardingForm profile={data.profile} randomMovie={movieData} />;
}