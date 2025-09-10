import LoginForm from '@/app/ui/authentication/login-form';
import { Suspense } from 'react';

export default function LoginPage() {
    return (
        // Suspense is good practice for pages with search params
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
