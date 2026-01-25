// app/auth/confirm/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { checkProfileCompletion } from '@/lib/data/user-data';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    // Default to /profile if no specific next param is given
    let next = searchParams.get('next') ?? '/profile';

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Check if profile is complete (CRITICAL for Google Logins)
            // If they are a new user signing up via Google, this will be false
            const isProfileComplete = await checkProfileCompletion(data.user.id);

            if (!isProfileComplete) {
                // Force redirect to onboarding if profile is incomplete
                next = '/onboarding';
            }

            return NextResponse.redirect(new URL(next, request.url));
        }
    }

    // return the user to an error page with instructions
    const errorUrl = new URL('/auth/error', request.url);
    errorUrl.searchParams.set('error', 'Sorry, we couldn\'t confirm your authentication. Please try again.');
    return NextResponse.redirect(errorUrl);
}