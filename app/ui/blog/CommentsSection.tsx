// @/app/ui/blog/CommentsSection.tsx

'use client';
import { useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { postComment } from '@/lib/actions/blog-actions';
import { CommentWithAuthor, UserProfile } from '@/lib/definitions';
import Image from 'next/image';
import Link from 'next/link';
import { UserCircleIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="group flex items-center gap-2 px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
            <span className="text-xs font-bold uppercase tracking-widest">
                {pending ? 'Transmitting...' : 'Send'}
            </span>
            <PaperAirplaneIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
    );
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

    if (state?.error && formRef.current) {
        formRef.current.reset();
    }

    const reversedComments = [...comments].reverse();

    return (
        <section className="pt-2">

            {/* --- INPUT TERMINAL --- */}
            <form
                ref={formRef}
                action={formAction}
                className="mb-10 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-1"
            >
                <div className="flex items-start gap-0 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 p-4">
                    {/* User Avatar */}
                    <div className="flex-shrink-0 mr-4 pt-1">
                        {isLoggedIn ? (
                            <div className="relative w-8 h-8">
                                <Image
                                    src={currentUserProfile.profile_pic_url || '/placeholder-user.jpg'}
                                    fill
                                    alt="User"
                                    className="object-cover grayscale"
                                />
                                <div className="absolute inset-0 border border-zinc-200 dark:border-zinc-700" />
                            </div>
                        ) : (
                            <UserCircleIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                        )}
                    </div>

                    {/* Input Field */}
                    <div className="flex-1">
                        <label htmlFor="comment" className="sr-only">Add comment</label>
                        <textarea
                            id="comment"
                            name="comment"
                            rows={3}
                            disabled={!isLoggedIn}
                            placeholder={isLoggedIn ? "Enter log entry..." : "Authentication required to comment..."}
                            className="w-full bg-transparent border-0 p-0 text-sm md:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-0 resize-y min-h-[80px] font-mono"
                            required
                        />

                        {/* Toolbar / Actions */}
                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                                {isLoggedIn ? 'Ready to transmit' : 'System Locked'}
                            </div>

                            {isLoggedIn ? (
                                <SubmitButton />
                            ) : (
                                <Link
                                    href="/auth/login"
                                    className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100 hover:underline decoration-1 underline-offset-4"
                                >
                                    Login to Access
                                </Link>
                            )}
                        </div>
                        {state?.error && (
                            <p className="text-red-600 text-xs font-mono mt-2 text-right border-t border-red-100 dark:border-red-900/30 pt-2">
                                [ERROR]: {state.error}
                            </p>
                        )}
                    </div>
                </div>
            </form>

            {/* --- COMMENTS LIST (LOG ENTRIES) --- */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 opacity-50">
                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-zinc-400 mb-2" />
                        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">No transmissions received</p>
                    </div>
                ) : (
                    reversedComments.map((comment, index) => (
                        <div
                            key={comment.id}
                            className="group relative pl-4 border-l border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                        >
                            {/* Decorative Timeline Dot */}
                            <div className="absolute -left-[5px] top-0 w-[9px] h-[9px] bg-zinc-200 dark:bg-zinc-800 group-hover:bg-zinc-400 dark:group-hover:bg-zinc-500 rounded-full border-2 border-white dark:border-black transition-colors" />

                            <div className="flex gap-4 mb-1">
                                {/* Meta Header */}
                                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                                    <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                                        {`LOG_${(reversedComments.length - index).toString().padStart(3, '0')}`}
                                    </span>
                                    <span>//</span>
                                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                                    <span>//</span>
                                    <span>{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                {/* Author Avatar */}
                                <Link href={`/profile/${comment.author.username}`} className="shrink-0 mt-1">
                                    <div className="relative w-8 h-8">
                                        <Image
                                            src={comment.author.profile_pic_url || '/placeholder-user.jpg'}
                                            width={32}
                                            height={32}
                                            alt={comment.author.display_name}
                                            className="object-cover grayscale group-hover:grayscale-0 transition-all"
                                        />
                                        <div className="absolute inset-0 border border-zinc-100 dark:border-zinc-800" />
                                    </div>
                                </Link>

                                {/* Comment Body */}
                                <div className="flex-1 pb-4">
                                    <Link
                                        href={`/profile/${comment.author.username}`}
                                        className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:underline decoration-1 underline-offset-4 block mb-1"
                                    >
                                        {comment.author.display_name}
                                    </Link>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-light">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}