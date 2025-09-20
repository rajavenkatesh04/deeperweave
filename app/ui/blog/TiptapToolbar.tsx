// app/ui/blog/TiptapToolbar.tsx

'use client';

import type { Editor } from '@tiptap/react';
import {
    Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3, Pilcrow, Minus, PaintBucket
} from 'lucide-react';

export default function TiptapToolbar({ editor }: { editor: Editor | null }) {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-t-md border border-gray-300 bg-gray-50 p-2 dark:border-zinc-700 dark:bg-zinc-800">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>
                <Bold className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>
                <Italic className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}>
                <Underline className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}>
                <Strikethrough className="h-5 w-5" />
            </button>
            <div className="h-5 w-px bg-gray-300 dark:bg-zinc-600 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>
                <Heading1 className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>
                <Heading2 className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}>
                <Heading3 className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'is-active' : ''}>
                <Pilcrow className="h-5 w-5" />
            </button>
            <div className="h-5 w-px bg-gray-300 dark:bg-zinc-600 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                <Minus className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 ml-auto">
                <PaintBucket className="h-5 w-5 text-gray-500" />
                <input
                    type="color"
                    onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
                    value={editor.getAttributes('textStyle').color || '#000000'}
                    className="h-6 w-8 border-none bg-transparent p-0"
                />
            </div>

            {/* Basic styling for the toolbar buttons */}
            <style jsx>{`
                button {
                    padding: 0.25rem;
                    border-radius: 0.25rem;
                    transition: background-color 0.2s;
                }
                button:hover {
                    background-color: #e5e7eb; /* bg-gray-200 */
                }
                button.is-active {
                    background-color: #d1d5db; /* bg-gray-300 */
                }
                .dark button:hover {
                    background-color: #3f3f46; /* dark:bg-zinc-700 */
                }
                .dark button.is-active {
                    background-color: #52525b; /* dark:bg-zinc-600 */
                }
            `}</style>
        </div>
    );
}