import { redirect } from 'next/navigation';
import { LogoutButton } from './LogoutButton';
import { getUserProfile } from '@/lib/data';
import { UserIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

export default async function ProfilePage() {
    const userData = await getUserProfile();

    if (!userData) {
        redirect("/auth/login");
    }

    const { user, profile } = userData;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
            <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
                {/* Page header */}
                <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-zinc-800">
                    {/* For Cal Sans, using a larger size and medium weight is better than bold */}
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
                        My Profile
                    </h1>
                    <LogoutButton />
                </div>

                {/* Profile Information Section */}
                <section className="py-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="flex-shrink-0">
                            {/* Corrected Image Fallback */}
                            {profile?.profile_pic_url ? (
                                <img
                                    className="h-24 w-24 rounded-full object-cover"
                                    src={profile.profile_pic_url}
                                    alt="Profile picture"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                                    <UserIcon className="h-12 w-12 text-gray-500 dark:text-zinc-500" />
                                </div>
                            )}
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start space-x-3">
                                <h2 className="text-xl font-medium text-gray-900 dark:text-zinc-100">{profile?.display_name || 'User'}</h2>
                                <button className="p-1 rounded-full text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                                    <PencilSquareIcon className="w-5 h-5" />
                                    <span className="sr-only">Edit Profile</span>
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-zinc-400">@{profile?.username || 'no_username'}</p>
                            <p className="mt-2 text-sm text-gray-600 dark:text-zinc-300 max-w-lg mx-auto sm:mx-0">
                                {profile?.bio || 'No bio has been set yet.'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Account Details Section */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100">
                                Account Details
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-zinc-400">
                                Your personal and subscription information.
                            </p>
                        </div>
                        <div className="border-t border-gray-200 dark:border-zinc-800">
                            <dl>
                                {/* Email */}
                                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-zinc-400">Email address</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-zinc-200 sm:mt-0 sm:col-span-2">{user.email}</dd>
                                </div>
                                {/* Gender */}
                                <div className="bg-slate-50 dark:bg-zinc-950/50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-zinc-400">Gender</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-zinc-200 sm:mt-0 sm:col-span-2">{profile?.gender || 'Not specified'}</dd>
                                </div>
                                {/* Birthday */}
                                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-zinc-400">Birthday</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-zinc-200 sm:mt-0 sm:col-span-2">{profile?.date_of_birth || 'Not specified'}</dd>
                                </div>
                                {/* Subscription */}
                                <div className="bg-slate-50 dark:bg-zinc-950/50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-zinc-400">Subscription</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-zinc-200 sm:mt-0 sm:col-span-2 capitalize">{profile?.subscription_status || 'Free'}</dd>
                                </div>
                                {/* User ID */}
                                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-zinc-400">User ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-zinc-200 sm:mt-0 sm:col-span-2">
                                        <code className="text-xs bg-gray-100 dark:bg-zinc-800 p-1 rounded-md">{user.id}</code>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}