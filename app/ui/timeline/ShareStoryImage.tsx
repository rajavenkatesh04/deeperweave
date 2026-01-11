import { type TimelineEntryWithUser } from "@/lib/definitions";

// Define base URL for local assets if needed
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : 'http://localhost:3000';

// --- Assets & Helpers ---

// Helper to ensure we have a valid image URL.
// If your DB stores paths (e.g. "/path.jpg"), this adds the TMDB prefix.
const getImageUrl = (pathOrUrl: string | null | undefined) => {
    if (!pathOrUrl) return null;
    if (pathOrUrl.startsWith('http')) return pathOrUrl;
    return `https://image.tmdb.org/t/p/original${pathOrUrl}`;
};

// SVG Components (Stars & Icons) - kept clean and minimal
const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill={filled ? "#fbbf24" : "none"} stroke={filled ? "#fbbf24" : "#52525b"} strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.518a.562.562 0 01.31.95l-4.225 3.09a.563.563 0 00-.175.545l1.618 5.39a.562.562 0 01-.815.61l-4.47-3.251a.563.563 0 00-.546 0L5.99 20.109a.562.562 0 01-.815-.61l1.618-5.39a.563.563 0 00-.175.545l-4.225-3.09a.562.562 0 01.31-.95h5.518a.563.563 0 00.475-.31l2.125-5.111z" />
    </svg>
);

const QuoteIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="#27272a" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.01697 21L5.01697 18C5.01697 16.8954 5.9124 16 7.01697 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.01697C5.46468 8 5.01697 8.44772 5.01697 9V11C5.01697 11.5523 4.56925 12 4.01697 12H3.01697V5H13.017V15C13.017 18.3137 10.3307 21 7.01697 21H5.01697Z" />
    </svg>
);

export default function ShareStoryImage({ entry }: { entry: TimelineEntryWithUser }) {
    // 1. Unify Item (Movie or Series)
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
    const rating = entry.rating || 0;
    const releaseYear = cinematicItem.release_date?.split('-')[0] || 'N/A';

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

            {/* 1. Backdrop Image at Top (Faded) */}
            {backdropUrl ? (
                <img
                    src={backdropUrl}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '1100px', // Covers top half
                        objectFit: 'cover',
                        opacity: 0.5,
                    }}
                />
            ) : (
                // Fallback: Use poster blurred if no backdrop
                <img
                    src={posterUrl || ''}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '1100px',
                        objectFit: 'cover',
                        filter: 'blur(40px)',
                        opacity: 0.3,
                    }}
                />
            )}

            {/* 2. Gradient Overlay (The "Fade" into dark) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '1200px',
                background: 'linear-gradient(to bottom, transparent 0%, #09090b 90%)',
            }} />


            {/* --- CONTENT LAYER --- */}
            <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: '80px',
            }}>

                {/* 1. User Header (Floating above) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: 'auto' }}>
                    {user.profile_pic_url && (
                        <img
                            src={user.profile_pic_url}
                            width="96"
                            height="96"
                            style={{ borderRadius: '50%', border: '4px solid #27272a' }}
                        />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                        <span style={{ fontSize: '32px', fontWeight: 700, color: '#fff' }}>{user.display_name}</span>
                        <span style={{ fontSize: '24px', color: '#a1a1aa' }}>@{user.username}</span>
                    </div>
                </div>

                {/* 2. Hero Section (Overlap Effect) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '60px', marginTop: '100px' }}>

                    {/* Media Row */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '60px' }}>

                        {/* Poster Card */}
                        <div style={{
                            display: 'flex',
                            width: '400px',
                            height: '600px',
                            backgroundColor: '#18181b',
                            borderRadius: '12px',
                            border: '4px solid #27272a', // Zinc-800 border
                            boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
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

                        {/* Title & Meta */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
                            {/* Rating Stars (Above title like a badge, or below) - Let's put above */}
                            {rating > 0 && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {starArray.map((isFilled, i) => (
                                        <StarIcon key={i} filled={isFilled} />
                                    ))}
                                </div>
                            )}

                            <h1 style={{
                                fontSize: '96px',
                                fontWeight: 300, // Light weight like SimpleDetailPage
                                lineHeight: '1',
                                letterSpacing: '-0.03em',
                                color: '#ffffff',
                                margin: 0,
                                textShadow: '0 4px 30px rgba(0,0,0,0.5)'
                            }}>
                                {cinematicItem.title}
                            </h1>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '12px' }}>
                                <span style={{ fontSize: '36px', fontWeight: 600, color: '#d4d4d8' }}>{releaseYear}</span>
                                {entry.viewing_context && (
                                    <span style={{ fontSize: '36px', color: '#52525b' }}>• Watched on {entry.viewing_context}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. Review / Notes Section */}
                    {entry.notes && (
                        <div style={{
                            display: 'flex',
                            position: 'relative',
                            paddingTop: '60px',
                            borderTop: '2px solid #27272a',
                            marginTop: '20px'
                        }}>
                            <div style={{ position: 'absolute', top: '40px', left: '-10px', opacity: 0.5 }}>
                                <QuoteIcon />
                            </div>
                            <p style={{
                                fontSize: '48px',
                                lineHeight: '1.4',
                                fontWeight: 400,
                                color: '#d4d4d8', // Zinc-300
                                margin: 0,
                                paddingLeft: '60px',
                                fontFamily: '"Inter", sans-serif', // Kept Inter for consistency, or change to Serif if preferred
                            }}>
                                {entry.notes}
                            </p>
                        </div>
                    )}

                </div>

                {/* 4. Footer */}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', paddingTop: '80px', opacity: 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Simple Logo Placeholder */}
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#fff', borderRadius: '8px' }} />
                        <span style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '0.05em' }}>DEEPERWEAVE.COM</span>
                    </div>
                </div>
            </div>
        </div>
    );
}