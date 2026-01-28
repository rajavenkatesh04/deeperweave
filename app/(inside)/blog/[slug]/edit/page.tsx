// app/(inside)/blog/[slug]/edit/page.tsx
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserProfile } from '@/lib/data/user-data';
import EditPostForm from './edit-form'; // We'll extract the form logic to a client component

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();
    const userData = await getUserProfile();

    if (!userData?.user) redirect('/auth/login');

    // Fetch the post with related movie/series data
    const { data: post } = await supabase
        .from('posts')
        .select(`
            *,
            movie:movies(*),
            series:series(*)
        `)
        .eq('slug', slug)
        .single();

    if (!post) notFound();

    // Security: Ensure owner
    if (post.author_id !== userData.user.id) {
        return <div className="p-10 text-center">You are not authorized to edit this post.</div>;
    }

    return (
        <main className="max-w-5xl mx-auto px-4 mt-4">
            <EditPostForm post={post} />
        </main>
    );
}