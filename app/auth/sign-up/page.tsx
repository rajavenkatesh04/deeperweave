import SignupForm from '@/app/ui/authentication/signup-form';
import { Suspense } from 'react';

export default function SignupPage() {
    return (
        <Suspense>
            <SignupForm />
        </Suspense>
    );
}
