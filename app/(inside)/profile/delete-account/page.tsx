// app/profile/delete-account/page.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { Suspense, useActionState } from 'react';
import Link from 'next/link';
import { deleteMyAccount, type DeleteAccountState } from '@/lib/actions/profile-actions';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { ArrowLeftIcon, ExclamationTriangleIcon, FilmIcon } from "@heroicons/react/24/outline";

function DeleteButtonContent() {
    const { pending } = useFormStatus();
    return (
        <>
            {pending ? (
                <><LoadingSpinner className="mr-2 h-4 w-4" /> Deleting...</>
            ) : (
                'Permanently Delete'
            )}
        </>
    );
}

export default function DeleteAccountPage() {
    const initialState: DeleteAccountState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(deleteMyAccount, initialState);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative">

            {/* Desktop Back Button */}
            <div className="hidden md:block absolute top-10 left-10">
                <Link href="/profile/settings" className="group flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
                    <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Settings
                </Link>
            </div>

            {/* Split Layout Container */}
            <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-sm md:shadow-xl overflow-hidden">

                {/* Left Column: Visual/Thematic Area */}
                <div className="hidden md:flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900/50 p-12 border-r border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                    <div className="relative z-10 text-center space-y-6 max-w-sm">
                        {/* You can replace this Icon with your custom SVG */}
                        <div className="mx-auto w-32 h-32 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600">
                            <FilmIcon className="w-16 h-16 opacity-50" />
                        </div>

                        <div className="space-y-2">
                            <h2 className={`${PlayWriteNewZealandFont.className} text-3xl font-bold text-zinc-400 dark:text-zinc-600`}>
                                The End?
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                                "Part of the journey is the end."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: The Form */}
                <div className="p-8 md:p-12 lg:p-16">

                    {/* Mobile Back Button */}
                    <div className="md:hidden mb-8">
                        <Link href="/profile/settings" className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
                            <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Back
                        </Link>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <span className={`${PlayWriteNewZealandFont.className} text-2xl font-bold tracking-tight opacity-40 grayscale md:hidden`}>
                                Deeper Weave
                            </span>
                            <div className="p-2 bg-red-50 dark:bg-red-900/10 rounded-full ml-auto md:ml-0">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-500" />
                            </div>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
                            Final Cut.
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            We were hoping for a sequel, but if you're ready to wrap production, we understand.
                            Confirm below to permanently delete your account and all associated data.
                        </p>
                    </div>

                    {/* Form */}
                    <form action={dispatch} className="space-y-8">
                        <div className="space-y-3">
                            <label htmlFor="confirmation" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                Type <span className="text-black dark:text-white font-bold select-all">DELETE</span> to confirm
                            </label>
                            <input
                                id="confirmation"
                                name="confirmation"
                                type="text"
                                className="block w-full h-12 border-b border-zinc-300 bg-transparent px-0 text-base placeholder:text-zinc-300 focus:border-red-600 focus:outline-none dark:border-zinc-700 dark:focus:border-red-500 transition-colors font-medium"
                                placeholder=""
                            />
                            {state.errors?.confirmation && (
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium animate-pulse">{state.errors.confirmation[0]}</p>
                            )}
                            {state.message && (
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium">{state.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col-reverse md:flex-row gap-3">
                            <Link
                                href="/profile/settings"
                                className="flex-1 flex h-11 items-center justify-center bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                className="flex-1 flex h-11 items-center justify-center bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent shadow-md hover:shadow-lg shadow-red-500/20"
                            >
                                <Suspense fallback={<LoadingSpinner className="mx-auto" />}>
                                    <DeleteButtonContent />
                                </Suspense>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}