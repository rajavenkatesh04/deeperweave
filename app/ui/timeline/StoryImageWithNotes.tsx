import { type TimelineEntryWithUser } from "@/lib/definitions";

// Define base URL for local assets
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : 'http://localhost:3000';

// --- Helpers ---

const getImageUrl = (pathOrUrl: string | null | undefined) => {
    if (!pathOrUrl) return null;
    if (pathOrUrl.startsWith('http')) return pathOrUrl;
    return `https://image.tmdb.org/t/p/original${pathOrUrl}`;
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

// --- SVG Icons ---

// Sharp, Monotone Star
const SharpStarIcon = ({ filled }: { filled: boolean }) => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill={filled ? "#e4e4e7" : "none"} // Zinc-200 if filled
            stroke={filled ? "#e4e4e7" : "#52525b"} // Zinc-600 border if empty
            strokeWidth="1.5"
            strokeLinejoin="miter" // Sharp corners
        />
    </svg>
);

const TheatreIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e4e4e7" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M2 10s3-3 3-8"></path>
        <path d="M22 10s-3-3-3-8"></path>
        <path d="M10 2h4"></path>
        <path d="M2 22h20"></path>
        <path d="M12 22V12"></path>
        <rect x="2" y="10" width="20" height="12"></rect>
    </svg>
);

// Platform Mapping
const ottPlatformDetails: { [key: string]: { logo: string; } } = {
    'Netflix': { logo: '/logos/netflix.svg' },
    'Prime Video': { logo: '/logos/prime-video.svg' },
    'Disney+': { logo: '/logos/disney-plus.svg' },
    'Hulu': { logo: '/logos/hulu.svg' },
    'Max': { logo: '/logos/max.svg' },
    'Apple TV+': { logo: '/logos/apple-tv.svg' },
};

