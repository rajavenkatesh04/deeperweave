'use client';

import Link from 'next/link';
import { ArrowLongRightIcon, DocumentPlusIcon, FilmIcon } from '@heroicons/react/24/outline';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { clsx } from 'clsx';

// --- Utility: Grain ---
function FilmGrain() {
    return (
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
             style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
             }}
        />
    );
}

// --- Data ---
interface CreationOption {
    title: string;
    description: string;
    href: string;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const creationOptions: CreationOption[] = [
    {
        title: 'Screenplay / Blog',
        description: 'Draft a new narrative, review, or thought piece.',
        href: '/blog/create',
        label: 'SCENE 01',
        icon: DocumentPlusIcon,
    },
    // Example of a second option to show grid layout
    // {
    //     title: 'Log Film',
    //     description: 'Add a new entry to your watched history.',
    //     href: '/timeline/create',
    //     label: 'SCENE 02',
    //     icon: FilmIcon,
    // },
];

// --- Card Component ---
function CreateCard({ title, description, href, label, icon: Icon }: CreationOption) {
    return (
        <Link
            href={href}
            className="group relative block bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-8 transition-all duration-500 hover:border-zinc-900 dark:hover:border-zinc-100"
        >
            {/* Hover Fill Effect */}
            <div className="absolute inset-0 bg-zinc-900 dark:bg-zinc-100 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col h-full">
                {/* Meta Label */}
                <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                        {label}
                    </span>
                    <Icon className="w-6 h-6 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className={`${PlayWriteNewZealandFont.className} text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 group-hover:translate-x-2 transition-transform duration-500`}>
                        {title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                        {description}
                    </p>
                </div>

                {/* Action Footer */}
                <div className="mt-8 flex items-center gap-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                    <span className="text-xs font-bold uppercase tracking-widest">Initialize</span>
                    <ArrowLongRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
            </div>
        </Link>
    );
}

export default function Page() {
    return (
        <div className="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">

            {/* Header / Hero */}
            <div className="relative h-[40vh] flex flex-col justify-center items-center text-center p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white overflow-hidden">
                <FilmGrain />
                <div className="relative z-10 animate-in fade-in zoom-in duration-1000">
                    <div className="w-16 h-16 mx-auto mb-6 border border-white/20 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-sm">
                        <FilmIcon className="w-8 h-8 text-white/80" />
                    </div>
                    <h1 className={`${PlayWriteNewZealandFont.className} text-5xl md:text-7xl font-bold tracking-tight mb-4`}>
                        The Studio.
                    </h1>
                    <p className="text-sm md:text-base font-medium text-zinc-400 uppercase tracking-widest max-w-md mx-auto">
                        Manifest your imagination into the weave.
                    </p>
                </div>
                {/* Decorative lines */}
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
                {/* Background Noise for body */}
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('/noise.svg')]" />

                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    {creationOptions.map((option) => (
                        <CreateCard key={option.title} {...option} />
                    ))}

                    {/* Placeholder for visual balance if only 1 item exists,
                        or add a "Coming Soon" card style */}
                    {creationOptions.length === 1 && (
                        <div className="hidden md:flex flex-col justify-center items-center p-8 border border-dashed border-zinc-300 dark:border-zinc-800 opacity-50 select-none">
                            <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                                // MORE FORMATS LOADING...
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}