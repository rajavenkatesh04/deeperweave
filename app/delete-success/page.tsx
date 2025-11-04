import Link from 'next/link';
// Import a new icon to make it more specific to your app
import { UserGroupIcon, SparklesIcon, FilmIcon } from '@heroicons/react/24/outline'; // Removed HeartIcon
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function DeleteSuccessPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">

                {/* Broken heart animation (Kept this, it's great) */}
                <div className="flex justify-center mb-8 animate-pulse">
                    <div className="relative">
                        <HeartIconSolid className="h-24 w-24 text-red-500 opacity-30" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-0.5 w-32 bg-gray-700 rotate-45"></div>
                        </div>
                    </div>
                </div>

                {/* Main content - Tweaked copy */}
                <div className="text-center space-y-6 mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        It&apos;s quiet without you...
                    </h1>

                    <p className="text-xl text-gray-300 leading-relaxed">
                        Your account has been erased. All your film logs, connections, and discussions are now gone.
                    </p>

                    {/* Testimonial - Tweaked copy */}
                    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 space-y-4 mt-8">
                        <p className="text-gray-400 italic">
                            &ldquo;...I missed the film discussions and my watchlist. It&apos;s just not the same anywhere else.&rdquo;
                        </p>
                        <p className="text-sm text-gray-500">— A Deeper Weave member who returned</p>
                    </div>
                </div>

                {/* What they're missing - REBRANDED & Tweaked */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                        Here&apos;s What You Left Behind
                    </h2>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            {/* ✨ REBRANDED */}
                            <UserGroupIcon className="h-8 w-8 text-orange-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-medium text-white mb-1">Your Community</h3>
                                <p className="text-gray-400">People who valued your reviews and contributions. They&apos;ll notice you&apos;re gone.</p>
                            </div>
                        </div>

                        {/* Updated this to be more specific to your app */}
                        <div className="flex items-start gap-4">
                            {/* ✨ REBRANDED */}
                            <FilmIcon className="h-8 w-8 text-orange-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-medium text-white mb-1">Your Watch History</h3>
                                <p className="text-gray-400">Your entire film timeline, your ratings, and all your curated lists are no longer accessible.</p>
                            </div>
                        </div>

                        {/* Updated this to be more specific to your app */}
                        <div className="flex items-start gap-4">
                            {/* ✨ REBRANDED */}
                            <SparklesIcon className="h-8 w-8 text-orange-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-medium text-white mb-1">Premium Benefits</h3>
                                <p className="text-gray-400">Your premium status, exclusive features, and ad-free experience are now gone.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Emotional appeal stats - REBRANDED */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 text-center border border-gray-700">
                        {/* ✨ REBRANDED */}
                        <div className="text-3xl font-bold text-orange-400 mb-1">73%</div>
                        <div className="text-sm text-gray-400">Return within a week</div>
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 text-center border border-gray-700">
                        {/* ✨ REBRANDED */}
                        <div className="text-3xl font-bold text-orange-400 mb-1">89%</div>
                        <div className="text-sm text-gray-400">Say they missed us</div>
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 text-center border border-gray-700">
                        {/* ✨ REBRANDED */}
                        <div className="text-3xl font-bold text-orange-400 mb-1">2 days</div>
                        <div className="text-sm text-gray-400">Average time away</div>
                    </div>
                </div>

                {/* CTA buttons - REBRANDED */}
                <div className="space-y-4">
                    <Link
                        href="/auth/sign-up" // Changed to sign-up
                        // ✨ REBRANDED: Main CTA to your brand's orange/red gradient
                        className="block w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-lg text-center transition-all transform hover:scale-105 shadow-lg"
                    >
                        I Made a Mistake — Let Me Back In
                    </Link>

                    <Link
                        href="/"
                        className="block w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 px-6 rounded-lg text-center transition-all border border-gray-600"
                    >
                        Leave Anyway (We&apos;ll Miss You)
                    </Link>
                </div>

                <p className="text-center text-sm text-gray-500 mt-8">
                    Your spot is waiting. We&apos;d love to have you back anytime.
                </p>
            </div>
        </div>
    );
}