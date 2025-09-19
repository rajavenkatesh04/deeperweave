// app/(inside)/profile/settings/page.tsx

import { getUserProfile } from '@/lib/data/user-data';
import { redirect } from 'next/navigation';
import Breadcrumbs from '@/app/ui/Breadcrumbs';
import SettingsForm from './settings-form';
import { Suspense } from 'react';
import { ProfileFormSkeleton } from '@/app/ui/skeletons';

export default async function ProfileSettingsPage() {
    const userData = await getUserProfile();

    if (!userData || !userData.profile) {
        redirect('/auth/login');
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Profile', href: '/profile' },
                    { label: 'Settings', href: '/profile/settings', active: true },
                ]}
            />
            <div className="mt-6">
                <Suspense fallback={<ProfileFormSkeleton />}>
                    <SettingsForm profile={userData.profile} />
                </Suspense>
            </div>
        </main>
    );
}