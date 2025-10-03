import { EnvelopeIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default async function Page({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
    const params = await searchParams;
    const userEmail = params?.email || "your registered email";

    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-100 p-4 dark:from-[#0a0a0a] dark:via-[#1a0f0a] dark:to-[#121212]">
            <div className="w-full max-w-lg space-y-7 rounded-2xl border border-gray-200/60 bg-white/90 p-10 backdrop-blur-sm shadow-2xl dark:border-orange-900/20 dark:bg-[#1c1c1c]/95 dark:shadow-orange-500/5">

                {/* Animated icon transition: Check → Envelope */}
                <div className="relative mx-auto h-20 w-20">
                    {/* Checkmark - appears first then fades out */}
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30 animate-in zoom-in-0 duration-500 dark:from-green-500 dark:to-green-700">
                        <CheckCircleIcon className="h-12 w-12 text-white animate-in zoom-in-50 duration-300 delay-200" strokeWidth={2.5} />
                    </div>

                    {/* Envelope - appears after checkmark */}
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30 animate-in zoom-in-0 fade-in-0 duration-500 delay-700 dark:from-orange-500 dark:to-orange-700">
                        <EnvelopeIcon className="h-10 w-10 text-white" strokeWidth={2} />
                    </div>
                </div>

                {/* Heading */}
                <div className="space-y-3 text-center animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-500">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-50">
                        Check Your Email
                    </h1>
                    <p className="text-base text-gray-600 dark:text-zinc-400">
                        We&apos;ve sent a confirmation link to
                    </p>
                    <div className="mx-auto max-w-sm rounded-lg bg-orange-50 px-4 py-2.5 dark:bg-orange-900/20">
                        <p className="break-all text-sm font-semibold text-orange-700 dark:text-orange-400">
                            {userEmail}
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="relative animate-in fade-in-0 duration-500 delay-900">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wide">
                        <span className="bg-white px-3 text-gray-500 dark:bg-[#1c1c1c] dark:text-zinc-500">
                            What to do next
                        </span>
                    </div>
                </div>

                {/* Action steps */}
                <div className="space-y-4 animate-in fade-in-0 duration-500 delay-1000">

                    {/* Step 1 - Primary action */}
                    <div className="flex items-start gap-4 rounded-xl border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-900/30 dark:bg-orange-900/10">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 dark:bg-orange-600">
                            <span className="text-lg font-bold text-white">1</span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-gray-900 dark:text-zinc-100">
                                Open your email and click the confirmation link
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-zinc-400">
                                This will verify your email address and activate your account.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 & 3 - Secondary tips */}
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
                            <ExclamationCircleIcon className="h-6 w-6 flex-shrink-0 text-orange-500 mt-0.5" strokeWidth={2} />
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                                    Check spam folder
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-zinc-400">
                                    Sometimes emails end up there by mistake.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
                            <ClockIcon className="h-6 w-6 flex-shrink-0 text-orange-500 mt-0.5" strokeWidth={2} />
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                                    Wait a few minutes
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-zinc-400">
                                    Delivery can take up to 5 minutes.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="pt-2 text-center animate-in fade-in-0 duration-500 delay-1200">
                    <p className="text-sm text-gray-500 dark:text-zinc-500">
                        Wrong email address?{' '}
                        <a href="/auth/sign-up" className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors underline-offset-4 hover:underline">
                            Sign up again
                        </a>
                    </p>
                </div>

            </div>
        </main>
    );
}