import Breadcrumbs from "@/app/ui/Breadcrumbs";
import { getProfileForEdit } from "@/lib/data/user-data";
import { redirect } from "next/navigation";
import ProfileEditForm from "./edit-form";
import { Suspense } from "react";
import LoadingSpinner from "@/app/ui/loading-spinner";

export default async function ProfileEditPage() {
    // 1. Fetch the new data structure (Profile + Sections)
    const userData = await getProfileForEdit();

    if (!userData || !userData.profile) {
        redirect("/auth/login");
    }

    return (
        <main className="p-6">
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Profile', href: '/profile' },
                    { label: 'Edit', href: '/profile/edit', active: true },
                ]}
            />
            <div className="mt-6">
                <Suspense fallback={<div className="flex justify-center p-10"><LoadingSpinner /></div>}>
                    {/* 2. Pass 'sections' instead of 'favoriteItems' */}
                    <ProfileEditForm
                        profile={userData.profile}
                        sections={userData.sections || []}
                    />
                </Suspense>
            </div>
        </main>
    );
}