import { getUserProfile } from '@/lib/data/user-data';
import { redirect } from 'next/navigation';
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'My Profile',
    robots: { index: false, follow: false }, // Enterprise tip: Don't index redirecting pages
};

export default async function MyProfilePage() {
    const userData = await getUserProfile();
    if (!userData?.profile) {
        redirect('/auth/login');
    }
    redirect(`/profile/${userData.profile.username}`);
}