import Breadcrumbs from "@/app/ui/Breadcrumbs";
import { getUserProfile } from '@/lib/data/user-data';
import { redirect } from "next/navigation";
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
    const userData = await getUserProfile();

    if (!userData || !userData.profile) {
        redirect("/auth/login");
    }

    return (
        <main className="w-full bg-zinc-50 dark:bg-zinc-950 min-h-screen pb-24">
            <div className="max-w-7xl mx-auto px-6 py-6">
                <Breadcrumbs
                    breadcrumbs={[
                        { label: 'Profile', href: '/profile' },
                        { label: 'Settings', href: '/profile/settings', active: true },
                    ]}
                />
            </div>

            <div className="max-w-3xl mx-auto px-6 mt-12">
                {/* Header */}
                <div className="mb-12 border-l-2 border-zinc-900 dark:border-zinc-100 pl-6 py-2">
                    <h1 className={`${PlayWriteNewZealandFont.className} text-5xl md:text-6xl text-zinc-900 dark:text-zinc-100 mb-4 leading-tight`}>
                        Directives
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-lg font-light">
                        Configure how your cinematic log is broadcast to the world and define the boundaries of content you wish to consume.
                    </p>
                </div>

                {/* Form */}
                <SettingsForm profile={userData.profile} />
            </div>
        </main>
    );
}