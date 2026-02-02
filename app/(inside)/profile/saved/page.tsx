import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SavedItemsDisplay from '@/app/ui/profile/SavedItemsDisplay';

export const dynamic = 'force-dynamic';

export default async function SavedPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    return <SavedItemsDisplay userId={user.id} />;
}