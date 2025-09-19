import { getUserProfile } from '@/lib/data/user-data';
import { redirect } from 'next/navigation';

export default async function MyProfilePage() {
    const userData = await getUserProfile();
    if (!userData?.profile) {
        redirect('/auth/login');
    }
    redirect(`/profile/${userData.profile.username}`);
}