// middleware.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { checkProfileCompletion } from '@/lib/data/user-data';

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

    // --- MODIFIED LOGIC ---

    // ✨ FIX: Removed '/blog' from the list of protected routes.
    // These routes now require a *complete* profile to access.
    const protectedAppRoutes = ['/profile', '/create', '/settings'];

    // All routes that require a user to be logged in at all.
    const allProtectedRoutes = [...protectedAppRoutes, '/onboarding'];

    if (user) {
        // If user is logged in, redirect away from auth pages
        if (pathname.startsWith('/auth')) {
            return NextResponse.redirect(new URL('/profile', request.url));
        }

        // NEW: Redirect logged-in users away from Landing Page ('/')
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/profile', request.url));
        }

        // Check profile completion status
        const isProfileComplete = await checkProfileCompletion(user.id);

        // If profile is NOT complete and user is trying to access a main app route...
        if (!isProfileComplete && protectedAppRoutes.some(route => pathname.startsWith(route))) {
            // ...redirect them to onboarding.
            return NextResponse.redirect(new URL('/onboarding', request.url));
        }

        // If profile IS complete and user tries to access onboarding...
        if (isProfileComplete && pathname.startsWith('/onboarding')) {
            // ...redirect them to their profile.
            return NextResponse.redirect(new URL('/profile', request.url));
        }

    } else {
        // If user is not logged in, protect only the defined routes
        if (allProtectedRoutes.some(route => pathname.startsWith(route))) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    return supabaseResponse;
}