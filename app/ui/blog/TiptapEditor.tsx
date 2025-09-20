// app/ui/blog/TiptapEditor.tsx

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {TextStyle} from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TiptapToolbar from './TiptapToolbar';

export default function TiptapEditor({ content, onChange }: { content: string; onChange: (richText: string) => void; }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // disable codeBlock and blockquote if you want
            }),
            TextStyle,
            Color,
            Underline,
            HorizontalRule,
        ],
        content: content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px] w-full rounded-b-md border border-t-0 border-gray-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900',
            },
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className="flex flex-col">
            <TiptapToolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}