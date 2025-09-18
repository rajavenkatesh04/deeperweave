export default function Page() {
    return (
        // Added padding for spacing on small screens
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 dark:bg-zinc-950">
            {/* Added responsive padding to the card */}
            <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
                <div className="text-center">
                    {/* Added an icon for better visual feedback */}
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6 text-green-600 dark:text-green-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                    </div>
                    {/* Made heading text size responsive */}
                    <h1 className="mt-5 text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-3xl">
                        Thank you for signing up!
                    </h1>
                    <p className="mt-3 text-base text-gray-600 dark:text-zinc-400">
                        Please check your email to confirm your account.
                    </p>
                </div>
            </div>
        </div>
    )
}
