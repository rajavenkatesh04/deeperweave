'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// A basic toolbar for the editor
const TiptapToolbar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;
    return (
        <div className="flex flex-wrap items-center gap-2 rounded-t-md border-b border-gray-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active px-2 py-1 rounded bg-gray-200 dark:bg-zinc-700' : 'px-2 py-1'}>Bold</button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active px-2 py-1 rounded bg-gray-200 dark:bg-zinc-700' : 'px-2 py-1'}>Italic</button>
            <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active px-2 py-1 rounded bg-gray-200 dark:bg-zinc-700' : 'px-2 py-1'}>Strike</button>
            {/* Add more buttons for other features as needed */}
        </div>
    );
};

const TiptapEditor = ({ content, onChange }: { content: string; onChange: (richText: string) => void; }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        // ✨ FIX: Add this line to solve the SSR error
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-sm sm:prose-base focus:outline-none p-4 min-h-[300px] w-full',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className="rounded-md border border-gray-300 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800">
            <TiptapToolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;