import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { dmSerif, googleSansCode } from '@/app/ui/fonts';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-100 selection:bg-amber-100 dark:selection:bg-amber-900/30">

            {/* --- Header --- */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                        <span className={googleSansCode.className}>DEEPERWEAVE</span>
                    </Link>
                    <span className={`text-xs font-bold uppercase tracking-widest text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full ${googleSansCode.className}`}>
                        Terms
                    </span>
                </div>
            </header>

            <main className="py-20 px-6">
                <div className="max-w-3xl mx-auto">

                    {/* --- Title Section --- */}
                    <div className="mb-20 text-center space-y-6">
                        <div className="inline-block p-4 rounded-full bg-zinc-100 dark:bg-zinc-900 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                        </div>
                        <h1 className={`${dmSerif.className} text-5xl md:text-6xl text-zinc-900 dark:text-zinc-50`}>
                            Terms of Service
                        </h1>
                        <p className={`text-sm text-zinc-500 uppercase tracking-widest ${googleSansCode.className}`}>
                            Effective Date: January 16, 2026
                        </p>
                    </div>

                    {/* --- Content Sections --- */}
                    <div className="space-y-16 relative">
                        {/* Vertical Line Decoration */}
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

                        <Section number="01" title="The Cinematic Covenant">
                            <p>
                                Welcome to DeeperWeave. By accessing our platform, creating timelines, or weaving your cinematic lists, you agree to these Terms. DeeperWeave is a space for film lovers to catalog and discover art. Treat it—and your fellow cinephiles—with respect.
                            </p>
                        </Section>

                        <Section number="02" title="Membership & Accounts">
                            <p>
                                To curate your own deeper weave of content, you must register via Google Sign-In. You are the director of your account; you are responsible for safeguarding your access keys and for all activity that occurs under your profile.
                            </p>
                        </Section>

                        <Section number="03" title="User Generated Content">
                            <p>
                                DeeperWeave allows you to post reviews, create lists, and build timelines. By posting, you grant us a license to display and distribute this content on the platform.
                            </p>
                            <p className="mt-4">
                                You agree not to post content that is:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1 marker:text-zinc-300 dark:marker:text-zinc-700">
                                <li>Hate speech, harassment, or abusive towards other users.</li>
                                <li>Spam, automated scripts, or unauthorized advertising.</li>
                                <li>Pirated content or links to illegal streams.</li>
                            </ul>
                        </Section>

                        <Section number="04" title="Intellectual Property">
                            <p>
                                The DeeperWeave interface, logo, and code are our proprietary property.
                            </p>
                            <p className="mt-4">
                                <strong>Movie Data:</strong> Metadata, posters, and backdrops for movies and TV shows are provided by <a href="https://www.themoviedb.org/" target="_blank" className="underline hover:text-amber-600">The Movie Database (TMDb)</a>. This product uses the TMDb API but is not endorsed or certified by TMDb.
                            </p>
                        </Section>

                        <Section number="05" title="Termination of Service">
                            <p>
                                We may suspend or terminate your access to DeeperWeave immediately, without prior notice, if you breach these Terms. Upon termination, your right to use the Service will cease immediately.
                            </p>
                        </Section>

                        <Section number="06" title="Limitation of Liability">
                            <p>
                                DeeperWeave is provided &quot;AS IS&quot;. We weave the code, but we cannot guarantee it will never unravel. We are not liable for any loss of data (lists, watch history) or service interruptions.
                            </p>
                        </Section>

                        <Section number="07" title="Contact the Studio">
                            <p>
                                For legal inquiries or support regarding these terms, please contact us at <a href="mailto:grv.9604@gmail.com" className="text-zinc-900 dark:text-zinc-100 font-medium underline decoration-zinc-300 hover:decoration-amber-500 transition-all">grv.9604@gmail.com</a>.
                            </p>
                        </Section>

                    </div>

                    <div className="mt-24 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center">
                        <p className="text-zinc-400 text-sm">
                            &copy; 2026 DeeperWeave. All rights reserved.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Section({ number, title, children }: { number: string, title: string, children: React.ReactNode }) {
    return (
        <div className="md:pl-12 relative group">
            <span className={`absolute -left-3 top-1 md:left-0 md:-translate-x-1/2 w-6 h-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-400 group-hover:border-zinc-900 dark:group-hover:border-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors ${googleSansCode.className}`}>
                {number}
            </span>
            <h2 className={`${dmSerif.className} text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 mb-4`}>
                {title}
            </h2>
            <div className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
                {children}
            </div>
        </div>
    );
}