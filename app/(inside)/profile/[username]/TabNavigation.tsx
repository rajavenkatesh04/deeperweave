'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import clsx from 'clsx';
import {motion, LayoutGroup} from 'framer-motion';
import {
    HomeIcon,
    ClockIcon,
    DocumentTextIcon,
    EllipsisHorizontalIcon,
    RectangleStackIcon,
    ListBulletIcon,
} from '@heroicons/react/24/outline';

const ICONS: Record<string, React.ElementType> = {
    Podium: HomeIcon,
    Timeline: ClockIcon,
    Lists: ListBulletIcon,
    Posts: DocumentTextIcon,
    More: EllipsisHorizontalIcon,
};

const TAB_ACCENTS: Record<string, string> = {
    Podium: 'from-amber-400 to-orange-500',
    Timeline: 'from-cyan-400 to-blue-500',
    Lists: 'from-fuchsia-400 to-pink-500',
    Posts: 'from-emerald-400 to-teal-500',
    More: 'from-violet-400 to-purple-500',
};

export default function TabNavigation({
                                          username,
                                          isOwnProfile,
                                      }: {
    username: string;
    isOwnProfile: boolean;
}) {
    const pathname = usePathname();
    const baseUrl = `/profile/${username}`;

    const tabs = [
        {name: 'Podium', href: `${baseUrl}/podium`},
        {name: 'Timeline', href: `${baseUrl}/timeline`},
        {name: 'Lists', href: `/lists`},
        {name: 'Posts', href: `${baseUrl}/posts`},
    ];

    if (isOwnProfile) {
        tabs.push({name: 'More', href: `${baseUrl}/more`});
    }

    return (
        <div
            className="
    sticky top-0 z-50 w-full
    bg-white/80 dark:bg-black/80
    backdrop-blur-xl

    shadow-[0_10px_35px_rgba(0,0,0,0.45)]

    /* top gradient line */
    before:absolute before:inset-x-0 before:top-0 before:h-px
    before:bg-gradient-to-r before:from-transparent before:via-zinc-400/40 before:to-transparent

    /* bottom gradient line */
    after:absolute after:inset-x-0 after:bottom-0 after:h-px
    after:bg-gradient-to-r after:from-transparent after:via-zinc-400/40 after:to-transparent
  "
        >

        <div className="max-w-6xl mx-auto px-4 md:px-8">
                <LayoutGroup>
                    <nav
                        className="
                            relative flex gap-10 overflow-x-auto scrollbar-hide
                            h-14 items-center
                        "
                        aria-label="Tabs"
                    >
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.href;
                            const Icon = ICONS[tab.name] || RectangleStackIcon;
                            const accent =
                                TAB_ACCENTS[tab.name] ??
                                'from-zinc-400 to-zinc-600';

                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className={clsx(
                                        'relative flex items-center gap-2 text-xs font-bold uppercase tracking-widest whitespace-nowrap select-none transition-colors',
                                        isActive
                                            ? 'text-zinc-900 dark:text-zinc-100'
                                            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                                    )}
                                >
                                    <Icon
                                        className={clsx(
                                            'w-4 h-4 transition-transform duration-300',
                                            isActive
                                                ? 'stroke-2 scale-105'
                                                : 'group-hover:-translate-y-0.5'
                                        )}
                                    />

                                    <span>{tab.name}</span>

                                    {/* SLIDING INDICATOR */}
                                    {isActive && (
                                        <motion.span
                                            layoutId="active-tab-indicator"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 500,
                                                damping: 35,
                                            }}
                                            className={clsx(
                                                'absolute -bottom-[10px] left-0 w-full h-[4px] rounded-full bg-gradient-to-r',
                                                accent,
                                                'shadow-[0_0_14px_rgba(0,255,255,0.45)]'
                                            )}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </LayoutGroup>
            </div>
        </div>
    );
}
