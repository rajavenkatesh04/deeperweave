import CinematicLoader from '@/app/ui/CinematicLoader';

export default function Loading() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">

            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                {/* Subtle Noise Texture */}
                <div className="absolute inset-0 opacity-[0.03]"
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />

                {/* Central Spotlight */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />
            </div>

            {/* The Loader Component */}
            <CinematicLoader />
        </div>
    );
}