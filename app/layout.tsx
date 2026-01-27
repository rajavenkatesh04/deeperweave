import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { googleSansCode } from "@/app/ui/fonts";
import NativeNavigation from "@/app/ui/android-app/NativeNavigation";

export const metadata: Metadata = {
    title: {
        template: '%s | DeeperWeave',
        default: 'DeeperWeave',
    },
    description: 'Track Movies, Write blogs, Discover Content.',
    metadataBase: new URL('https://DeeperWeave.com/'),
};

// ⚠️ NEW: This tells mobile phones to let us draw behind the notch/status bar
export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover', // This is the magic key for the notch
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
        <meta name="apple-mobile-web-app-title" content="DeeperWeave" />
        <body className={`${googleSansCode.className} antialiased bg-white text-gray-900 dark:bg-zinc-950 dark:text-zinc-100`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {/* ⚠️ NEW: Logic for the back button lives here */}
            <NativeNavigation />

            {children}
            <Toaster richColors position="top-right" />
            <Analytics />
        </ThemeProvider>
        </body>
        </html>
    );
}