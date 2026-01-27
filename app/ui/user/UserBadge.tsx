import {
    ShieldCheckIcon, // Staff
    SparklesIcon,    // Critic
    LifebuoyIcon,    // Support
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid'; // Verified
import { UserRole } from '@/lib/definitions';

export default function UserBadge({ role }: { role: UserRole }) {
    switch (role) {
        case 'staff':
            return (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 border border-zinc-700">
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Staff</span>
                </div>
            );

        case 'support':
            return (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <LifebuoyIcon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Support</span>
                </div>
            );

        case 'verified':
            // The "Actor/Director" role - Classic Blue Tick
            return (
                <div title="Verified Account" className="text-blue-500 dark:text-blue-400">
                    <CheckBadgeIcon className="w-5 h-5" />
                </div>
            );

        case 'critic':
            return (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Critic</span>
                </div>
            );

        case 'user':
        default:
            return null;
    }
}