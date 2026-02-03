import Link from 'next/link';
import Image from 'next/image';

export default function ExploreHero() {
    const featured = {
        title: "The 2026 Awards Season",
        subtitle: "FROM: The House of Deeperweave",
        description: "Explore the nominees, the snubs, and the winners that defined the year in cinema.",
        href: "/discover/lists/awards-2024"
    };

    return (
        <div className="relative w-full max-h-max pt-6 flex items-end overflow-hidden group">
            {/* Background Layer */}
            <div className="absolute inset-0 bg-black">
                <Image
                    src="https://i.headtopics.com/images/2026/1/22/glamourmaguk/oscars-2026-how-to-watch-every-film-nominated-for--oscars-2026-how-to-watch-every-film-nominated-for--EF644DB992287267C8854E33AB81EA48.webp?w=640"
                    alt="Oscars 2026"
                    fill
                    className="object-cover opacity-60"
                />                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 w-full px-6 md:px-16 pb-12 md:pb-24 max-w-7xl mx-auto flex flex-col items-start gap-4 md:gap-6">

                {/* Responsive Badge (Old Style, Premium Finish) */}
                <span className="inline-block px-3 py-1 mb-4 border border-white/30 text-[10px] font-bold uppercase tracking-widest text-white/80 backdrop-blur-md rounded-full">
                    {featured.subtitle}
                </span>

                {/* Hero Title */}
                <h1 className="text-5xl md:text-8xl font-thin text-white tracking-tight leading-[0.9] max-w-4xl mix-blend-difference">
                    The 2026 <br />
                    <span className="font-serif italic text-[#F4DFC8]">Awards Season</span>
                </h1>

                {/* Description */}
                <p className="text-zinc-400 font-light text-sm md:text-lg max-w-lg leading-relaxed tracking-wide border-l border-white/10 pl-4 md:pl-6 my-2 md:my-4">
                    {featured.description}
                </p>

                {/* Premium CTA Button */}
                <Link
                    href={featured.href}
                    className="group/btn relative inline-flex items-center gap-4 px-6 py-3 md:px-8 md:py-4 overflow-hidden border border-[#D4AF37]/30 bg-black/20 backdrop-blur-sm transition-all duration-500 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
                >
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] transition-all duration-500 group-hover/btn:text-white group-hover/btn:tracking-[0.3em]">
                        View Collection
                    </span>
                    <span className="absolute right-0 top-0 h-[1px] w-0 bg-[#D4AF37] transition-all duration-500 group-hover/btn:w-full"></span>
                    <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#D4AF37] transition-all duration-500 group-hover/btn:w-full"></span>
                </Link>
            </div>
        </div>
    );
}