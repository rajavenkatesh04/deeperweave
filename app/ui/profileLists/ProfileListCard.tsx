'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ListSummary } from '@/lib/data/lists-data';
import { FolderIcon, ChevronRightIcon, EllipsisHorizontalIcon, TrashIcon, PencilIcon, ShareIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { deleteList } from '@/lib/actions/list-actions';

// --- ACTION MENU ---
function ActionMenu({ list }: { list: ListSummary }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this list?')) return;
        setIsOpen(false);
        toast.promise(deleteList(list.id), {
            loading: 'Deleting list...',
            success: 'List deleted',
            error: 'Failed to delete'
        });
    };

    const handleShare = () => {
        navigator.clipboard.writeText(`${window.location.origin}/lists/${list.id}`);
        toast.success('Link copied to clipboard');
        setIsOpen(false);
    };

    return (
        <div className="relative z-20 shrink-0 ml-auto" ref={dropdownRef}>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
                <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5, x: 0 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        className="absolute right-0 top-8 w-32 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg py-1 ring-1 ring-black/5 origin-top-right"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <button
                            onClick={handleShare}
                            className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                            <ShareIcon className="w-3.5 h-3.5" /> Share
                        </button>
                        <Link
                            href={`/lists/${list.id}/edit`}
                            className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <PencilIcon className="w-3.5 h-3.5" /> Edit
                        </Link>
                        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                        <button
                            onClick={handleDelete}
                            className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                            <TrashIcon className="w-3.5 h-3.5" /> Delete
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ProfileListCard({ list, isOwner }: { list: ListSummary, isOwner?: boolean }) {
    return (
        <Link
            href={`/lists/${list.id}`}
            className="group relative flex w-full h-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5"
        >
            {/* --- LEFT: Compact Poster Stack --- */}
            <div className="relative w-24 sm:w-32 shrink-0 bg-zinc-100 dark:bg-zinc-950/50 flex items-center justify-center border-r border-zinc-100 dark:border-zinc-800 overflow-hidden">
                {list.preview_items && list.preview_items.length > 0 ? (
                    <div className="relative w-14 h-20 sm:w-16 sm:h-24">
                        {list.preview_items.slice(0, 3).map((item, i) => (
                            <div
                                key={i}
                                className="absolute shadow-sm rounded-sm overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-800 transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1"
                                style={{
                                    left: i * 5,
                                    top: i * 4,
                                    zIndex: i,
                                    width: '100%',
                                    height: '100%',
                                    transform: `rotate(${(i - 1) * 3}deg)`
                                }}
                            >
                                {item.poster_url ? (
                                    <Image
                                        src={item.poster_url.startsWith('http') ? item.poster_url : `https://image.tmdb.org/t/p/w200${item.poster_url}`}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        sizes="100px"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <FolderIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-700 opacity-50" />
                )}
            </div>

            {/* --- RIGHT: Content Info --- */}
            <div className="flex flex-1 flex-col p-3 sm:p-4 min-w-0 relative">

                {/* Header Row with Action Menu */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-1 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                            {list.title}
                        </h3>
                        {list.description && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                {list.description}
                            </p>
                        )}
                    </div>

                    {/* Only show Action Menu if Owner */}
                    {isOwner && <ActionMenu list={list} />}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-[10px] sm:text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-0.5 rounded-full">
                        {list.item_count} items
                    </span>

                    <div className="flex items-center gap-1 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:inline">View</span>
                        <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4" strokeWidth={2} />
                    </div>
                </div>
            </div>
        </Link>
    );
}