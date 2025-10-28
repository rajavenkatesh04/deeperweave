// Import the correct type from your data file
import { type TimelineEntryWithUser } from '@/lib/data/timeline-data';

// --- SVG Star Components (Slightly larger) ---
const FullStar = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.518a.562.562 0 01.31.95l-4.225 3.09a.563.563 0 00-.175.545l1.618 5.39a.562.562 0 01-.815.61l-4.47-3.251a.563.563 0 00-.546 0L5.99 20.109a.562.562 0 01-.815-.61l1.618-5.39a.563.563 0 00-.175.545l-4.225-3.09a.562.562 0 01.31-.95h5.518a.563.563 0 00.475-.31l2.125-5.111z" />
    </svg>
);
const HalfStar = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="#3f3f46" stroke="#fbbf24" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.518a.562.562 0 01.31.95l-4.225 3.09a.563.563 0 00-.175.545l1.618 5.39a.562.562 0 01-.815.61l-4.47-3.251a.563.563 0 00-.546 0L5.99 20.109a.562.562 0 01-.815-.61l1.618-5.39a.563.563 0 00-.175.545l-4.225-3.09a.562.562 0 01.31-.95h5.518a.563.563 0 00.475-.31l2.125-5.111z" />
        <path fill="#fbbf24" stroke="#fbbf24" strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 01.52.002L14.125 8.61a.563.563 0 00.475.31h5.518a.562.562 0 01.31.95l-4.225 3.09a.563.563 0 00-.175.545l1.618 5.39a.562.562 0 01-.815.61l-4.47-3.251a.563.563 0 00-.546 0v-18.1z" />
    </svg>
);
const OutlineStar = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.518a.562.562 0 01.31.95l-4.225 3.09a.563.563 0 00-.175.545l1.618 5.39a.562.562 0 01-.815.61l-4.47-3.251a.563.563 0 00-.546 0L5.99 20.109a.562.562 0 01-.815-.61l1.618-5.39a.563.563 0 00-.175.545l-4.225-3.09a.562.562 0 01.31-.95h5.518a.563.563 0 00.475-.31l2.125-5.111z" />
    </svg>
);


export default function ShareStoryImage({ entry }: { entry: TimelineEntryWithUser }) {
    const rating = Number(entry.rating);
    const notes = entry.notes || '';
    const releaseYear = entry.movies.release_date?.split('-')[0];
    const username = entry.username;
    const displayName = entry.display_name || username;
    const profilePicUrl = entry.profile_pic_url;

    // Create an array for the star rating
    const stars: React.ReactNode[] = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars.push(<FullStar key={`star-full-${i}`} />);
        } else if (rating >= i - 0.5) {
            stars.push(<HalfStar key={`star-half-${i}`} />);
        } else {
            stars.push(<OutlineStar key={`star-outline-${i}`} />);
        }
    }

    // Watched date formatting
    const watchedDate = new Date(entry.watched_on).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: 1080, // 9:16 aspect ratio
            height: 1920,
            position: 'relative',
            color: 'white',
            backgroundColor: '#0a0a0a',
            fontFamily: '"Inter", "Helvetica", sans-serif'
        }}>
            {/* 1. Cinematic Background */}
            {entry.movies.poster_url && (
                <img
                    src={entry.movies.poster_url}
                    alt="Background"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'blur(24px) brightness(0.4) saturate(1.2)',
                        opacity: 0.6
                    }}
                />
            )}
            {/* 2. Gradient Overlay for Readability */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(10, 10, 10, 0.95) 0%, rgba(10, 10, 10, 0.7) 30%, transparent 60%)'
            }} />

            {/* 3. Main Content (on top of background) */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}>

                {/* 3.1. Main Poster */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: '120px', // Space from top
                    paddingBottom: '60px',
                    flexShrink: 0
                }}>
                    {entry.movies.poster_url && (
                        <img
                            src={entry.movies.poster_url}
                            alt={entry.movies.title}
                            width={600}
                            height={900}
                            style={{
                                borderRadius: '20px',
                                boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8)',
                                border: '2px solid rgba(255, 255, 255, 0.1)'
                            }}
                        />
                    )}
                </div>

                {/* 3.2. Review Content (Takes remaining space) */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1, // Key property to fill remaining space
                    padding: '0 80px 80px 80px',
                    justifyContent: 'space-between' // Pushes content apart
                }}>

                    {/* Top block: Title, Rating, Notes */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Title & Year */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '16px',
                            marginBottom: '24px',
                        }}>
                            <span style={{
                                fontSize: '84px',
                                fontWeight: 800,
                                // Use an elegant serif font for a "cinematic" title
                                fontFamily: '"Playfair Display", "Georgia", serif',
                                lineHeight: 1.1,
                                color: 'white',
                                textShadow: '0 4px 15px rgba(0,0,0,0.5)'
                            }}>
                                {entry.movies.title}
                            </span>
                            <span style={{
                                fontSize: '40px',
                                fontWeight: 500,
                                color: '#a1a1aa',
                                flexShrink: 0
                            }}>
                                ({releaseYear})
                            </span>
                        </div>

                        {/* Rating */}
                        {rating > 0 && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '40px'
                            }}>
                                {stars}
                                <span style={{
                                    fontSize: '36px',
                                    fontWeight: 700,
                                    color: '#fbbf24',
                                    marginLeft: '12px'
                                }}>
                                    {rating.toFixed(1)}
                                </span>
                            </div>
                        )}

                        {/* Notes */}
                        {notes && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                borderLeft: '4px solid #f43f5e', // Use brand accent color
                                paddingLeft: '24px',
                                marginTop: '16px'
                            }}>
                                <p style={{
                                    fontSize: '34px',
                                    color: '#e4e4e7',
                                    lineHeight: 1.6,
                                    fontStyle: 'italic',
                                    margin: 0,
                                    // For long notes, truncate gracefully
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 6, // Show max 6 lines
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                    &ldquo;{notes}&rdquo;
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Bottom block: User & Branding */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* User Info */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            marginBottom: '32px'
                        }}>
                            {profilePicUrl && (
                                <img
                                    src={profilePicUrl}
                                    alt={displayName}
                                    width={72}
                                    height={72}
                                    style={{
                                        borderRadius: '50%',
                                        border: '3px solid #3f3f46'
                                    }}
                                />
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>
                                    {displayName}
                                </span>
                                <span style={{ fontSize: '28px', color: '#a1a1aa' }}>
                                    @{username}
                                </span>
                            </div>
                        </div>

                        {/* Date & Branding */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid #3f3f46', // Faint separator line
                            paddingTop: '24px'
                        }}>
                            <span style={{
                                fontSize: '26px',
                                color: '#71717a',
                                fontWeight: 500
                            }}>
                                Watched on {watchedDate}
                            </span>
                            <span style={{
                                fontSize: '32px',
                                fontWeight: 800,
                                color: '#f43f5e'
                            }}>
                                deeperweave.com
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}