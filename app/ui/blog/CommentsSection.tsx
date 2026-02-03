// @/app/ui/blog/CommentsSection.tsx

'use client';
import { useActionState, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { postComment } from '@/lib/actions/blog-actions';
import { CommentWithAuthor, UserProfile } from '@/lib/definitions';
import Image from 'next/image';
import Link from 'next/link';
import { User, SendHorizontal } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="group flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
            {pending ? 'Posting...' : 'Comment'}
            <SendHorizontal size={14} className={`group-hover:translate-x-1 transition-transform ${pending ? 'opacity-0' : 'opacity-100'}`} />
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

// Helper to format date
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

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
    const [isFocused, setIsFocused] = useState(false);
    const [commentText, setCommentText] = useState('');

    const commentAction = async (prevState: CommentState, formData: FormData) => {
        if (!isLoggedIn) return { error: "You must be logged in." };
        const result = await postComment(postId, formData);
        if (result?.success) {
            setCommentText(''); // Clear text on success
            setIsFocused(false); // Close the input actions
        }
        return result;
    };

    const [state, formAction] = useActionState(commentAction, null);

    if (state?.error && formRef.current) {
        formRef.current.reset();
    }

    const reversedComments = [...comments].reverse();
    const showActions = isFocused || commentText.length > 0;

    return (
        <section className="w-full max-w-4xl">

            {/* --- ADD COMMENT INPUT --- */}
            <div className="flex gap-4 mb-8">
                {/* Current User Avatar */}
                <div className="shrink-0 pt-1">
                    {isLoggedIn ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                            <Image
                                src={currentUserProfile.profile_pic_url || '/placeholder-user.jpg'}
                                fill
                                alt="Your Avatar"
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                            <User size={20} className="text-zinc-500" />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <form ref={formRef} action={formAction} className="relative">
                        <label htmlFor="comment" className="sr-only">Add a comment</label>

                        {/* YouTube Style Logic:
                            1. border-b only (static gray line).
                            2. Animated active line (white/blue) on top.
                            3. No outlines or boxes on the textarea itself.
                        */}
                        <div className="relative">
                            <textarea
                                id="comment"
                                name="comment"
                                rows={isFocused ? 3 : 1}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                // We don't blur immediately so users can click buttons
                                disabled={!isLoggedIn}
                                placeholder={isLoggedIn ? "Add a comment..." : "Sign in to comment..."}
                                className="peer w-full bg-transparent border-none outline-none ring-0 shadow-none text-sm md:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 resize-none overflow-hidden py-2 px-0 leading-relaxed"
                                required
                                style={{ boxShadow: 'none' }} // Force remove any shadow artifacts
                            />

                            {/* Static Bottom Border */}
                            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-zinc-300 dark:bg-zinc-700" />

                            {/* Animated Focus Border (Expands from center or left) */}
                            <div className={`absolute bottom-0 left-0 h-[2px] bg-zinc-900 dark:bg-white transition-all duration-300 ease-out ${isFocused ? 'w-full' : 'w-0'}`} />
                        </div>

                        {/* Actions (Cancel / Submit) - Only show when focused or typing */}
                        {(showActions || state?.error) && (
                            <div className="flex items-center justify-between mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="text-red-600 text-xs">
                                    {state?.error && state.error}
                                </div>
                                <div className="flex items-center gap-3 ml-auto">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsFocused(false);
                                            setCommentText('');
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                    >
                                        Cancel
                                    </button>

                                    {isLoggedIn ? (
                                        <SubmitButton />
                                    ) : (
                                        <Link
                                            href="/auth/login"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            Sign In
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* --- COMMENTS LIST --- */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">No comments yet. Be the first to share your thoughts.</p>
                    </div>
                ) : (
                    reversedComments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            {/* Author Avatar */}
                            <Link href={`/profile/${comment.author.username}`} className="shrink-0 mt-1">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                    <Image
                                        src={comment.author.profile_pic_url || '/placeholder-user.jpg'}
                                        fill
                                        alt={comment.author.display_name}
                                        className="object-cover"
                                    />
                                </div>
                            </Link>

                            <div className="flex-1">
                                {/* Header: Name + Time */}
                                <div className="flex items-baseline gap-2 mb-1">
                                    <Link
                                        href={`/profile/${comment.author.username}`}
                                        className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        @{comment.author.username}
                                    </Link>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {formatDate(comment.created_at)}
                                    </span>
                                </div>

                                {/* Content */}
                                <p className="text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}