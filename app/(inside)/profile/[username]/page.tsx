// app/(inside)/profile/[username]/page.tsx
import { redirect } from 'next/navigation';
import {Metadata} from "next";

export const metadata: Metadata = {
    title: '{`username`}',
    description: 'View their profile',
};

export default async function ProfilePage({
                                              params
                                          }: {
    params: Promise<{ username: string }>
}) {
    const { username } = await params;

    // Redirect to the home tab as the default
    redirect(`/profile/${username}/home`);
}