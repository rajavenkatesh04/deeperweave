import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Force the Edge Runtime (Crucial for Cloudflare)
export const runtime = 'experimental-edge';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    const { pathname } = request.nextUrl;

    const protectedAppRoutes = ['/profile', '/create', '/settings'];
    const allProtectedRoutes = [...protectedAppRoutes, '/onboarding'];

    // 2. Logic Check
    if (user) {
        // A. Auth Page Redirects (Don't let logged-in users see login page)
        if (pathname.startsWith('/auth') && pathname !== '/auth/reset-password') {
            return NextResponse.redirect(new URL('/profile', request.url));
        }

        // B. Root Redirect
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/profile', request.url));
        }

        // C. Check Profile Completion (INLINED QUERY)
        // We query the DB directly here to avoid importing external files that might break Edge compatibility
        let isProfileComplete = false;
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single();

            if (profile && profile.username) {
                isProfileComplete = true;
            }
        } catch (e) {
            // Ignore error, treat as incomplete
        }

        // D. Handle Onboarding Redirects
        if (!isProfileComplete && protectedAppRoutes.some(route => pathname.startsWith(route))) {
            return NextResponse.redirect(new URL('/onboarding', request.url));
        }

        if (isProfileComplete && pathname.startsWith('/onboarding')) {
            return NextResponse.redirect(new URL('/profile', request.url));
        }

    } else {
        // 3. Protected Routes Redirect
        if (allProtectedRoutes.some(route => pathname.startsWith(route))) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};