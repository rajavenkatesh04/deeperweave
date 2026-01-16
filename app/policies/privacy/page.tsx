import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { dmSerif, googleSansCode } from '@/app/ui/fonts';

export default function PrivacyPolicyPage() {
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
                        Privacy
                    </span>
                </div>
            </header>

            <main className="py-20 px-6">
                <div className="max-w-3xl mx-auto">

                    {/* --- Title Section --- */}
                    <div className="mb-20 text-center space-y-6">
                        <div className="inline-block p-4 rounded-full bg-zinc-100 dark:bg-zinc-900 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                        </div>
                        <h1 className={`${dmSerif.className} text-5xl md:text-6xl text-zinc-900 dark:text-zinc-50`}>
                            Privacy Policy
                        </h1>
                        <p className={`text-sm text-zinc-500 uppercase tracking-widest ${googleSansCode.className}`}>
                            Effective Date: January 16, 2026
                        </p>
                    </div>

                    {/* --- Content Sections --- */}
                    <div className="space-y-16 relative">
                        {/* Vertical Line Decoration */}
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

                        <Section number="01" title="Our Commitment">
                            <p>
                                At DeeperWeave, your privacy is as important as the plot of a good thriller. We are committed to transparency in how we collect, use, and share your personal data while you discover and track your favorite films and shows.
                            </p>
                        </Section>

                        <Section number="02" title="Data We Collect">
                            <p className="mb-4">To provide a personalized cinematic experience, we collect:</p>
                            <ul className="space-y-4">
                                <ListItem title="Identity Data">
                                    Your name, email address, and profile picture, collected via Google Sign-In authentication.
                                </ListItem>
                                <ListItem title="Cinematic Data">
                                    The movies and shows you save, your ratings, your custom lists, and the timelines you create. This is the core of your DeeperWeave profile.
                                </ListItem>
                                <ListItem title="Usage Analytics">
                                    Anonymous data on how you navigate the app (e.g., which genres you browse) to help us improve performance. We use Vercel Analytics and Microsoft Clarity for this purpose.
                                </ListItem>
                            </ul>
                        </Section>

                        <Section number="03" title="How We Use Your Data">
                            <p>
                                We do not sell your data. We use your information solely to:
                            </p>
                            <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-zinc-300 dark:marker:text-zinc-700">
                                <li>Maintain your personal library of watched content and lists.</li>
                                <li>Socialize your experience by showing your reviews and lists to other users (unless your profile is Private).</li>
                                <li>Authenticate your access to the platform.</li>
                            </ul>
                        </Section>

                        <Section number="04" title="Cookies & Storage">
                            <p>
                                We use cookies primarily for authentication (keeping you logged in) and essential site preferences (like Dark Mode).
                            </p>
                            <p className="mt-4">
                                You can manage your cookie preferences at any time. Clearing your browser cookies will sign you out of DeeperWeave.
                            </p>
                        </Section>

                        <Section number="05" title="Third-Party Services">
                            <p>
                                We rely on trusted third parties to power DeeperWeave:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                <ServiceCard name="Google / Firebase" role="Authentication & Database" />
                                <ServiceCard name="TMDB" role="Movie Metadata Provider" />
                                <ServiceCard name="Vercel" role="Hosting & Analytics" />
                            </div>
                        </Section>

                        <Section number="06" title="Data Security">
                            <p>
                                We employ industry-standard security measures (SSL, secure database rules) to protect your information. However, no method of transmission over the Internet is 100% secure.
                            </p>
                        </Section>

                        <Section number="07" title="Contact Us">
                            <p>
                                If you have questions about your data or wish to request data deletion, please contact us at <a href="mailto:grv.9604@gmail.com" className="text-zinc-900 dark:text-zinc-100 font-medium underline decoration-zinc-300 hover:decoration-amber-500 transition-all">grv.9604@gmail.com</a>.
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

// --- Sub-components for cleaner code ---

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

function ListItem({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <li className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <strong className="text-zinc-900 dark:text-zinc-200 font-medium shrink-0">{title}:</strong>
            <span className="text-zinc-600 dark:text-zinc-400">{children}</span>
        </li>
    );
}

function ServiceCard({ name, role }: { name: string, role: string }) {
    return (
        <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
            <div className="font-semibold text-zinc-800 dark:text-zinc-200">{name}</div>
            <div className="text-sm text-zinc-500">{role}</div>
        </div>
    );
}