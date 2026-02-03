import { createClient } from '@/utils/supabase/server';
import ProfileSectionDisplay from "@/app/ui/podium/ProfileSectionDisplay";

export default async function ProfileHomePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const isOwnProfile = user?.user_metadata?.username === username;

    return (
        <div className="w-full min-h-[50vh] animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">

            {/* HYBRID HEADER: Compact Industrial Frame */}
            <header className="w-full pt-10 pb-12 px-4 flex justify-center">
                <div className="relative w-full max-w-3xl mx-auto text-center">

                    {/* The "Box" - Reduced vertical padding (py-8 instead of py-12) */}
                    <div className="relative border-y border-zinc-200 dark:border-zinc-800 py-8 px-4 md:px-6">

                        {/* Decorative Corners - Smaller on mobile */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 md:w-3 md:h-3 border-t border-l border-zinc-900 dark:border-zinc-100" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 border-t border-r border-zinc-900 dark:border-zinc-100" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 md:w-3 md:h-3 border-b border-l border-zinc-900 dark:border-zinc-100" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 md:w-3 md:h-3 border-b border-r border-zinc-900 dark:border-zinc-100" />

                        {/* 1. The Eyebrow - Compact spacing */}
                        <div className="flex items-center justify-center gap-3 mb-3 md:mb-4 opacity-70">
                            <div className="h-px w-4 md:w-8 bg-zinc-300 dark:bg-zinc-700"></div>
                            <span className="text-[9px] md:text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                                Curated Collection
                            </span>
                            <div className="h-px w-4 md:w-8 bg-zinc-300 dark:bg-zinc-700"></div>
                        </div>

                        {/* 2. The Main Title - Tighter leading, slightly smaller */}
                        <h1 className="relative z-10 text-5xl md:text-7xl font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100 leading-none">
                            Podium
                        </h1>

                        {/* Background Depth - Scaled down */}
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[4rem] md:text-[8rem] font-black text-zinc-500/5 dark:text-zinc-100/5 select-none pointer-events-none blur-[2px] whitespace-nowrap z-0">
                            RANKINGS
                        </span>

                        {/* 3. The Paragraph - Reduced margin top */}
                        <p className="relative z-10 max-w-md mx-auto mt-4 md:mt-6 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
                            A definitive ranking of the cinema, series, and stars that define my taste.
                            <span className="hidden sm:inline"> These are the stories that stayed with me.</span>
                        </p>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="w-full max-w-4xl mx-auto px-4 md:px-6">
                <ProfileSectionDisplay
                    username={username}
                    isOwnProfile={isOwnProfile}
                />
            </main>
        </div>
    );
}