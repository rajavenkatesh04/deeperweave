import { createClient } from '@/utils/supabase/server';
import ProfileSectionDisplay from "@/app/ui/podium/ProfileSectionDisplay";
import {PlayWriteNewZealandFont} from "@/app/ui/fonts";

export default async function ProfileHomePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const supabase = await createClient();

    // ⚡️ OPTIMIZED: Auth check from Token (Zero DB Latency)
    const { data: { user } } = await supabase.auth.getUser();
    const isOwnProfile = user?.user_metadata?.username === username;

    // 🚀 RENDER: Client Component fetches data via TanStack
    return (
        <div className="w-full min-h-[50vh] animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

            {/* MINIMAL CENTERED HEADER */}
            <header className="w-full pt-6 pb-10 px-4 flex flex-col items-center justify-center text-center">
                <div className="relative">
                    <h1
                        className={`${PlayWriteNewZealandFont.className} text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-blue-400 to-cyan-400 leading-tight`}
                    >
                        Podium
                    </h1>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="w-full max-w-4xl mx-auto px-4 md:px-6">
                {/* We pass 'username' so the Client Component can fetch/cache the data */}
                <ProfileSectionDisplay
                    username={username}
                    isOwnProfile={isOwnProfile}
                />
            </main>
        </div>
    );
}