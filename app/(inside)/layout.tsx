import Navigation from "@/app/ui/SideBar/Navigation";
import '@/components/tiptap-templates/simple/simple-editor.scss';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        // Main container
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-zinc-50 dark:bg-zinc-950">

            {/* SIDEBAR NAVIGATION
                - fixed: Sticks it to the viewport so it doesn't scroll.
                - z-50: Ensures it sits on top of all other content layers.
                - h-full: Full height on desktop.
                - w-full md:w-auto: Responsive width (usually full width on mobile bottom nav, auto on desktop).
            */}
            <div className="fixed z-50 bottom-0 w-full md:relative md:w-20 md:h-full">
                <Navigation />
            </div>

            {/* MAIN CONTENT AREA
                - md:pl-20: Adds left padding equal to the sidebar width so content isn't hidden behind it.
            */}
            <div className="flex-grow md:overflow-y-auto pb-20 md:pb-0">
                {children}
            </div>

        </div>
    );
}