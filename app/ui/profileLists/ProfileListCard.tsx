'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 1. IMPORT PORTAL
import Link from 'next/link';
import Image from 'next/image';
import { ListSummary } from '@/lib/data/lists-data';
import {
    FolderIcon,
    ChevronRightIcon,
    EllipsisHorizontalIcon,
    TrashIcon,
    PencilIcon,
    ShareIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { deleteList } from '@/lib/actions/list-actions';

// --- SEPARATE PORTAL MODAL COMPONENT ---
function ListActionModal({
                             list,
                             isOpen,
                             onClose
                         }: {
    list: ListSummary;
    isOpen: boolean;
    onClose: () => void;
}) {
    // 2. SCROLL LOCKING
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'; // Freeze scroll
        } else {
            document.body.style.overflow = ''; // Unfreeze
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Prevent hydration errors by ensuring we only render on client
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const stopProp = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDelete = async (e: React.MouseEvent) => {
        stopProp(e);
        if (!confirm('Are you sure you want to delete this list?')) return;
        onClose();
        toast.promise(deleteList(list.id), {
            loading: 'Deleting list...',
            success: 'List deleted',
            error: 'Failed to delete'
        });
    };

    const handleShare = (e: React.MouseEvent) => {
        stopProp(e);
        navigator.clipboard.writeText(`${window.location.origin}/lists/${list.id}`);
        toast.success('Link copied to clipboard');
        onClose();
    };

    // 3. RENDER VIA PORTAL (Outside of Card DOM)
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => { stopProp(e); onClose(); }}
                        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={stopProp} // Re-enable pointer events
                            className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Manage List</h3>
                                <button
                                    onClick={(e) => { stopProp(e); onClose(); }}
                                    className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 rounded-full transition-colors"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Options */}
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={handleShare}
                                    className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-colors text-left"
                                >
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                        <ShareIcon className="w-4 h-4" />
                                    </div>
                                    Share Link
                                </button>

                                <Link
                                    href={`/lists/${list.id}/edit`}
                                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                                    className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-colors"
                                >
                                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                                        <PencilIcon className="w-4 h-4" />
                                    </div>
                                    Edit List
                                </Link>

                                <button
                                    onClick={handleDelete}
                                    className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors text-left"
                                >
                                    <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                                        <TrashIcon className="w-4 h-4" />
                                    </div>
                                    Delete List
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body // 4. RENDER INTO BODY
    );
}

// --- MAIN CARD COMPONENT ---
export default function ProfileListCard({ list, isOwner }: { list: ListSummary, isOwner?: boolean }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="group relative flex w-full h-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5 cursor-pointer">

            {/* Stretched Link for Card Click */}
            <Link href={`/lists/${list.id}`} className="absolute inset-0 z-0" />

            {/* Left: Poster Stack */}
            <div className="relative w-24 sm:w-32 shrink-0 bg-zinc-100 dark:bg-zinc-950/50 flex items-center justify-center border-r border-zinc-100 dark:border-zinc-800 overflow-hidden z-10 pointer-events-none">
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

            {/* Right: Info */}
            <div className="flex flex-1 flex-col p-3 sm:p-4 min-w-0 relative z-10 pointer-events-none">
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

                    {isOwner && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsMenuOpen(true);
                            }}
                            className="pointer-events-auto p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 relative z-20"
                        >
                            <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>

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

            {/* Modal is now rendered outside via Portal */}
            <ListActionModal
                list={list}
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </div>
    );
}