import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function LivyaProgressPage() {
    // Phase 1 tasks remain the same as they are foundational
    const completedTasks = [
        'Project Scaffolding (Next.js & TypeScript)',
        'Styling Foundation with Tailwind CSS',
        'Firebase Backend Integration (Auth & Database)',
        'Initial Deployment & Live Hosting on Vercel',
        'This Live Progress Tracking Page Setup',
    ];

    // Updated Phase 2 tasks for the core blogging features
    const phase2Tasks = [
        'User Authentication & Profile System',
        'Secure API Routes for Blog Posts',
        'Blog Post Creator with Rich Text Editing',
        'Integration with Movie Database API (for autofill)',
        'Designing the Public Blog Feed UI',
    ];

    // New Phase 3 tasks for social features
    const phase3Tasks = [
        'User Following & Follower System',
        'Personalized Content Feeds',
        'Commenting and Like/React Features on Posts',
        'User-to-User Direct Messaging',
    ];

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4 dark:bg-zinc-950">
            <div className="mx-auto max-w-3xl">
                <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-8">
                    <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-zinc-100">
                       Hi <span className="text-red-600 dark:text-red-500"> Livya,</span>
                    </h1>
                    <p className="mb-6 text-gray-600 dark:text-zinc-300">
                        Welcome to the dashboard for our curated social platform for movie blogs!
                    </p>

                    <p className="mb-8 text-sm text-gray-500 dark:text-zinc-400">
                        Last Updated: September 9, 2025
                    </p>

                    <div className="space-y-8 text-gray-700 dark:text-zinc-300">
                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-red-600 dark:text-red-500">
                                Phase 1: Foundation (Complete)
                            </h2>
                            <p className="mb-4">
                                The foundational work is done! We&apos;ve successfully built the project&apos;s backbone,
                                ready for the core features of our movie blog platform.
                            </p>
                            <ul className="space-y-2">
                                {completedTasks.map((task) => (
                                    <li key={task} className="flex items-center">
                                        <CheckCircleIcon className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                                        <span>{task}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-red-600 dark:text-red-500">
                                Phase 2: Core Blogging Engine (Up Next) 🚀
                            </h2>
                            <p className="mb-4">
                                Now we build the heart of the application: letting users sign up, create posts, and
                                pull in movie data automatically. This phase is all about content creation.
                            </p>
                            <ul className="list-inside list-disc space-y-2 pl-2">
                                {phase2Tasks.map((task) => (
                                    <li key={task}>{task}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-3 text-xl font-semibold text-gray-500 dark:text-zinc-400">
                                Phase 3: Social & Community Features (The Horizon) 🌐
                            </h2>
                            <p className="mb-4">
                                Once the core engine is built, we&apos;ll transform the platform into a true social network
                                by adding community and interaction features.
                            </p>
                            <ul className="list-inside list-disc space-y-2 pl-2 text-gray-500 dark:text-zinc-400">
                                {phase3Tasks.map((task) => (
                                    <li key={task}>{task}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-red-600 dark:text-red-500">
                                Financials & Kicking Off Phase 2
                            </h2>
                            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                                <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-zinc-700">
                                    <span className="font-medium text-gray-800 dark:text-zinc-200">Total Project Cost:</span>
                                    <span>₹5,000</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 py-2 dark:border-zinc-700">
                                    <span className="font-medium text-gray-800 dark:text-zinc-200">Initial Payment Received:</span>
                                    <span className="text-green-600 dark:text-green-500">-₹2,000</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-lg font-bold text-gray-900 dark:text-zinc-100">Pending Amount:</span>
                                    <span className="text-lg font-bold text-red-600 dark:text-red-500">₹3,000</span>
                                </div>
                            </div>
                            {/*<p className="mt-4 text-sm">*/}
                            {/*    To kick off Phase 2 and begin building the user authentication and blog creation systems,*/}
                            {/*    the next milestone payment of <strong>₹3,000</strong> is now due.*/}
                            {/*    Once settled, I will begin development immediately!*/}
                            {/*</p>*/}
                        </section>

                        <section>
                            <p className="text-center italic text-gray-600 dark:text-zinc-400">
                                I&apos;m incredibly excited to build this with you. Let me know if you have any questions!
                            </p>
                        </section>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <a href="mailto:grv.9604@gmail.com" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                        Contact Me &rarr;
                    </a>
                </div>
            </div>
        </main>
    );
}