export default function StoryImageWithNotes({ entry }: { entry: TimelineEntryWithUser }) {
    // 1. Unify Item
    const cinematicItem = entry.movies || entry.series;

    if (!cinematicItem) {
        return (
            <div style={{ display: 'flex', width: 1080, height: 1920, backgroundColor: '#09090b', color: 'white', alignItems: 'center', justifyContent: 'center' }}>
                <h1>Media Not Found</h1>
            </div>
        );
    }

    // 2. Data Preparation
    const backdropUrl = getImageUrl(cinematicItem.backdrop_url);
    const posterUrl = getImageUrl(cinematicItem.poster_url);
    const user = entry.profiles;
    const rating = Number(entry.rating) || 0;
    const releaseYear = cinematicItem.release_date?.split('-')[0] || 'N/A';
    const watchedDate = formatDate(entry.watched_on);
    const collaborators = entry.timeline_collaborators?.map(c => c.profiles) || [];

    // Context Logic
    const context = entry.viewing_context;
    let ContextIcon = null;

    // Default label if no context is provided
    let contextLabel = `Watched on ${watchedDate}`;

    if (context) {
        // If context exists, combine it: "Netflix • Jan 12, 2024"
        contextLabel = `${context} • ${watchedDate}`;

        if (context === 'Theatre') {
            ContextIcon = <TheatreIcon />;
        } else if (ottPlatformDetails[context]) {
            const logoPath = ottPlatformDetails[context].logo;
            ContextIcon = (
                <img
                    src={`${baseUrl}${logoPath}`}
                    width="28"
                    height="28"
                    style={{ objectFit: 'contain', filter: context === 'Apple TV+' ? 'invert(1)' : 'none' }}
                />
            );
        }
    }

    // Generate Stars
    const starArray = Array.from({ length: 5 }, (_, i) => i < Math.round(rating));

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#09090b', // Zinc-950
            color: '#fafafa', // Zinc-50
            fontFamily: '"Inter", sans-serif',
            position: 'relative',
        }}>

            {/* --- BACKGROUND LAYER --- */}
            {backdropUrl ? (
                <img
                    src={backdropUrl}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '1100px',
                        objectFit: 'cover',
                        opacity: 0.35, // Slightly lower opacity for better text contrast
                    }}
                />
            ) : (
                <img
                    src={posterUrl || ''}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '1100px',
                        objectFit: 'cover',
                        filter: 'blur(50px)',
                        opacity: 0.2,
                    }}
                />
            )}

            {/* Gradient Overlay */}
            <div style={{
                display: 'flex',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '1200px',
                background: 'linear-gradient(to bottom, transparent 0%, #09090b 95%)',
            }} />

            {/* --- CONTENT LAYER --- */}
            <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: '80px',
            }}>

                {/* 1. Header: User Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: 'auto' }}>
                    {user.profile_pic_url && (
                        <img
                            src={user.profile_pic_url}
                            width="96"
                            height="96"
                            style={{ borderRadius: '50%', border: '4px solid #27272a' }}
                        />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '32px', fontWeight: 700, color: '#fff' }}>{user.display_name}</span>
                        <span style={{ fontSize: '24px', color: '#a1a1aa' }}>@{user.username}</span>
                    </div>
                </div>

                {/* 2. Main Hero: Poster + Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '60px', marginTop: '120px' }}>

                    {/* Horizontal Layout */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '60px' }}>

                        {/* Poster */}
                        <div style={{
                            display: 'flex',
                            width: '380px',
                            height: '570px',
                            backgroundColor: '#18181b',
                            borderRadius: '8px', // Slightly sharper radius
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
                            overflow: 'hidden',
                            position: 'relative',
                            flexShrink: 0,
                        }}>
                            {posterUrl ? (
                                <img src={posterUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b' }}>No Poster</div>
                            )}
                        </div>

                        {/* Text Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, paddingBottom: '10px' }}>

                            {/* Title & Year Group */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <h1 style={{
                                    fontSize: '88px',
                                    fontWeight: 300, // Light weight
                                    lineHeight: '1',
                                    letterSpacing: '-0.03em',
                                    color: '#ffffff',
                                    margin: 0,
                                    textShadow: '0 4px 30px rgba(0,0,0,0.5)'
                                }}>
                                    {cinematicItem.title}
                                </h1>
                                <span style={{ fontSize: '32px', fontWeight: 500, color: '#a1a1aa' }}>{releaseYear}</span>
                            </div>

                            {/* Stars Row (Sharp & Monotone) */}
                            {rating > 0 && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    {starArray.map((isFilled, i) => (
                                        <SharpStarIcon key={i} filled={isFilled} />
                                    ))}
                                </div>
                            )}

                            {/* Context & Date Pill (Separated from Title area) */}
                            <div style={{ display: 'flex', marginTop: '24px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '16px 28px',
                                    backgroundColor: 'rgba(39, 39, 42, 0.4)', // Glassy Zinc
                                    borderRadius: '100px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    {ContextIcon}
                                    <span style={{ fontSize: '28px', fontWeight: 500, color: '#e4e4e7' }}>
                                        {contextLabel}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* 3. Watched With */}
                    {collaborators.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px' }}>
                            <span style={{ fontSize: '20px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#71717a' }}>Watched With</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                {collaborators.map((friend, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        {friend.profile_pic_url ? (
                                            <img src={friend.profile_pic_url} width="56" height="56" style={{ borderRadius: '50%', border: '2px solid #52525b' }} />
                                        ) : (
                                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#27272a', border: '2px solid #52525b' }} />
                                        )}
                                        <span style={{ fontSize: '28px', color: '#e4e4e7' }}>{friend.username}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. Notes */}
                    {entry.notes && (
                        <div style={{ display: 'flex', flexDirection: 'column', marginTop: collaborators.length > 0 ? '20px' : '40px' }}>
                            <p style={{
                                fontSize: '48px',
                                lineHeight: '1.4',
                                fontWeight: 300,
                                color: '#d4d4d8',
                                margin: 0,
                                fontStyle: 'italic',
                                fontFamily: '"Inter", sans-serif',
                            }}>
                                "{entry.notes}"
                            </p>
                        </div>
                    )}

                </div>

                {/* 5. Footer */}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', paddingTop: '60px', opacity: 0.4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Brand Icon (Simple box placeholder or your logo) */}
                        <div style={{ display: 'flex', width: '28px', height: '28px', backgroundColor: '#e4e4e7', borderRadius: '4px' }} />
                        <span style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '0.05em', color: '#e4e4e7' }}>deeperweave.com</span>
                    </div>
                </div>
            </div>
        </div>
    );
}