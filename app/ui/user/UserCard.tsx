// app/ui/user/UserCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { UserProfile } from '@/lib/definitions';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function UserCard({ profile }: { profile: UserProfile }) {
    return (
        <Link
            href={`/profile/${profile.username}`}
            className={`
                group relative flex items-center justify-between gap-4 p-4 w-full transition-all duration-200
                
                /* Mobile Styles: Simple list item, full width, subtle hover */
                hover:bg-zinc-900/50

                /* Desktop Styles: Boxed card look with borders */
                md:border md:border-zinc-900 md:bg-black md:hover:border-zinc-700 md:hover:bg-zinc-900
            `}
        >
            <div className="flex items-center gap-4 min-w-0">
                {/* Avatar Container */}
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden bg-zinc-800 border border-zinc-800 md:border-transparent">
                    <Image
                        src={profile.profile_pic_url || '/placeholder-user.jpg'}
                        alt={`${profile.display_name}'s profile picture`}
                        fill
                        className="object-cover opacity-90  group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500"
                    />
                </div>

                {/* Text Info */}
                <div className="overflow-hidden">
                    <p className="truncate font-semibold text-zinc-200 group-hover:text-white transition-colors text-sm md:text-base">
                        {profile.display_name}
                    </p>
                    <p className="truncate text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 transition-colors">
                        @{profile.username}
                    </p>
                </div>
            </div>

            {/* Hover Arrow (Visible on hover for Desktop, subtle cue for Mobile) */}
            <ArrowRightIcon className="h-4 w-4 text-zinc-600 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
        </Link>
    );
}