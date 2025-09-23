// app/(inside)/profile/[username]/page.tsx
import { redirect } from 'next/navigation';

export default async function ProfilePage({
                                              params
                                          }: {
    params: Promise<{ username: string }>
}) {
    const { username } = await params;

    // Redirect to the home tab as the default
    redirect(`/profile/${username}/home`);
}