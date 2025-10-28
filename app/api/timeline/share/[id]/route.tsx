import { ImageResponse } from '@vercel/og';
import { getTimelineEntryById } from '@/lib/data/timeline-data';
import ShareStoryImage from '@/app/ui/timeline/ShareStoryImage';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    // Await params before accessing its properties
    const { id: entryId } = await params;

    if (!entryId) {
        return new Response('Missing entry ID', { status: 400 });
    }

    try {
        // 1. Fetch the specific timeline entry data
        const entry = await getTimelineEntryById(entryId);

        if (!entry) {
            return new Response('Timeline entry not found', { status: 404 });
        }

        // 2. Fetch fonts from their PUBLIC URLS
        // We use `request.url` to get the base domain (e.g., https://your-app.vercel.app)
        // and then fetch the font from the /fonts/ path.
        const interRegular = fetch(new URL('/fonts/Inter_24pt-Regular.ttf', request.url)).then((res) => res.arrayBuffer());
        const interBold = fetch(new URL('/fonts/Inter_24pt-Bold.ttf', request.url)).then((res) => res.arrayBuffer());
        const interBlack = fetch(new URL('/fonts/Inter_24pt-Black.ttf', request.url)).then((res) => res.arrayBuffer());

        const [interRegularData, interBoldData, interBlackData] = await Promise.all([interRegular, interBold, interBlack]);

        // 3. Generate the image
        return new ImageResponse(
            (
                <ShareStoryImage entry={entry} />
            ),
            {
                width: 1080,
                height: 1920,
                fonts: [
                    { name: 'Inter', data: interRegularData, style: 'normal', weight: 400 },
                    { name: 'Inter', data: interBoldData, style: 'normal', weight: 700 },
                    { name: 'Inter', data: interBlackData, style: 'normal', weight: 900 },
                ],
            }
        );

    } catch (e: unknown) {
        const error = e as Error;
        console.error(error);
        return new Response(`Failed to generate image: ${error.message}`, { status: 500 });
    }
}