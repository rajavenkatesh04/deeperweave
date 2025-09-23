// @/app/ui/blog/CommentsSection.tsx

'use client';
import { useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { postComment } from '@/lib/actions/blog-actions';
import { CommentWithAuthor, UserProfile } from '@/lib/definitions';
import Image from 'next/image';
import Link from 'next/link';
import { UserCircleIcon } from '@heroicons/react/24/solid';

function SubmitButton() {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className="h-10 px-6 font-semibold rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">{pending ? 'Posting...' : 'Post Comment'}</button>;
}

type CommentState = {
    error: string;
    success?: undefined;
} | {
    success: string;
    error?: undefined;
} | null;

export default function CommentsSection({
                                            postId,
                                            comments,
                                            currentUserProfile,
                                        }: {
    postId: string;
    comments: CommentWithAuthor[];
    currentUserProfile: UserProfile | null;
}) {
    const formRef = useRef<HTMLFormElement>(null);
    const isLoggedIn = !!currentUserProfile;

    const commentAction = async (prevState: CommentState, formData: FormData) => {
        if (!isLoggedIn) return { error: "You must be logged in." };
        return await postComment(postId, formData);
    };

    const [state, formAction] = useActionState(commentAction, null);

    // Reset form on successful submission
    if (state?.error && formRef.current) {
        formRef.current.reset();
        // ✨ FIX: The problematic line that tried to change the state has been removed.
    }

    const reversedComments = [...comments].reverse();

    return (
        <section className="pt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Comments ({comments.length})</h2>

            <form ref={formRef} action={formAction} className="mt-6 flex items-start gap-4 p-4 rounded-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-white/30 dark:border-zinc-700/30 shadow-sm">
                <div className="flex-shrink-0">
                    {isLoggedIn ? (
                        <Image
                            src={currentUserProfile.profile_pic_url || '/placeholder-user.jpg'}
                            width={40}
                            height={40}
                            alt="Your profile picture"
                            className="rounded-full object-cover w-10 h-10"
                        />
                    ) : (
                        <UserCircleIcon className="w-10 h-10 text-gray-400 dark:text-zinc-600" />
                    )}
                </div>
                <div className="flex-1">
                    <textarea
                        name="comment"
                        rows={3}
                        disabled={!isLoggedIn}
                        placeholder={isLoggedIn ? "Add to the discussion..." : "Log in to join the discussion..."}
                        className="w-full rounded-xl border border-gray-300/70 bg-white/50 p-4 shadow-sm backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-gray-400/30 dark:focus:ring-zinc-600/30 disabled:cursor-not-allowed disabled:bg-gray-100/50 dark:disabled:bg-zinc-800/30"
                        required
                    />
                    <div className="mt-4 flex justify-end items-center">
                        {isLoggedIn ? (
                            <SubmitButton />
                        ) : (
                            <p className="text-sm text-gray-600 dark:text-zinc-400">
                                Please <Link href="/auth/login" className="font-semibold text-gray-800 underline hover:text-gray-900 dark:text-zinc-200 dark:hover:text-white">log in</Link> to comment.
                            </p>
                        )}
                    </div>
                    {state?.error && <p className="text-red-500 text-sm mt-2 text-right">{state.error}</p>}
                </div>
            </form>

            <div className="mt-8 space-y-6">
                {reversedComments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-white/30 dark:border-zinc-700/30 shadow-sm transition-all hover:bg-white/70 dark:hover:bg-zinc-800/70">
                        <div className="flex-shrink-0">
                            <Link href={`/profile/${comment.author.username}`}>
                                <Image
                                    src={comment.author.profile_pic_url || '/placeholder-user.jpg'}
                                    width={40}
                                    height={40}
                                    alt={comment.author.display_name}
                                    className="rounded-full object-cover w-10 h-10"
                                />
                            </Link >
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center">
                                <Link href={`/profile/${comment.author.username}`} className="font-semibold text-gray-900 dark:text-zinc-100 hover:text-gray-700 dark:hover:text-zinc-300">
                                    {comment.author.display_name}
                                </Link >
                                <span className="ml-2 text-xs text-gray-500 dark:text-zinc-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="mt-2 text-gray-700 dark:text-zinc-300">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}