'use client';

import Image from 'next/image';
import { ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { geistSans } from "@/app/ui/fonts";

interface StatsOverviewProps {
    totalMinutes: number;
    topBuddy: {
        count: number;
        user: {
            username: string;
            profile_pic_url: string | null;
        };
    } | null;
}

export default function StatsOverview({ totalMinutes, topBuddy }: StatsOverviewProps) {
    const totalHours = Math.floor(totalMinutes / 60);
    const days = (totalHours / 24).toFixed(1);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Time Card */}
            <div className="flex flex-col p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-6">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Time Invested</span>
                </div>
                <div className="mt-auto">
                    <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight ${geistSans.className}`}>
                            {totalHours.toLocaleString()}
                        </span>
                        <span className="text-sm font-medium text-zinc-500">hrs</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                        ~{days} days total
                    </p>
                </div>
            </div>

            {/* Buddy Card */}
            <div className="flex flex-col p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-6">
                    <UserGroupIcon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Top Collaborator</span>
                </div>

                {topBuddy ? (
                    <div className="flex items-center gap-3 mt-auto">
                        <div className="relative w-10 h-10 rounded-full border border-zinc-100 dark:border-zinc-800 overflow-hidden shrink-0">
                            <Image
                                src={topBuddy.user.profile_pic_url || '/placeholder-user.jpg'}
                                alt={topBuddy.user.username}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <p className={`text-sm font-bold text-zinc-900 dark:text-zinc-100 ${geistSans.className}`}>
                                @{topBuddy.user.username}
                            </p>
                            <p className="text-xs text-zinc-500">
                                watched {topBuddy.count} movies together
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-auto">
                        <p className="text-sm font-medium text-zinc-400 italic">Solo traveler</p>
                    </div>
                )}
            </div>
        </div>
    );
}