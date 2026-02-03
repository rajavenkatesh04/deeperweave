import { type TimelineEntryWithUser } from "@/lib/definitions";

// Define base URL for local assets
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env["NEXT_PUBLIC_BASE_URL"]
    : 'http://localhost:3000';

// --- Helpers ---

const getImageUrl = (pathOrUrl: string | null | undefined) => {
    if (!pathOrUrl) return null;
    if (pathOrUrl.startsWith('http')) return pathOrUrl;
    return `https://image.tmdb.org/t/p/original${pathOrUrl}`;
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

// --- Icons ---

const SharpStarIcon = ({ filled }: { filled: boolean }) => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill={filled ? "#ffffff" : "none"}
            stroke={filled ? "#ffffff" : "#52525b"}
            strokeWidth="1.5"
            strokeLinejoin="miter"
        />
    </svg>
);

const ottPlatformDetails: { [key: string]: { logo: string; } } = {
    'Netflix': { logo: '/logos/netflix.svg' },
    'Prime Video': { logo: '/logos/prime-video.svg' },
    'Disney+': { logo: '/logos/disney-plus.svg' },
    'Hulu': { logo: '/logos/hulu.svg' },
    'Max': { logo: '/logos/max.svg' },
    'Apple TV+': { logo: '/logos/apple-tv.svg' },
};

export default function SharePosterImage({ entry }: { entry: TimelineEntryWithUser }) {
    const cinematicItem = entry.movies || entry.series;

    if (!cinematicItem) {
        return (
            <div style={{ display: 'flex', width: 1080, height: 1920, backgroundColor: '#09090b', color: 'white', alignItems: 'center', justifyContent: 'center' }}>
                <h1>Media Not Found</h1>
            </div>
        );
    }

    // Data
    const backdropUrl = getImageUrl(cinematicItem.backdrop_url);
    const posterUrl = getImageUrl(cinematicItem.poster_url);
    const user = entry.profiles;
    const rating = Number(entry.rating) || 0;
    const releaseYear = cinematicItem.release_date?.split('-')[0] || 'N/A';
    const watchedDate = formatDate(entry.watched_on);
    const context = entry.viewing_context;

    // Stars
    const starArray = Array.from({ length: 5 }, (_, i) => i < Math.round(rating));

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            color: '#ffffff',
            fontFamily: '"Inter", sans-serif',
            position: 'relative',
            alignItems: 'center',
        }}>

            {/* --- 1. BACKDROP HEADER LAYER (Top 45%) --- */}
            <div style={{
                display: 'flex',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '920px',
            }}>
                {backdropUrl ? (
                    <img
                        src={backdropUrl}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'top center',
                            opacity: 0.8,
                        }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, #27272a, #000)' }} />
                )}

                {/* Fade Out Gradient */}
                <div style={{
                    display: 'flex',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '400px',
                    background: 'linear-gradient(to bottom, transparent 0%, #000000 100%)',
                }} />

                {/* Top Darkener */}
                <div style={{
                    display: 'flex',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '300px',
                    background: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.6) 100%)',
                }} />
            </div>

            {/* --- 2. CONTENT LAYER --- */}
            <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                padding: '80px',
                alignItems: 'center',
            }}>

                {/* User Info (ID Only) */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    marginTop: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    padding: '12px 28px',
                    borderRadius: '100px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)'
                }}>
                    {user.profile_pic_url && (
                        <img
                            src={user.profile_pic_url}
                            width="56"
                            height="56"
                            style={{ borderRadius: '50%' }}
                        />
                    )}
                    {/* ✅ Just the User ID (Username) */}
                    <span style={{ fontSize: '26px', fontWeight: 600, color: '#e4e4e7' }}>
                        @{user.username}
                    </span>
                </div>

                {/* Main Content Group */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '240px',
                    width: '100%',
                }}>

                    {/* POSTER */}
                    <div style={{
                        display: 'flex',
                        position: 'relative',
                        marginBottom: '60px',
                    }}>
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            boxShadow: '0 30px 80px -10px rgba(0,0,0,1)',
                            borderRadius: '16px',
                        }} />

                        <img
                            src={posterUrl || ''}
                            width="500"
                            height="750"
                            style={{
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.15)',
                                objectFit: 'cover',
                                zIndex: 10
                            }}
                        />
                    </div>

                    {/* TEXT DETAILS */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>

                        {/* Title */}
                        <h1 style={{
                            fontSize: '80px',
                            fontWeight: 700,
                            textAlign: 'center',
                            lineHeight: '1.1',
                            letterSpacing: '-0.02em',
                            color: '#ffffff',
                            margin: 0,
                            maxWidth: '900px'
                        }}>
                            {cinematicItem.title}
                        </h1>

                        {/* Year */}
                        <span style={{ fontSize: '36px', color: '#71717a', fontWeight: 500 }}>
                            {releaseYear}
                        </span>

                        {/* Rating + Number */}
                        {rating > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                                {/* Stars */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {starArray.map((isFilled, i) => (
                                        <SharpStarIcon key={i} filled={isFilled} />
                                    ))}
                                </div>
                                {/* ✅ Rating Number */}
                                <span style={{ fontSize: '40px', fontWeight: 700, color: '#e4e4e7' }}>
                                    {rating.toFixed(1)}
                                </span>
                            </div>
                        )}

                        {/* Context Pill */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            marginTop: '40px',
                            padding: '16px 32px',
                            backgroundColor: '#18181b',
                            borderRadius: '12px',
                            border: '1px solid #27272a'
                        }}>
                            {context && ottPlatformDetails[context] && (
                                <img
                                    src={`${baseUrl}${ottPlatformDetails[context].logo}`}
                                    width="32"
                                    height="32"
                                    style={{ objectFit: 'contain', filter: context === 'Apple TV+' ? 'invert(1)' : 'none' }}
                                />
                            )}
                            <span style={{ fontSize: '28px', color: '#d4d4d8', fontWeight: 500 }}>
                                Watched on {watchedDate}
                            </span>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div style={{ marginTop: 'auto', display: 'flex', paddingBottom: '20px', opacity: 0.3 }}>
                    <span style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                        deeperweave.com
                    </span>
                </div>

            </div>
        </div>
    );
}