'use client'; // Needed because FollowButton is client-side interactive

import Link from 'next/link';
import Image from 'next/image';
import { UserProfile, ProfileSearchResult } from '@/lib/definitions';
import UserBadge from '@/app/ui/user/UserBadge';
import FollowButton from '@/app/ui/user/FollowButton';

// Union type to accept both full Profile or Search Result
type UserCardProps = {
    profile: UserProfile | ProfileSearchResult;
    // Optional: Pass current user ID if you want to hide button for "Me"
    currentUserId?: string;
};

export default function UserCard({ profile, currentUserId }: UserCardProps) {

    // Safety check: Don't show follow button for yourself
    const isMe = currentUserId === profile.id;

    // Default values if data is missing (fallback safety)
    const isPrivate = 'visibility' in profile ? profile.visibility === 'private' : false;
    const followStatus = 'follow_status' in profile ? profile.follow_status : 'not_following';

    return (
        <div className="flex items-center justify-between w-full px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors duration-200">
            {/* Clickable Area for Profile */}
            <Link
                href={`/profile/${profile.username}`}
                className="flex items-center gap-3.5 min-w-0 flex-1"
            >
                {/* Avatar */}
                <div className="relative h-11 w-11 flex-shrink-0">
                    <Image
                        src={profile.profile_pic_url || '/placeholder-user.jpg'}
                        alt={profile.display_name}
                        fill
                        className="rounded-full object-cover border border-zinc-100 dark:border-zinc-800"
                    />
                </div>

                {/* Text Info */}
                <div className="flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-none">
                            {profile.username}
                        </span>
                        <UserBadge role={profile.role} />
                    </div>

                    <span className="text-sm text-zinc-500 dark:text-zinc-400 truncate mt-0.5 leading-none">
                        {profile.display_name}
                    </span>
                </div>
            </Link>

            {/* ✨ Follow Button (Right Aligned) */}
            {!isMe && (
                <div className="ml-4 w-24 flex-shrink-0">
                    <FollowButton
                        profileId={profile.id}
                        isPrivate={isPrivate}
                        initialFollowStatus={followStatus}
                    />
                </div>
            )}
        </div>
    );
}