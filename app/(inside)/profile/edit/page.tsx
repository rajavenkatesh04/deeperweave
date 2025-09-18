// app/(inside)/profile/edit/page.tsx

import Breadcrumbs from "@/app/ui/Breadcrumbs";
import { UserProfile } from "@/lib/definitions";
import Image from "next/image";
import { getUserProfile } from "@/lib/data"; // 1. Import the data fetching function
import { redirect } from "next/navigation";  // 2. Import redirect for handling non-logged-in users
import ProfileEditForm from "./edit-form";   // 3. Import your new form component
import { Suspense } from "react";
import { ProfileFormSkeleton } from "@/app/ui/skeletons";

// This small header is useful for showing the user what they are editing
function ProfileHeader({ profile }: { profile: UserProfile }) {
    const usernameStyle = 'bg-zinc-500/10 text-zinc-600 border border-zinc-500/20 dark:text-zinc-400';

    return (
        <div className="mb-8 flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <Image
                className="h-16 w-16 rounded-full object-cover"
                src={profile?.profile_pic_url || '/placeholder-user.jpg'}
                alt="Current profile picture"
                width={64}
                height={64}
            />
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                    Editing Profile for {profile?.display_name}
                </h2>
                <span className={`mt-1 inline-block rounded-md px-2 py-1 text-xs font-medium ${usernameStyle}`}>
                    @{profile?.username}
                </span>
            </div>
        </div>
    );
}


// 4. Make the page an async Server Component
export default async function ProfileEditPage() {
    // 5. Fetch user data on the server
    const userData = await getUserProfile();

    // 6. Redirect if the user isn't logged in or has no profile
    if (!userData || !userData.profile) {
        redirect("/auth/login");
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Profile', href: '/profile' },
                    { label: 'Edit', href: '/profile/edit', active: true },
                ]}
            />

            <div className="mt-6">

                <Suspense fallback={<ProfileFormSkeleton />}>
                    <ProfileEditForm profile={userData.profile} />
                </Suspense>
            </div>
        </main>
    );
}