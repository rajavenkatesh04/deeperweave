import { Metadata } from 'next';
// 1. Import the new unified Navigation component
import Navigation from "@/app/ui/SideBar/Navigation";
import '@/components/tiptap-templates/simple/simple-editor.scss';

export const metadata: Metadata = {
    title: 'Liv',
};

export default function Layout({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">


            {/* This container holds the sidebar on desktop.
              On mobile, its content (the bottom bar) is fixed, so this div's width doesn't matter.
              The md:w-20 lg:w-64 classes match the widths set in our Navigation component.
            */}
            <div className="w-full flex-none md:w-20 lg:w-64">
                {/* 2. Use the new Navigation component */}
                <Navigation />
            </div>

            {/* 3. KEY CHANGE: Add bottom padding for mobile (`pb-20`)
              This prevents the fixed bottom navigation bar from hiding the content.
              On desktop screens (`md:`), the `md:p-12` overrides this, so there's no extra padding.
            */}
            <div className="flex-grow  pb-20 md:overflow-y-auto md:p-12">
                {children}
            </div>
        </div>
    );
}