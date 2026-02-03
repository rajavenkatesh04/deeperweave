import LoginForm from '@/app/ui/auth/login-form';
import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login',
    description: 'Sign in to your DeeperWeave account to access your personal movie tracking and blogs.',
};

export default async function LoginPage({
                                            searchParams,
                                        }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // 1. Extract params
    const { item, type } = await searchParams;
    const itemStr = typeof item === 'string' ? item : undefined;
    const typeStr = typeof type === 'string' ? type : undefined;

    return (
        <Suspense>
            {/* 2. Pass them to the form */}
            <LoginForm item={itemStr} type={typeStr} />
        </Suspense>
    );
}