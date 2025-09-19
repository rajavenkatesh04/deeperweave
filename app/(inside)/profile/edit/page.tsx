// app/(inside)/profile/edit/page.tsx

import Breadcrumbs from "@/app/ui/Breadcrumbs";
import { getUserProfile } from "@/lib/data"; // 1. Import the data fetching function
import { redirect } from "next/navigation";  // 2. Import redirect for handling non-logged-in users
import ProfileEditForm from "./edit-form";   // 3. Import your new form component
import { Suspense } from "react";
import { ProfileFormSkeleton } from "@/app/ui/skeletons";



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