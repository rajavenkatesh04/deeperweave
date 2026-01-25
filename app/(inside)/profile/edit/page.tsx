import Breadcrumbs from "@/app/ui/Breadcrumbs";
import { getProfileForEdit } from "@/lib/data/user-data";
import { redirect } from "next/navigation";
import ProfileEditForm from "./edit-form";
import { Suspense } from "react";

export default async function ProfileEditPage() {
    const userData = await getProfileForEdit();

    if (!userData || !userData.profile) {
        // Not logged in or hasn't completed onboarding
        redirect("/auth/login");
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
                <Suspense fallback={`loading...`}>
                    <ProfileEditForm
                        profile={userData.profile}
                        favoriteItems={userData.favoriteItems || []}
                    />
                </Suspense>
            </div>
        </main>
    );
}