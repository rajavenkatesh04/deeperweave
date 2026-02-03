import Link from 'next/link';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { EnvelopeIcon, ArrowPathIcon, InboxIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default async function Page({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
    const params = await searchParams;
    const userEmail = params?.email || "your registered email";

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative">

            {/* Main Content Wrapper */}
            <div className="w-full max-w-5xl">

                {/* Card Container (Split Layout) */}
                <div className="grid md:grid-cols-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-sm md:shadow-2xl overflow-hidden">

                    {/* LEFT COLUMN: Visual/Thematic Area (Desktop Only) */}
                    <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-white p-12 border-r border-zinc-200 dark:border-zinc-800 relative overflow-hidden">

                        {/* Film Grain Texture */}
                        <div className="absolute inset-0 opacity-10"
                             style={{
                                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                             }}
                        />
                        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80 opacity-90" />

                        <div className="relative z-10 text-center space-y-8 max-w-sm">
                            <div className="mx-auto w-40 h-40 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                <EnvelopeIcon className="w-20 h-20 text-zinc-200" />
                            </div>

                            <div className="space-y-4">
                                <h2 className={`${PlayWriteNewZealandFont.className} text-5xl font-bold text-white tracking-tight`}>
                                    Stand By.
                                </h2>
                                <p className="text-sm font-medium text-zinc-400 italic">
                                    "Awaiting confirmation signal..."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: The Content */}
                    <div className="flex flex-col min-h-[600px]">

                        {/* Mobile Header: Visual with Grain (Visible only on mobile) */}
                        <div className="md:hidden relative bg-zinc-950 text-white py-12 px-6 text-center border-b border-zinc-800 overflow-hidden">
                            {/* Mobile Grain */}
                            <div className="absolute inset-0 opacity-10"
                                 style={{
                                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                 }}
                            />
                            <div className="relative z-10">
                                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-white/10 mb-4 backdrop-blur-md">
                                    <EnvelopeIcon className="w-6 h-6 text-white" />
                                </div>
                                <h2 className={`${PlayWriteNewZealandFont.className} text-3xl font-bold text-white mb-1`}>
                                    Stand By.
                                </h2>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                                    Awaiting Input
                                </p>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 lg:p-16 flex-1 flex flex-col justify-center">

                            <div className="mb-10 text-center md:text-left">

                                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
                                    Check your inbox
                                </h1>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    We've sent a secure login link to:
                                </p>
                                <div className="mt-4 p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-sm">
                                    <p className="text-sm font-mono text-zinc-900 dark:text-zinc-100 break-all text-center md:text-left">
                                        {userEmail}
                                    </p>
                                </div>
                            </div>

                            {/* Steps List */}
                            <div className="space-y-4 mb-8">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-xs font-bold border border-zinc-200 dark:border-zinc-800">
                                        1
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Click the link</h3>
                                        <p className="text-xs text-zinc-500 mt-1">Open the email and click the confirmation button to activate your account.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                                        <InboxIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Check spam</h3>
                                        <p className="text-xs text-zinc-500 mt-1">If it's not in your inbox, check your spam or junk folder.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                                        <ArrowPathIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Wait a moment</h3>
                                        <p className="text-xs text-zinc-500 mt-1">It typically arrives instantly, but can take up to 2 minutes.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-auto pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center md:text-left">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Wrong email address?{' '}
                                    <Link href="/auth/sign-up" className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline underline-offset-4 transition-colors">
                                        Try again
                                    </Link>
                                </p>

                                {/* Mobile Logo (Footer) */}
                                <div className="md:hidden mt-8">
                                    <Link href="/" className="inline-block opacity-50 grayscale hover:grayscale-0 transition-all">
                                        <span className={`${PlayWriteNewZealandFont.className} text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100`}>
                                            Deeper Weave
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}