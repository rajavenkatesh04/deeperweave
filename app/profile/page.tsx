import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { LogoutButton } from './LogoutButton';

export default async function ProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch profile data based on user id
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">
                        Welcome to your Profile
                    </h1>
                    <LogoutButton />
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
                    <h2 className="text-xl font-semibold mb-4">User Information</h2>
                    <div className="space-y-3 text-sm">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Username:</strong> {profile?.username || 'Not set'}</p>
                        <p><strong>Display Name:</strong> {profile?.display_name || 'Not set'}</p>
                        <p><strong>User ID:</strong> <code className="bg-gray-200 dark:bg-zinc-800 p-1 rounded-md">{user.id}</code></p>
                    </div>
                </div>
            </div>
        </div>
    );
}