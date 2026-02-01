import { notFound } from 'next/navigation';
import { getUserAnalytics } from '@/lib/data/analytics-data';
import { getUserProfile } from '@/lib/data/user-data';
import { TicketIcon } from '@heroicons/react/24/solid'; // Solid for section headers
import { geistSans } from "@/app/ui/fonts";
import PlatformChart from "@/app/ui/analytics/platform-chart";
import CinematicHeatmap from "@/app/ui/analytics/heatmap";
import StatsOverview from "@/app/ui/analytics/stats-overview";

export default async function AnalyticsPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    // 1. Fetch Data
    const [analyticsData, currentUserData] = await Promise.all([
        getUserAnalytics(username),
        getUserProfile()
    ]);

    if (!analyticsData || !analyticsData.profile) notFound();

    const { profile, entries } = analyticsData;
    const isOwner = currentUserData?.user?.id === profile.id;

    // --- AGGREGATION LOGIC ---
    const platforms: Record<string, number> = {};
    let totalMinutes = 0;
    const buddies: Record<string, { count: number, user: any }> = {};

    entries.forEach(entry => {
        // Platforms
        if (entry.viewing_context) {
            const p = entry.viewing_context.trim();
            platforms[p] = (platforms[p] || 0) + 1;
        }
        // Time Estimate
        if (entry.movie_id) totalMinutes += 120;
        else if (entry.series_id) totalMinutes += 45;

        // Collaborators
        // @ts-ignore
        entry.timeline_collaborators?.forEach(collab => {
            if (collab.profiles) {
                // @ts-ignore
                const pid = collab.profiles.id;
                if (!buddies[pid]) buddies[pid] = { count: 0, user: collab.profiles };
                buddies[pid].count++;
            }
        });
    });

    const topPlatforms = Object.entries(platforms)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const topBuddy = Object.values(buddies).sort((a, b) => b.count - a.count)[0] || null;

    return (
        <div className={`w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative z-10 max-w-4xl mx-auto pt-8 px-4 md:px-6 ${geistSans.className}`}>

            {/* PAGE HEADER */}
            <div className="mb-10">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Analytics</h2>
                <p className="text-sm text-zinc-500 mt-1">
                    Performance metrics for <span className="font-semibold text-zinc-800 dark:text-zinc-200">@{username}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* --- LEFT COLUMN: Activity & Stats --- */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 1. HEATMAP (Keeping the user-approved design) */}
                    <div className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-8 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                            <TicketIcon className="w-4 h-4 text-amber-500" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                                Viewing Frequency
                            </h3>
                        </div>
                        <CinematicHeatmap entries={entries} />
                    </div>

                    {/* 2. STATS OVERVIEW (Redesigned) */}
                    <StatsOverview totalMinutes={totalMinutes} topBuddy={topBuddy} />
                </div>

                {/* --- RIGHT COLUMN: Platforms --- */}
                <div className="h-full">
                    {/* 3. PIE CHART (Redesigned) */}
                    <PlatformChart
                        platforms={topPlatforms}
                        totalLogs={entries.length}
                        isOwner={isOwner}
                    />
                </div>

            </div>
        </div>
    );
}