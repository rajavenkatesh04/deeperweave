import SignupForm from '@/app/ui/authentication/signup-form';
import { Suspense } from 'react';
import { Metadata } from 'next'; // 1. Import Metadata

// 2. Export the metadata object
export const metadata: Metadata = {
    title: 'Create Account',
    description: 'Join the DeeperWeave community today to start tracking movies and writing your own logs.',
};

export default function SignupPage() {
    return (
        <Suspense>
            <SignupForm />
        </Suspense>
    );
}
