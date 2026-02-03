'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { PowerIcon } from '@heroicons/react/24/outline';

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/auth/login');
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            className="group relative flex items-center justify-center gap-3 px-6 py-3 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:border-red-600 dark:hover:border-red-600 rounded-sm transition-all duration-300 overflow-hidden"
        >
            {/* Hover Fill Effect (Slides up from bottom) */}
            <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />

            {/* Icon */}
            <PowerIcon className="relative z-10 w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-white transition-colors duration-300" />

            {/* Label */}
            <span className="relative z-10 text-xs font-bold uppercase tracking-[0.15em] text-zinc-600 dark:text-zinc-400 group-hover:text-white transition-colors duration-300">
                Disconnect
            </span>
        </button>
    );
}