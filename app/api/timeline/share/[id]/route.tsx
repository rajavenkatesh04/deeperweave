import { ImageResponse } from '@vercel/og';
import { getTimelineEntryById } from '@/lib/data/timeline-data';
import StoryImageWithNotes from '@/app/ui/timeline/StoryImageWithNotes';
// Importing the new component you mentioned
import StoryImageNoNotes from '@/app/ui/timeline/StoryImageNoNotes';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: entryId } = await params;

    // Get the mode from query params (defaults to 'notes' if missing)
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'notes';

    if (!entryId) {
        return new Response('Missing entry ID', { status: 400 });
    }

    try {
        const entry = await getTimelineEntryById(entryId);

        if (!entry) {
            return new Response('Timeline entry not found', { status: 404 });
        }

        const interRegular = fetch(new URL('/fonts/Inter_24pt-Regular.ttf', request.url)).then((res) => res.arrayBuffer());
        const interBold = fetch(new URL('/fonts/Inter_24pt-Bold.ttf', request.url)).then((res) => res.arrayBuffer());
        const interBlack = fetch(new URL('/fonts/Inter_24pt-Black.ttf', request.url)).then((res) => res.arrayBuffer());

        const [interRegularData, interBoldData, interBlackData] = await Promise.all([interRegular, interBold, interBlack]);

        // Select the component based on the mode
        const element = mode === 'clean'
            ? <StoryImageNoNotes entry={entry} />
            : <StoryImageWithNotes entry={entry} />;

        return new ImageResponse(
            element,
            {
                width: 1080,
                height: 1920,
                fonts: [
                    { name: 'Inter', data: interRegularData, style: 'normal', weight: 400 },
                    { name: 'Inter', data: interBoldData, style: 'normal', weight: 700 },
                    { name: 'Inter', data: interBlackData, style: 'normal', weight: 900 },
                ],
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                    'CDN-Cache-Control': 'no-store, max-age=0',
                    'Vercel-CDN-Cache-Control': 'no-store, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            }
        );

    } catch (e: unknown) {
        const error = e as Error;
        console.error(error);
        return new Response(`Failed to generate image: ${error.message}`, { status: 500 });
    }
}