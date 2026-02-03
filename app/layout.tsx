import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import {googleSansCode, interFont} from "@/app/ui/fonts";
import NativeNavigation from "@/app/ui/android-app/NativeNavigation";
import Providers from "@/app/providers";

export const metadata: Metadata = {
    title: {
        template: '%s | DeeperWeave',
        default: 'DeeperWeave',
    },
    description: 'Track Movies, Write blogs, Discover Content.',
    metadataBase: new URL('https://DeeperWeave.com/'),
    openGraph: {
        // Point to your Vercel helper
        images: ['https://my-image-helper.vercel.app/api/og?username=raja'],
    },
};

// ⚠️ NEW: This tells mobile phones to let us draw behind the notch/status bar
export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'auto', // This is the magic key for the notch
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
        <meta name="apple-mobile-web-app-title" content="DeeperWeave" />
        <body className={`${interFont.className} antialiased bg-white text-gray-900 dark:bg-zinc-950 dark:text-zinc-100`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {/* ⚠️ NEW: Logic for the back button lives here */}
            <NativeNavigation />

            <Providers>
                {children}
            </Providers>
            <Toaster richColors position="top-right" />
            <Analytics />
        </ThemeProvider>
        </body>
        </html>
    );
}