import type { Metadata } from "next";
import { Cal_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import {ThemeProvider} from "next-themes";
import {Toaster} from "sonner";

const calSans = Cal_Sans({
    weight: ['400'],
    subsets: ['latin'],
    fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
    title: {
        template: '%s | Liv',
        default: 'Liv',
    },
    description: 'The heart of your blogs',
    metadataBase: new URL('https://liv-lively.vercel.app/'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
        <meta name="apple-mobile-web-app-title" content="Liv" />
        <body className={`${calSans.className} antialiased bg-white text-gray-900 dark:bg-zinc-950 dark:text-zinc-100`}>
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
