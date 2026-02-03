import Breadcrumbs from "@/app/ui/Breadcrumbs";
import { getProfileForEdit } from "@/lib/data/user-data";
import { redirect } from "next/navigation";
import ProfileEditForm from "./edit-form";
import { Suspense } from "react";
import LoadingSpinner from "@/app/ui/loading-spinner";

export default async function ProfileEditPage() {
    const userData = await getProfileForEdit();

    if (!userData || !userData.profile) {
        redirect("/auth/login");
    }

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Tighter padding on mobile (p-3), wider on desktop */}
            <div className="p-3 md:p-6 lg:p-8 max-w-5xl mx-auto">
                <div className="mb-4 md:mb-6">
                    <Breadcrumbs
                        breadcrumbs={[
                            { label: 'Profile', href: '/profile' },
                            { label: 'Edit', href: '/profile/edit', active: true },
                        ]}
                    />
                </div>

                <Suspense fallback={<div className="flex justify-center p-20"><LoadingSpinner /></div>}>
                    <ProfileEditForm
                        profile={userData.profile}
                        sections={userData.sections || []}
                    />
                </Suspense>
            </div>
        </main>
    );
}