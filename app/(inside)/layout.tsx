import Navigation from "@/app/ui/SideBar/Navigation";
import '@/components/tiptap-templates/simple/simple-editor.scss';

export default function Layout({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-zinc-50 dark:bg-zinc-950">

            {/* SIDEBAR WRAPPER / SPACER
                - Changed from 'md:w-72' to 'md:w-20'
                - This acts as a "Ghost" spacer. It reserves the 80px rail space
                  so your content doesn't hide behind the fixed sidebar.
            */}
            <div className="w-full flex-none md:w-20">
                <Navigation />
            </div>

            {/* MAIN CONTENT AREA
                - Now occupies all space minus the 20 units reserved above.
            */}
            <div className="flex-grow md:overflow-y-auto pb-20 md:pb-0">
                {children}
            </div>

        </div>
    );
}