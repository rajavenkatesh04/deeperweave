// app/onboarding/page.tsx

import { getUserProfile } from '@/lib/data';
import { OnboardingForm } from './onboarding-form'; // We will create this client component below
import { redirect } from 'next/navigation';

// This is now a SERVER component responsible for data fetching
export default async function OnboardingPage() {
    const data = await getUserProfile();

    // If for some reason user is not logged in, send them to login
    if (!data?.user) {
        redirect('/auth/login');
    }

    // Pass the potentially partially-filled profile to the client component
    return <OnboardingForm profile={data.profile} />;
}