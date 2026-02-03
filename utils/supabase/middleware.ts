// middleware.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { checkProfileCompletion } from '@/lib/data/user-data';

// utils/supabase/middleware.ts

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const { pathname } = request.nextUrl;

    const protectedAppRoutes = ['/profile', '/create', '/settings'];
    const allProtectedRoutes = [...protectedAppRoutes, '/onboarding'];

    if (user) {
        // FIX: Allow the user to stay on the reset password page if they are logged in.
        // Otherwise, redirect them away from other auth pages (like login/signup) to profile.
        if (pathname.startsWith('/auth') && pathname !== '/auth/reset-password') {
            return NextResponse.redirect(new URL('/profile', request.url));
        }

        // Redirect logged-in user away from Landing Page ('/')
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/profile', request.url));
        }

        // Check profile completion status
        const isProfileComplete = await checkProfileCompletion(user.id);

        if (!isProfileComplete && protectedAppRoutes.some(route => pathname.startsWith(route))) {
            return NextResponse.redirect(new URL('/onboarding', request.url));
        }

        if (isProfileComplete && pathname.startsWith('/onboarding')) {
            return NextResponse.redirect(new URL('/profile', request.url));
        }

    } else {
        // If user is not logged in, protect the defined routes
        if (allProtectedRoutes.some(route => pathname.startsWith(route))) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    return supabaseResponse;
}