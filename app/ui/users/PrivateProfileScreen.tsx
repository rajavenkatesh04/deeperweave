import { LockClosedIcon } from '@heroicons/react/24/solid';
import FollowButton from '@/app/ui/users/FollowButton';

export default function PrivateProfileScreen({ profileId, isPrivate, initialFollowStatus }: {
    profileId: string;
    isPrivate: boolean;
    initialFollowStatus: 'not_following' | 'pending' | 'accepted';
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-zinc-800 py-20 text-center">
            <LockClosedIcon className="h-12 w-12 text-gray-400 dark:text-zinc-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-zinc-100">This Account is Private</h2>
            <p className="mt-1 text-base text-gray-600 dark:text-zinc-400">Follow this account to see their posts and activity.</p>
            <div className="mt-6">
                <FollowButton profileId={profileId} isPrivate={isPrivate} initialFollowStatus={initialFollowStatus} />
            </div>
        </div>
    );
}