import Link from 'next/link';
import { DM_Serif_Display, Inter } from 'next/font/google';
import { MdCollectionsBookmark, MdArrowForward } from 'react-icons/md';

// --- Fonts (Matching UserBadge Dialog) ---
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });
const inter = Inter({ subsets: ['latin'] });

export default function ListsPage() {
    return (
        <main className={`min-h-[85vh] w-full flex items-center justify-center p-4 ${inter.className}`}>

            {/* --- Card Container (Styled exactly like the Dialog.Panel) --- */}
            <div className="w-full max-w-sm relative transform overflow-hidden rounded-3xl bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl p-8 text-center align-middle shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-black/50 transition-all border border-white/50 dark:border-white/10 ring-1 ring-black/5">

                {/* --- Top Glow Effect (Purple/Pink for "Creativity") --- */}
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-fuchsia-500/20 to-transparent opacity-40 pointer-events-none" />

                <div className="relative flex flex-col items-center pt-2">

                    {/* --- Icon with Glow --- */}
                    <div className="relative mb-8">
                        {/* Background Blur Glow */}
                        <div className="absolute inset-0 blur-2xl opacity-50 bg-fuchsia-400 dark:bg-fuchsia-900 scale-150" />

                        {/* Icon */}
                        <div className="relative z-10 w-16 h-16 text-fuchsia-600 dark:text-fuchsia-400 drop-shadow-sm">
                            <MdCollectionsBookmark className="w-full h-full" />
                        </div>
                    </div>

                    {/* --- Typography --- */}
                    <h1 className={`${dmSerif.className} text-3xl text-zinc-900 dark:text-white mb-3`}>
                        Lists Are Coming
                    </h1>

                    <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-[260px] mx-auto mb-8">
                        Curate your own cinematic universe. Soon you'll be able to build custom collections like "Horror Classics" or "Ghibli Favorites" and share them with the world.
                    </p>

                    {/* --- Action Button (Matching "Understood" button style) --- */}
                    <div className="w-full">
                        <Link
                            href="/discover"
                            className="group w-full flex items-center justify-center gap-2 relative overflow-hidden rounded-full bg-zinc-900 dark:bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white dark:text-black transition-transform active:scale-[0.98] shadow-lg hover:shadow-xl hover:bg-zinc-800 dark:hover:bg-zinc-200"
                        >
                            <span>Explore Meanwhile</span>
                            <MdArrowForward className="w-3 h-3" />
                        </Link>
                    </div>

                </div>
            </div>
        </main>
    );
}