'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/auth/login');
        router.refresh(); // Ensure the server-side components are re-rendered
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
        >
            Logout
        </button>
    );
}
