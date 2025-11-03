// Import the correct type from your data file
import { type TimelineEntryWithUser } from "@/lib/definitions";

// ✅ FIX: Define the base URL for absolute paths
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : 'http://localhost:3000';

// --- SVG Star Components ---
const FullStar = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="#d4af37" stroke="#d4af37" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.518a.562.562 0 01.31.95l-4.225 3.09a.563.563 0 00-.175.545l1.618 5.39a.562.562 0 01-.815.61l-4.47-3.251a.563.563 0 00-.546 0L5.99 20.109a.562.562 0 01-.815-.61l1.618-5.39a.563.563 0 00-.175.545l-4.225-3.09a.562.562 0 01.31-.95h5.518a.563.563 0 00.475-.31l2.125-5.111z" />
    </svg>
);

const HalfStar = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="#27272a" stroke="#d4af37" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.518a.562.562 0 01.31.95l-4.225 3.09a.563.563 0 00-.175.545l1.618 5.39a.562.562 0 01-.815.61l-4.47-3.251a.563.563 0 00-.546 0L5.99 20.109a.562.562 0 01-.815-.61l1.618-5.39a.563.563 0 00-.175.545l-4.225-3.09a.562.562 0 01.31-.95h5.518a.563.563 0 00.475-.31l2.125-5.111z" />
        <path fill="#d4af37" stroke="#d4af37" strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 01.52.002L14.125 8.61a.563.563 0 00.475.31h5.518a.562.562 0 01.31.95l-4.225 3.09a.563.563 0 00-.175.545l1.618 5.39a.562.562 0 01-.815.61l-4.47-3.251a.563.563 0 00-.546 0v-18.1z" />
    </svg>
);

const OutlineStar = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.518a.562.562 0 01.31.95l-4.225 3.09a.563.563 0 00-.175.545l1.618 5.39a.562.562 0 01-.815.61l-4.47-3.251a.563.563 0 00-.546 0L5.99 20.109a.562.562 0 01-.815-.61l1.618-5.39a.563.563 0 00-.175.545l-4.225-3.09a.562.562 0 01.31-.95h5.518a.563.563 0 00.475-.31l2.125-5.111z" />
    </svg>
);

// --- SVG Icons for Context ---
const TheatreIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/>
        <line x1="2" y1="20" x2="2.01" y2="20"/>
    </svg>
);

const TVIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
        <polyline points="17 2 12 7 7 2"></polyline>
    </svg>
);

// --- Platform Details ---
const ottPlatformDetails: { [key: string]: { logo: string; } } = {
    'Netflix': { logo: '/logos/netflix.svg' },
    'Prime Video': { logo: '/logos/prime-video.svg' },
    'Disney+': { logo: '/logos/disney-plus.svg' },
    'Hulu': { logo: '/logos/hulu.svg' },
    'Max': { logo: '/logos/max.svg' },
    'Apple TV+': { logo: '/logos/apple-tv.svg' },
    'Other': { logo: '' },
};

// --- Helper for Viewing Context ---
const ViewingContext = ({ context }: { context: string | null }) => {
    if (!context) return null;

    const platform = context in ottPlatformDetails ? ottPlatformDetails[context] : null;
    const isTheatre = context === 'Theatre';
    const preposition = isTheatre ? 'in' : 'on';

    let icon: React.ReactNode;
    const text = context;

    if (isTheatre) {
        icon = <TheatreIcon />;
    } else if (platform && platform.logo) {
        icon = (
            <img
                src={`${baseUrl}${platform.logo}`}
                alt={context}
                width={32}
                height={32}
                style={{
                    filter: context === 'Apple TV+' ? 'invert(1)' : 'none',
                    objectFit: 'contain'
                }}
            />
        );
    } else {
        icon = <TVIcon />;
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icon}
            <span style={{
                fontSize: '28px',
                fontWeight: 400,
                color: '#d4d4d8',
                fontFamily: '"Cormorant Garamond", "Georgia", serif',
                letterSpacing: '0.01em'
            }}>
                Watched {preposition} {text}
            </span>
        </div>
    );
};

