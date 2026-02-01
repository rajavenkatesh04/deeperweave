'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { updateListEntryNote, removeFromList } from '@/lib/actions/list-actions';

export default function ListEntryRow({ entry, details, index, listId }: any) {
    // Local state for instant typing feel
    const [note, setNote] = useState(entry.note || '');
    const [isSaving, setIsSaving] = useState(false);

    // Save when user clicks away (onBlur) or presses Enter
    const handleSave = async () => {
        if (note === entry.note) return; // No changes
        setIsSaving(true);
        await updateListEntryNote(entry.id, note);
        setIsSaving(false);
    };

    // Adding <HTMLInputElement> here tells TS what currentTarget is
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur(); // Now TS knows this is valid
        }
    };

    return (
        <div className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-black/20 rounded-xl group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors">

            {/* Rank */}
            <span className="font-mono text-xl text-zinc-300 font-bold w-8 text-center">{index + 1}</span>

            {/* Poster */}
            <div className="relative w-10 h-14 bg-zinc-200 rounded-md overflow-hidden shrink-0 shadow-sm">
                {details.poster_url && (
                    <Image
                        src={details.poster_url.startsWith('http') ? details.poster_url : `https://image.tmdb.org/t/p/w200${details.poster_url}`}
                        alt={details.title}
                        fill
                        className="object-cover"
                    />
                )}
            </div>

            {/* Title & Metadata */}
            <div className="w-48 shrink-0">
                <p className="font-bold text-sm truncate">{details.title}</p>
                <p className="text-xs text-zinc-500">{details.release_date?.split('-')[0]}</p>
            </div>

            {/* ✨ THE NOTE (In the middle gap) */}
            <div className="flex-1 px-4">
                <div className="relative group/input">
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a note..."
                        className={`w-full bg-transparent border-b border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 text-sm py-1 focus:outline-none transition-colors ${note ? 'text-zinc-600 dark:text-zinc-300' : 'text-zinc-400 italic'}`}
                    />
                    {/* Tiny Pencil Icon overlay if empty */}
                    {!note && (
                        <PencilSquareIcon className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-200 dark:text-zinc-800 pointer-events-none group-hover/input:text-zinc-400" />
                    )}
                </div>
            </div>

            {/* Delete Button */}
            <button
                onClick={() => removeFromList(entry.id, listId)}
                className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                title="Remove from list"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    );
}