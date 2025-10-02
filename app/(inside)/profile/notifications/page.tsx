// app/(inside)/profile/notifications/page.tsx

import { redirect } from 'next/navigation';
import { getUserProfile, getFollowRequests } from '@/lib/data/user-data';
import Breadcrumbs from '@/app/ui/Breadcrumbs';
import Image from 'next/image';
import Link from 'next/link';
import RequestActions from './RequestActions'; // This should be imported from its own file

export default async function NotificationsPage() {
    const userData = await getUserProfile();

    if (!userData) {
        redirect('/auth/login');
    }

    const requests = await getFollowRequests(userData.user.id);

    return (
        <main className={`m-4`}>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Profile', href: '/profile' },
                    { label: 'Notifications', href: '/profile/notifications', active: true },
                ]}
            />
            <div className="mt-6">
                <h1 className="text-3xl font-bold">Follow Requests</h1>
                <div className="mt-6 rounded-lg border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                    {requests.length > 0 ? (
                        <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {requests.map((req) => (
                                <li key={req.follower_id} className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
                                    <Link href={`/profile/${req.profiles.username}`} className="flex items-center gap-4">
                                        <Image
                                            src={req.profiles.profile_pic_url || '/placeholder-user.jpg'}
                                            alt={req.profiles.display_name}
                                            width={48}
                                            height={48}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-zinc-100">{req.profiles.display_name}</p>
                                            <p className="text-sm text-gray-500 dark:text-zinc-400">@{req.profiles.username}</p>
                                        </div>
                                    </Link>
                                    <RequestActions requesterId={req.follower_id} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-12 text-center">
                            <h3 className="font-semibold text-gray-900 dark:text-zinc-100">No new requests</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">You don&apos;t have any pending follow requests right now.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}