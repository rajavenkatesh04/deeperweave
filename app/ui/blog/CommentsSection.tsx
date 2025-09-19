'use client';
import {useActionState, useRef} from 'react';
import {  useFormStatus } from 'react-dom';
import { postComment } from '@/lib/actions/blog-actions';
import { CommentWithAuthor, UserProfile } from '@/lib/definitions';
import Image from 'next/image';
import Link from 'next/link';

function SubmitButton() {
    const { pending } = useFormStatus();
    return <button type="submit" disabled={pending} className="h-10 px-6 font-semibold rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">{pending ? 'Posting...' : 'Post Comment'}</button>;
}

type CommentState = {
    error: string;
    success?: undefined;
} | {
    success: string;
    error?: undefined;
} | null;

export default function CommentsSection({ postId, comments, currentUserProfile }: { postId: string; comments: CommentWithAuthor[]; currentUserProfile: UserProfile | null; }) {
    const formRef = useRef<HTMLFormElement>(null);

    // Create a wrapper function that matches useActionState's expected signature
    const commentAction = async (prevState: CommentState, formData: FormData) => {
        return await postComment(postId, formData);
    };

    const [state, formAction] = useActionState(commentAction, null);

    if (state?.success) {
        formRef.current?.reset();
    }

    return (
        <section className="mt-12 pt-8 border-t border-gray-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Comments ({comments.length})</h2>
            {currentUserProfile && (
                <form ref={formRef} action={formAction} className="mt-6 flex items-start gap-4">
                    <Image src={currentUserProfile.profile_pic_url || '/placeholder-user.jpg'} width={40} height={40} alt="Your profile picture" className="rounded-full" />
                    <div className="flex-1">
                        <textarea name="comment" rows={3} placeholder="Add to the discussion..." className="w-full rounded-md border-gray-300 bg-gray-50 p-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-800" required></textarea>
                        <div className="mt-2 flex justify-end"> <SubmitButton /> </div>
                        {state?.error && <p className="text-red-500 text-sm mt-1">{state.error}</p>}
                    </div>
                </form>
            )}
            <div className="mt-8 space-y-8">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-4">
                        <Link href={`/profile/${comment.author.username}`}>
                            <Image src={comment.author.profile_pic_url || '/placeholder-user.jpg'} width={40} height={40} alt={comment.author.display_name} className="rounded-full" />
                        </Link>
                        <div className="flex-1">
                            <p>
                                <Link href={`/profile/${comment.author.username}`} className="font-semibold text-gray-900 dark:text-zinc-100">{comment.author.display_name}</Link>
                                <span className="ml-2 text-xs text-gray-500 dark:text-zinc-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                            </p>
                            <p className="mt-1 text-gray-700 dark:text-zinc-300">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}