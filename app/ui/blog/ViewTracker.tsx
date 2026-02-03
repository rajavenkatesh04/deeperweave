'use client';
import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ViewTracker({ postSlug }: { postSlug: string }) {
    useEffect(() => {
        const supabase = createClient();
        supabase.rpc('increment_view_count', { post_slug: postSlug }).then(({ error }) => {
            if (error) console.error('Error incrementing view count:', error);
        });
    }, [postSlug]);
    return null;
}