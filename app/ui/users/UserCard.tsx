import Link from 'next/link';
import Image from 'next/image';
import { UserProfile } from '@/lib/definitions';

export default function UserCard({ profile }: { profile: UserProfile }) {
    return (
        <Link
            href={`/profile/${profile.username}`}
            className="group block rounded-xl border bg-white p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
        >
            <div className="flex items-center gap-4">
                <Image
                    src={profile.profile_pic_url || '/placeholder-user.jpg'}
                    alt={`${profile.display_name}'s profile picture`}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-white/10"
                />
                <div className="overflow-hidden">
                    <p className="truncate font-bold text-gray-800 dark:text-zinc-200">{profile.display_name}</p>
                    <p className="truncate text-sm text-gray-500 dark:text-zinc-400">@{profile.username}</p>
                </div>
            </div>
        </Link>
    );
}