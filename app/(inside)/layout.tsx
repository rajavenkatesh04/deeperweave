import SideNav from '@/app/ui/SideBar/side-nav';
import { Suspense } from 'react';
import LoadingSpinner from '@/app/ui/loading-spinner';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <aside className="w-full flex-none md:w-64">
                {/* Suspense shows a loading spinner while the server component fetches data */}
                <Suspense fallback={
                    <div className="flex h-full w-full items-center justify-center bg-white dark:bg-zinc-950">
                        <LoadingSpinner />
                    </div>
                }>
                    <SideNav />
                </Suspense>
            </aside>
            <main className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</main>
        </div>
    );
}
