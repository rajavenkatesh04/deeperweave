import { createClient } from '@/utils/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/profile';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(new URL(next, request.url));
        }
    }

    // return the user to an error page with instructions
    const errorUrl = new URL('/auth/error', request.url);
    errorUrl.searchParams.set('error', 'Sorry, we couldn\'t confirm your email. Please try signing up again.');
    return NextResponse.redirect(errorUrl);
}
