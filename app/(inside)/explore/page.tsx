// app/(inside)/explore/page.tsx
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { MdConstruction } from 'react-icons/md';
import Link from 'next/link';

export default function ExplorePage() {
    return (
        <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="space-y-8 max-w-lg mx-auto">
                {/* Animated Icon */}
                <div className="mx-auto w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-3xl flex items-center justify-center -rotate-6 hover:rotate-0 transition-transform duration-300">
                    <MdConstruction className="w-12 h-12 text-zinc-900 dark:text-white" />
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h1 className={`${PlayWriteNewZealandFont.className} text-5xl md:text-7xl font-bold`}>
                        Explore
                    </h1>
                    <h2 className="text-xl font-medium text-zinc-900 dark:text-white">
                        Under Construction
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        We are crafting a new way to discover curated stories and community collections.
                        Check back soon for the launch.
                    </p>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                    <Link
                        href="/"
                        className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </main>
    );
}