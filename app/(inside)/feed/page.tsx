import Breadcrumbs from "@/app/ui/Breadcrumbs";
import Navbar from "@/app/ui/Navbar";

export default function Page() {
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    {
                        label: 'Feed',
                        href: '/feed',
                        active: true,
                    },
                ]}
            />
            <div className="mt-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Feed</h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-400">Posts from people you love.</p>
            </div>
        </main>
    )
}