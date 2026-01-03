import Navigation from "@/app/ui/SideBar/Navigation";
import '@/components/tiptap-templates/simple/simple-editor.scss';

export default function Layout({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-zinc-50 dark:bg-zinc-950">

            {/* SIDEBAR WRAPPER
                - Updated width to 'md:w-72' to match the new Navigation component exactly.
                - 'flex-none' ensures it doesn't shrink.
            */}
            <div className="w-full flex-none md:w-72">
                <Navigation />
            </div>

            {/* MAIN CONTENT AREA
                - 'flex-grow': Fills remaining space.
                - 'md:overflow-y-auto': Allows independent scrolling of content (sidebar stays fixed).
                - 'pb-20': Adds padding on mobile so the bottom navigation bar doesn't cover content.
                - 'md:pb-0': Removes that padding on desktop since the bottom bar is gone.
            */}
            <div className="flex-grow md:overflow-y-auto pb-20 md:pb-0">
                {children}
            </div>

        </div>
    );
}