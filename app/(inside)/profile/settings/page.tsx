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

            <div className="max-w-3xl mx-auto px-6 mt-8 md:mt-12">
                <div className="mb-10 pl-6 border-l-2 border-zinc-900 dark:border-zinc-100">
                    <h1 className={`${PlayWriteNewZealandFont.className} text-3xl text-zinc-900 dark:text-zinc-100 mb-2`}>
                        Settings
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
                        Manage your profile visibility, account identity, and content preferences.
                    </p>
                </div>

                {/* Settings Form */}
                <SettingsForm
                    profile={userData.profile}
                    userEmail={userData.user.email || ''}
                />
            </div>
        </main>
    );
}