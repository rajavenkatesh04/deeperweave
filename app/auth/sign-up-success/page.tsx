export default function Page() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950">
            <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
                        Thank you for signing up!
                    </h1>
                    <p className="mt-4 text-gray-600 dark:text-zinc-400">
                        Check your email to confirm
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-zinc-500">
                        You&apos;ve successfully signed up. Please check your email to
                        confirm your account before signing in.
                    </p>
                </div>
            </div>
        </div>
    )
}