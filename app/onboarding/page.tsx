import { getUserProfile } from '@/lib/data/user-data';
import { OnboardingForm } from './onboarding-form';
import { redirect } from 'next/navigation';
import { getRandomMovie } from '@/lib/data/movies-data';

export default async function OnboardingPage() {
    const data = await getUserProfile();

    if (!data?.user) {
        redirect('/auth/login');
    }

    const randomMovie = await getRandomMovie();
    const movieData = randomMovie || { backdrop_url: '', title: 'Cinematic' };

    return (
        <OnboardingForm
            profile={data.profile}
            randomMovie={movieData}
            email={data.user.email} // ✨ CRITICAL: Passing email here
        />
    );
}