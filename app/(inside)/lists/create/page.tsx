'use client'; // 1. Crucial: This must be a client component for hooks

import { useActionState, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // Use the client-side creator
import { createList } from '@/lib/actions/list-actions';
import { ListBulletIcon, ArrowLeftIcon, ArrowLongRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CreateListPage() {
    // 2. Initialize the action state
    const [state, formAction, isPending] = useActionState(createList, null);

    // State for the profile since we are now in a client component
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', user.id)
                    .single();
                if (profile) setUsername(profile.username);
            }
        };
        fetchUser();
    }, []);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

            {/* Header / Nav */}
            <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between pointer-events-none">
                <Link href="/profile" className="pointer-events-auto flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors bg-white/50 dark:bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Cancel
                </Link>
            </header>

            {/* Abstract Backdrop */}
            <div className="relative h-[40vh] w-full bg-zinc-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-50" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 to-transparent" />
            </div>

            <main className="pb-24">
                <div className="relative z-10 max-w-7xl mx-auto px-6 -mt-32">

                    {/* 3. Use formAction instead of createList directly */}
                    <form action={formAction} className="grid grid-cols-1 lg:grid-cols-5 gap-12">

                        {/* LEFT COLUMN */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="relative aspect-[2/3] w-full max-w-md mx-auto bg-zinc-100 dark:bg-zinc-900 shadow-2xl border-4 border-white dark:border-zinc-800 rounded-sm flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
                                <ListBulletIcon className="w-20 h-20 mb-4 opacity-50" />
                                <span className="text-xs font-bold uppercase tracking-widest opacity-50">List Cover</span>
                            </div>

                            <div className="hidden lg:block bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm opacity-60 grayscale">
                                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">List Stats</p>
                                <div className="flex gap-4 text-sm">
                                    <span>0 Items</span>
                                    <span>•</span>
                                    <span>Public</span>
                                    <span>•</span>
                                    <span>{new Date().getFullYear()}</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="lg:col-span-3 lg:mt-32 space-y-10">

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-1 border border-zinc-400 dark:border-zinc-600 text-xs font-bold rounded uppercase">
                                        List
                                    </span>
                                    <span className="text-xs font-bold text-zinc-500">
                                        Created by @{username || '...'}
                                    </span>
                                </div>

                                {/* 4. Display Action Error if it exists */}
                                {state?.error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded text-sm font-medium">
                                        {state.error}
                                    </div>
                                )}

                                <div className="relative">
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        placeholder="Name your list..."
                                        className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 py-2 text-4xl md:text-6xl font-light tracking-tight text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
                                        autoComplete="off"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                                    Description / Overview
                                </h2>
                                <textarea
                                    name="description"
                                    rows={4}
                                    placeholder="What is this collection about? (e.g., 'The best horror movies of the 80s')"
                                    className="w-full bg-transparent text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-light focus:outline-none resize-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                                />
                            </div>

                            <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="group flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    <span>{isPending ? 'Creating...' : 'Create List'}</span>
                                    {!isPending && <ArrowLongRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                                </button>

                                <p className="text-xs text-zinc-400 max-w-xs">
                                    You can add movies and shows to this list immediately after creating it.
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}