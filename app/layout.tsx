import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import {ThemeProvider} from "next-themes";
import {Toaster} from "sonner";
import {googleSansCode, interFont, josefinSans} from "@/app/ui/fonts";

export const metadata: Metadata = {
    title: {
        template: '%s | DeeperWeave',
        default: 'DeeperWeave',
    },
    description: 'Track Movies, Write blogs, Discover Content.',
    metadataBase: new URL('https://DeeperWeave.com/'),
};

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
            {children}
            <Toaster richColors position="top-right" />
            <Analytics />
        </ThemeProvider>
        </body>
        </html>
    );
}
