'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PowerIcon } from '@heroicons/react/24/outline';
import { logout } from '@/lib/actions/auth-actions';

export default function SignOutButton({
                                          children,
                                          className
                                      }: {
    children: React.ReactNode;
    className?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* The Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={className}
            >
                {children}
            </button>

            {/* The Confirmation Modal */}
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => setIsOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-sm bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 relative">
                                    {/* Decorative Corners */}
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-zinc-900 dark:border-zinc-100" />
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zinc-900 dark:border-zinc-100" />
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-zinc-900 dark:border-zinc-100" />
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-900 dark:border-zinc-100" />

                                    <div className="text-center space-y-4">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500">
                                            <PowerIcon className="h-6 w-6" />
                                        </div>

                                        <Dialog.Title className="text-lg font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                                            Terminate Session?
                                        </Dialog.Title>

                                        <Dialog.Description className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                                            Are you sure you want to log out? Local session data will be cleared.
                                        </Dialog.Description>

                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={() => setIsOpen(false)}
                                                className="flex-1 py-2 px-4 border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-900 dark:text-zinc-100"
                                            >
                                                Cancel
                                            </button>
                                            <form action={logout} className="flex-1">
                                                <button
                                                    type="submit"
                                                    className="w-full h-full py-2 px-4 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-500 transition-colors"
                                                >
                                                    Confirm
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}