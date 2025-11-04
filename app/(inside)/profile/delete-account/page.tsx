// app/profile/delete-account/page.tsx
'use client';

import {useFormStatus } from 'react-dom';
import {Suspense, useActionState} from 'react';
import Link from 'next/link';
import { deleteMyAccount, type DeleteAccountState } from '@/lib/actions/profile-actions';
import LoadingSpinner from '@/app/ui/loading-spinner';

/**
 * A helper component for the delete button's pending state.
 */
function DeleteButtonContent() {
    const { pending } = useFormStatus();
    return (
        <>
            {pending ? <LoadingSpinner className="mx-auto" /> : 'Permanently Delete My Account'}
        </>
    );
}

export default function DeleteAccountPage() {
    const initialState: DeleteAccountState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(deleteMyAccount, initialState);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 dark:bg-zinc-950">
            <div className="w-full max-w-md space-y-6 rounded-lg border border-red-300 bg-white p-6 shadow-sm dark:border-red-900/50 dark:bg-zinc-900 sm:p-8">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-red-700 dark:text-red-500 sm:text-3xl">We&apos;re sorry to see you go</h1>
                    <p className="mt-2 text-gray-600 dark:text-zinc-400">
                        This is a permanent action and cannot be undone. All your profile data, posts, comments, and follower relationships will be lost forever.
                    </p>
                    <p className="mt-2 text-gray-600 dark:text-zinc-400">
                        Are you sure you want to proceed?
                    </p>
                </div>

                <form action={dispatch} className="space-y-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                        To confirm this action, please type the word <strong>DELETE</strong> below.
                    </p>
                    <div>
                        <input
                            id="confirmation"
                            name="confirmation"
                            type="text"
                            className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-red-500 focus:ring-red-500 dark:border-zinc-700 dark:bg-zinc-800"
                        />
                        {state.errors?.confirmation && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                                {state.errors.confirmation[0]}
                            </p>
                        )}
                        {state.message && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                                {state.message}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:gap-4">
                        <Link
                            href="/profile/settings"
                            className="flex-1 mt-2 sm:mt-0 w-full text-center rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                        >
                            Cancel, take me back
                        </Link>
                        <button
                            type="submit"
                            className="group flex-1 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                        >
                            {/* We wrap the button content in Suspense for useFormStatus */}
                            <Suspense fallback={<LoadingSpinner className="mx-auto" />}>
                                <DeleteButtonContent />
                            </Suspense>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}