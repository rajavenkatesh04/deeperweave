import LoginForm from '@/app/ui/auth/login-form';
import { Suspense } from 'react';
import { Metadata } from 'next'; // 1. Import Metadata

// 2. Export the metadata object
export const metadata: Metadata = {
    title: 'Login',
    description: 'Sign in to your DeeperWeave account to access your personal movie tracking and blogs.',
};

export default function LoginPage() {
    return (
        // Suspense is good practice for pages with search params
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
