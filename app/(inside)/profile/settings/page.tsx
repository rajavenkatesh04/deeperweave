import Breadcrumbs from "@/app/ui/Breadcrumbs";
import { getUserProfile } from '@/lib/data/user-data';
import { redirect } from "next/navigation";
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
    const userData = await getUserProfile();

    if (!userData || !userData.profile || !userData.user) {
        redirect("/auth/login");
    }

    return (
        <main className="w-full bg-zinc-50 dark:bg-zinc-950 min-h-screen pb-24">
            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <Breadcrumbs
                    breadcrumbs={[
                        { label: 'Profile', href: '/profile' },
                        { label: 'Settings', href: '/profile/settings', active: true },
                    ]}
                />
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-8 md:mt-12">
                {/* Settings Form */}
                <SettingsForm
                    profile={userData.profile}
                    userEmail={userData.user.email || ''}
                />
            </div>
        </main>
    );
}