export default function ShareStoryImage({ entry }: { entry: TimelineEntryWithUser }) {
    const rating = Number(entry.rating);
    const notes = entry.notes || '';
    const releaseYear = entry.movies.release_date?.split('-')[0];

    const username = entry.profiles.username;
    const displayName = entry.profiles.display_name || username;
    const profilePicUrl = entry.profiles.profile_pic_url;

    const viewingContext = entry.viewing_context;
    const collaborators = entry.timeline_collaborators?.filter(c => c.profiles) || [];

    // Create star rating array
    const stars: React.ReactNode[] = [];
    if (rating > 0) {
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) {
                stars.push(<FullStar key={`star-full-${i}`} />);
            } else if (rating >= i - 0.5) {
                stars.push(<HalfStar key={`star-half-${i}`} />);
            } else {
                stars.push(<OutlineStar key={`star-outline-${i}`} />);
            }
        }
    }

    const watchedDate = new Date(entry.watched_on).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
    });

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: 1080,
            height: 1920,
            position: 'relative',
            color: 'white',
            backgroundColor: '#0a0a0a',
            fontFamily: '"Cormorant Garamond", "Georgia", serif'
        }}>
            {/* Cinematic Background */}
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
                        filter: 'blur(28px) brightness(0.22) saturate(1.3)',
                        opacity: 0.7,
                        transform: 'scale(1.2)'
                    }}
                />
            )}

            {/* Refined Gradient Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, #000000 0%, rgba(0, 0, 0, 0.92) 25%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.3) 75%, transparent 90%)',
                zIndex: 1
            }} />

            {/* Main Content Container */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}>
                {/* Content Area (everything except footer) */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    padding: '180px 80px 0 80px',
                    minHeight: 0
                }}>
                    {/* Top Section: User Info */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        marginBottom: '80px',
                        flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                            {profilePicUrl && (
                                <img
                                    src={profilePicUrl}
                                    alt={displayName}
                                    width={64}
                                    height={64}
                                    style={{
                                        borderRadius: '50%',
                                        border: '2px solid rgba(255, 255, 255, 0.12)',
                                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                                    }}
                                />
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{
                                    fontSize: '32px',
                                    fontWeight: 600,
                                    color: '#fafafa',
                                    letterSpacing: '-0.01em',
                                    fontFamily: '"Cormorant Garamond", "Georgia", serif'
                                }}>
                                    {displayName}
                                </span>
                                <span style={{
                                    fontSize: '24px',
                                    color: '#a1a1aa',
                                    fontWeight: 400,
                                    fontFamily: '"Inter", "Helvetica", sans-serif'
                                }}>
                                    @{username}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Section */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        justifyContent: 'flex-end',
                        minHeight: 0,
                        paddingBottom: '60px'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-end',
                            gap: '56px',
                        }}>
                            {/* Poster */}
                            <div style={{ flexShrink: 0, display: 'flex' }}>
                                {entry.movies.poster_url && (
                                    <img
                                        src={entry.movies.poster_url}
                                        alt={entry.movies.title}
                                        width={420}
                                        height={630}
                                        style={{
                                            borderRadius: '8px',
                                            boxShadow: '0 24px 64px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)',
                                        }}
                                    />
                                )}
                            </div>

                            {/* Review Content */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                minWidth: 0,
                                flex: 1,
                                paddingBottom: '16px'
                            }}>
                                {/* Title */}
                                <h1 style={{
                                    fontSize: '82px',
                                    fontWeight: 500,
                                    fontFamily: '"Cormorant Garamond", "Georgia", serif',
                                    lineHeight: 1,
                                    color: '#fafafa',
                                    textShadow: '0 2px 24px rgba(0,0,0,0.6)',
                                    marginBottom: '16px',
                                    letterSpacing: '-0.015em',
                                    margin: 0
                                }}>
                                    {entry.movies.title}
                                </h1>

                                {/* Year */}
                                <span style={{
                                    fontSize: '34px',
                                    fontWeight: 400,
                                    color: '#a8a8a8',
                                    marginBottom: '44px',
                                    letterSpacing: '0.02em'
                                }}>
                                    {releaseYear}
                                </span>

                                {/* Rating */}
                                {rating > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginBottom: '44px'
                                    }}>
                                        {stars}
                                        <span style={{
                                            fontSize: '34px',
                                            fontWeight: 500,
                                            color: '#d4af37',
                                            marginLeft: '14px',
                                            lineHeight: 1,
                                            fontFamily: '"Inter", "Helvetica", sans-serif'
                                        }}>
                                            {rating.toFixed(1)}
                                        </span>
                                    </div>
                                )}

                                {/* Watched Date & Context */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    paddingLeft: '0',
                                }}>
                                    <span style={{
                                        fontSize: '28px',
                                        color: '#d4d4d8',
                                        fontWeight: 400,
                                        letterSpacing: '0.01em'
                                    }}>
                                        {watchedDate}
                                    </span>
                                    <ViewingContext context={viewingContext} />
                                </div>
                            </div>
                        </div>

                        {/* Watched With Section */}
                        {collaborators.length > 0 && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '18px',
                                marginTop: '56px',
                                padding: '24px 28px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}>
                                <span style={{
                                    fontSize: '22px',
                                    fontWeight: 500,
                                    color: '#a8a8a8',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                    fontFamily: '"Inter", "Helvetica", sans-serif'
                                }}>
                                    Watched With
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                    {collaborators.map((collab, index) => (
                                        <div key={collab.profiles.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {collab.profiles.profile_pic_url && (
                                                <img
                                                    src={collab.profiles.profile_pic_url}
                                                    alt={collab.profiles.username}
                                                    width={48}
                                                    height={48}
                                                    style={{
                                                        borderRadius: '50%',
                                                        border: '2px solid rgba(255, 255, 255, 0.2)'
                                                    }}
                                                />
                                            )}
                                            <span style={{
                                                fontSize: '26px',
                                                fontWeight: 400,
                                                color: '#e4e4e7',
                                                fontFamily: '"Cormorant Garamond", "Georgia", serif'
                                            }}>
                                                {collab.profiles.username}
                                            </span>
                                            {index < collaborators.length - 1 && (
                                                <span style={{
                                                    fontSize: '26px',
                                                    color: '#71717a',
                                                    fontWeight: 300
                                                }}>
                                                    ,
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {notes && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                marginTop: '56px',
                                overflowY: 'auto',
                                minHeight: 0,
                                maxHeight: '360px',
                                flexShrink: 1,
                            }}>
                                <p style={{
                                    display: 'flex',
                                    fontSize: '36px',
                                    color: '#f5f5f5',
                                    lineHeight: 1.6,
                                    fontStyle: 'italic',
                                    margin: 0,
                                    position: 'relative',
                                    paddingLeft: '60px',
                                    paddingRight: '20px',
                                    fontWeight: 400,
                                    fontFamily: '"Cormorant Garamond", "Georgia", serif'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '-12px',
                                        fontSize: '90px',
                                        fontWeight: 400,
                                        color: '#d4d4d8',
                                        opacity: 0.4,
                                        lineHeight: 1,
                                        flexShrink: 0
                                    }}>
                                        &ldquo;
                                    </span>
                                    <span style={{ display: 'flex', flexGrow: 1 }}>{notes}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer - Clear Branding Section */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '32px 80px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(10px)',
                    flexShrink: 0
                }}>
                    <span style={{
                        fontSize: '28px',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #f43f5e 0%, #dc2626 50%, #991b1b 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '0.04em',
                        fontFamily: '"Inter", "Helvetica", sans-serif'
                    }}>
                        deeperweave.com
                    </span>
                </div>
            </div>
        </div>
    );
}