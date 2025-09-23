import Breadcrumbs from "@/app/ui/Breadcrumbs";
// ✨ 1. Use the new data fetching function
import { getProfileForEdit } from "@/lib/data/user-data";
import { redirect } from "next/navigation";
import ProfileEditForm from "./edit-form";
import { Suspense } from "react";
import { ProfileFormSkeleton } from "@/app/ui/skeletons";

export default async function ProfileEditPage() {
    // ✨ 2. Fetch all data needed for the edit page, including favorite films
    const userData = await getProfileForEdit();

    if (!userData || !userData.profile) {
        redirect("/login");
    }

    return (
        <main className={`p-6`}>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Profile', href: '/profile' },
                    { label: 'Edit', href: '/profile/edit', active: true },
                ]}
            />
            <div className="mt-6">
                <Suspense fallback={<ProfileFormSkeleton />}>
                    {/* ✨ 3. Pass the favorite films down to the form component */}
                    <ProfileEditForm
                        profile={userData.profile}
                        favoriteFilms={userData.favoriteFilms || []}
                    />
                </Suspense>
            </div>
        </main>
    );
}