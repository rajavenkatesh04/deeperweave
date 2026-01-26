'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Reorder, useDragControls } from 'framer-motion';
import { UserProfile, ProfileSection } from '@/lib/definitions';
import { updateProfile, EditProfileState, checkUsernameAvailability } from '@/lib/actions/profile-actions';
import { searchCinematic, type CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import {
    PhotoIcon, CheckCircleIcon, XCircleIcon, FilmIcon,
    ArrowLeftIcon, PlusIcon, TrashIcon, Bars3Icon,
    UserIcon, TvIcon, MagnifyingGlassIcon, XMarkIcon,
    ChevronUpIcon, ChevronDownIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';

// --- Constants ---
const MAX_ITEMS_PER_SECTION = 6;

// --- Types ---
type EditableItem = {
    // We use a composite String ID (e.g., "550-172...") for client-side drag keys
    // to prevent React key duplication errors if the user adds the same movie twice.
    id: number | string;
    tmdb_id: number;     // The actual ID we send back to the server.
    title: string;
    image_path: string | null;
    type: 'movie' | 'tv' | 'person';
    year?: string;
};

type EditableSection = {
    id: string;
    title: string;
    type: 'mixed' | 'movie' | 'tv' | 'person';
    items: EditableItem[];
};

// --- SUB-COMPONENTS ---

/**
 * SearchModal: Handles searching TMDB and selecting items.
 * Mobile-First: Full screen on mobile, modal on desktop.
 */
function SearchModal({
                         isOpen,
                         sectionType,
                         onClose,
                         onSelect
                     }: {
    isOpen: boolean;
    sectionType: string;
    onClose: () => void;
    onSelect: (item: CinematicSearchResult) => void;
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CinematicSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
            setResults([]);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Debounced Search
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (query.trim().length < 2) return;
            setLoading(true);
            try {
                const data = await searchCinematic(query);
                // Filter results based on the current section type constraint
                const filtered = data.filter(item => {
                    if (sectionType === 'movie') return item.media_type === 'movie';
                    if (sectionType === 'tv') return item.media_type === 'tv';
                    if (sectionType === 'person') return item.media_type === 'person';
                    return item.media_type !== 'person'; // Mixed excludes people usually
                });
                setResults(filtered);
            } catch (e) {
                toast.error("Search failed", {
                    style: { background: '#18181b', color: '#fff', borderColor: '#27272a' }
                });
            } finally {
                setLoading(false);
            }
        }, 400);
        return () => clearTimeout(handler);
    }, [query, sectionType]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-50 dark:bg-zinc-950 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={`Search ${sectionType}...`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-zinc-100 dark:bg-zinc-900 border-none rounded-md outline-none text-base placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-100"
                    />
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors font-medium text-sm"
                >
                    Cancel
                </button>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-2 bg-zinc-50 dark:bg-zinc-950">
                {loading ? (
                    <div className="py-12 flex justify-center"><LoadingSpinner /></div>
                ) : (
                    <div className="space-y-1">
                        {results.map((item) => {
                            const imagePath = item.poster_path || item.profile_path;
                            const displayTitle = item.title || item.name || 'Unknown';
                            const year = item.release_date?.split('-')[0] || '';

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => { onSelect(item); onClose(); }}
                                    className="w-full flex items-center gap-4 p-2 hover:bg-white dark:hover:bg-zinc-900 active:bg-zinc-200 dark:active:bg-zinc-800 rounded-md transition-colors text-left group"
                                >
                                    <div className="w-10 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-sm flex-shrink-0 relative overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800">
                                        {imagePath ? (
                                            <Image src={`https://image.tmdb.org/t/p/w92${imagePath}`} alt="" fill className="object-cover" />
                                        ) : <FilmIcon className="w-5 h-5 m-auto text-zinc-400"/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{displayTitle}</h4>
                                        <p className="text-[10px] uppercase font-bold text-zinc-500">{item.media_type} {year && `• ${year}`}</p>
                                    </div>
                                    <PlusIcon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper for Drag Handle Icon
function DragHandleIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={className} stroke="currentColor">
            <path d="M7 2a1 1 0 100 2 1 1 0 000-2zM7 9a1 1 0 100 2 1 1 0 000-2zM7 16a1 1 0 100 2 1 1 0 000-2zM13 2a1 1 0 100 2 1 1 0 000-2zM13 9a1 1 0 100 2 1 1 0 000-2zM13 16a1 1 0 100 2 1 1 0 000-2z" fill="currentColor"/>
        </svg>
    );
}

/**
 * DraggableItem: A single movie/show row that can be reordered via drag-and-drop.
 */
function DraggableItem({ item, onRemove }: { item: EditableItem, onRemove: () => void }) {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={item}
            dragListener={false} // Disable default drag to use specific handle
            dragControls={dragControls}
            className="flex items-center gap-3 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm relative group select-none touch-none"
        >
            {/* Drag Handle */}
            <div
                onPointerDown={(e) => dragControls.start(e)}
                className="p-2 -ml-2 text-zinc-400 cursor-grab active:cursor-grabbing hover:text-zinc-600 dark:hover:text-zinc-200"
            >
                <DragHandleIcon className="w-5 h-5" />
            </div>

            {/* Thumbnail */}
            <div className="w-10 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-sm relative overflow-hidden flex-shrink-0 border border-zinc-100 dark:border-zinc-800">
                {item.image_path ? (
                    <Image src={`https://image.tmdb.org/t/p/w92${item.image_path}`} alt="" fill className="object-cover" />
                ) : <FilmIcon className="w-4 h-4 m-auto text-zinc-400"/>}
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{item.title}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">{item.type} {item.year && `• ${item.year}`}</p>
            </div>

            {/* Remove Button */}
            <button
                type="button"
                onClick={onRemove}
                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
        </Reorder.Item>
    );
}

/**
 * SectionEditor: Manages a list of items (Drag-drop reorder) + Section Metadata.
 */
function SectionEditor({
                           section,
                           index,
                           totalSections,
                           onUpdate,
                           onRemove,
                           onMove
                       }: {
    section: EditableSection,
    index: number,
    totalSections: number,
    onUpdate: (s: EditableSection) => void,
    onRemove: () => void,
    onMove: (dir: -1 | 1) => void
}) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleAddItem = (result: CinematicSearchResult) => {
        // Enforce Cap
        if (section.items.length >= MAX_ITEMS_PER_SECTION) {
            toast.error(`Maximum ${MAX_ITEMS_PER_SECTION} items allowed per section.`, {
                style: { background: '#18181b', color: '#fff', borderColor: '#7f1d1d' }
            });
            return;
        }

        const title = result.title || result.name || 'Unknown';
        const imagePath = result.poster_path || result.profile_path || null;

        const newItem: EditableItem = {
            id: `${result.id}-${Date.now()}`, // Unique key for Reorder list
            tmdb_id: result.id,               // Actual ID for DB
            title: title,
            image_path: imagePath ? imagePath.replace('https://image.tmdb.org/t/p/w500', '') : null,
            type: result.media_type as 'movie' | 'tv' | 'person',
            year: result.release_date?.split('-')[0]
        };

        onUpdate({ ...section, items: [...section.items, newItem] });
        toast.success(`Added ${title}`, {
            style: { background: '#18181b', color: '#fff', borderColor: '#27272a' }
        });
    };

    const handleReorder = (newOrder: EditableItem[]) => {
        onUpdate({ ...section, items: newOrder });
    };

    const handleRemoveItem = (itemId: string | number) => {
        onUpdate({ ...section, items: section.items.filter(i => i.id !== itemId) });
    };

    const isFull = section.items.length >= MAX_ITEMS_PER_SECTION;

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <SearchModal
                isOpen={isSearchOpen}
                sectionType={section.type}
                onClose={() => setIsSearchOpen(false)}
                onSelect={handleAddItem}
            />

            {/* --- Section Header --- */}
            <div className="flex items-center gap-3 p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                {/* Icon Badge */}
                <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-sm border border-zinc-200 dark:border-zinc-700 text-zinc-500">
                    {section.type === 'movie' && <FilmIcon className="w-4 h-4"/>}
                    {section.type === 'tv' && <TvIcon className="w-4 h-4"/>}
                    {section.type === 'person' && <UserIcon className="w-4 h-4"/>}
                    {section.type === 'mixed' && <Bars3Icon className="w-4 h-4"/>}
                </div>

                {/* Title Input */}
                <input
                    type="text"
                    value={section.title}
                    onChange={(e) => onUpdate({...section, title: e.target.value})}
                    className="flex-1 bg-transparent font-bold text-sm outline-none placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100"
                    placeholder="Collection Name"
                />

                {/* Section Controls (Move Up, Move Down, Delete) */}
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onMove(-1)}
                        disabled={index === 0}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-sm disabled:opacity-20 transition-colors text-zinc-500"
                        title="Move Section Up"
                    >
                        <ChevronUpIcon className="w-4 h-4"/>
                    </button>
                    <button
                        type="button"
                        onClick={() => onMove(1)}
                        disabled={index === totalSections - 1}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-sm disabled:opacity-20 transition-colors text-zinc-500"
                        title="Move Section Down"
                    >
                        <ChevronDownIcon className="w-4 h-4"/>
                    </button>
                    <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1"/>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-sm transition-colors"
                        title="Delete Section"
                    >
                        <TrashIcon className="w-4 h-4"/>
                    </button>
                </div>
            </div>

            {/* --- Items List --- */}
            <div className="p-3 space-y-2">
                {section.items.length > 0 ? (
                    <Reorder.Group axis="y" values={section.items} onReorder={handleReorder} className="space-y-2">
                        {section.items.map((item) => (
                            <DraggableItem key={item.id} item={item} onRemove={() => handleRemoveItem(item.id)} />
                        ))}
                    </Reorder.Group>
                ) : (
                    <div className="text-center py-8 text-zinc-400 text-xs italic border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-sm">
                        Empty collection
                    </div>
                )}

                {/* Add Button (Conditional) */}
                {!isFull ? (
                    <button
                        type="button"
                        onClick={() => setIsSearchOpen(true)}
                        className="w-full py-3 flex items-center justify-center gap-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all text-xs font-bold uppercase tracking-wider"
                    >
                        <PlusIcon className="w-4 h-4" /> Add Item
                    </button>
                ) : (
                    <div className="w-full py-2 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 dark:bg-zinc-900/50 rounded-md">
                        Max {MAX_ITEMS_PER_SECTION} Items Reached
                    </div>
                )}
            </div>
        </div>
    );
}

// --- MAIN FORM ---

export default function ProfileEditForm({ profile, sections }: { profile: UserProfile; sections: ProfileSection[] }) {
    const router = useRouter();
    const initialState: EditProfileState = { message: null, errors: {} };
    const [state, formAction] = useActionState(updateProfile, initialState);

    // Profile State
    const [previewUrl, setPreviewUrl] = useState<string | null>(profile.profile_pic_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [username, setUsername] = useState(profile.username);
    const [availability, setAvailability] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [editableSections, setEditableSections] = useState<EditableSection[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize Sections
    useEffect(() => {
        if (sections.length > 0) {
            setEditableSections(sections.map(s => ({
                id: s.id,
                title: s.title,
                type: s.type,
                // Sort by rank and map to editable format
                items: s.items.sort((a, b) => a.rank - b.rank).map((item, idx) => {
                    const obj = item.movie || item.series || item.person;
                    if (!obj) return null;
                    const title = 'title' in obj ? obj.title : obj.name;
                    const imagePath = 'poster_url' in obj
                        ? obj.poster_url?.replace('https://image.tmdb.org/t/p/w500', '')
                        : obj.profile_path?.replace('https://image.tmdb.org/t/p/w500', '');

                    return {
                        id: `${obj.tmdb_id}-${idx}-${Date.now()}`, // Unique Composite ID
                        tmdb_id: obj.tmdb_id,                       // Server ID
                        title,
                        image_path: imagePath,
                        type: item.item_type,
                        year: 'release_date' in obj ? obj.release_date?.split('-')[0] : undefined
                    } as EditableItem;
                }).filter((i): i is EditableItem => i !== null)
            })));
        } else {
            setEditableSections([{ id: 'default-1', title: 'Favorites', type: 'mixed', items: [] }]);
        }
    }, [sections]);

    // Handle Server Action Response
    useEffect(() => {
        if (state.message === 'Success') {
            toast.success("Profile saved successfully", {
                style: { background: '#18181b', color: '#fff', borderColor: '#27272a' }
            });

            // Client-side redirect pattern
            setTimeout(() => {
                router.refresh();
                router.push('/profile');
            }, 800);

        } else if (state.message) {
            toast.error(state.message, {
                style: { background: '#18181b', color: '#fff', borderColor: '#7f1d1d' }
            });
            setIsSaving(false);
        }
    }, [state.message, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreviewUrl(URL.createObjectURL(file));
    };

    // SECTION MANAGEMENT
    const addSection = (type: EditableSection['type']) => {
        const id = `new-${Date.now()}`;
        let title = "New Collection";
        if (type === 'movie') title = "Movies";
        if (type === 'tv') title = "TV Shows";
        if (type === 'person') title = "People";

        setEditableSections([...editableSections, { id, title, type, items: [] }]);
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    };

    const moveSection = (index: number, dir: -1 | 1) => {
        const newIndex = index + dir;
        if (newIndex < 0 || newIndex >= editableSections.length) return;

        const updated = [...editableSections];
        // Swap
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        setEditableSections(updated);
    };

    const removeSection = (index: number) => {
        if (confirm("Are you sure you want to delete this section?")) {
            setEditableSections(editableSections.filter((_, i) => i !== index));
        }
    };

    // Username Availability Check
    useEffect(() => {
        if (username === profile.username || username.length < 3) { setAvailability('idle'); return; }
        const handler = setTimeout(() => {
            setAvailability('checking');
            checkUsernameAvailability(username).then(r => setAvailability(r.available ? 'available' : 'taken'));
        }, 500);
        return () => clearTimeout(handler);
    }, [username, profile.username]);

    const handleFormSubmit = (formData: FormData) => {
        setIsSaving(true);

        // Clean data before submit
        const sectionsToSave = editableSections.map(s => ({
            ...s,
            // Map items: crucial step to swap 'id' back to 'tmdb_id' for backend
            items: s.items.map((item, index) => ({
                ...item,
                id: item.tmdb_id,
                rank: index + 1
            }))
        }));

        formData.set('sections_json', JSON.stringify(sectionsToSave));
        formAction(formData);
    };

    return (
        <form action={handleFormSubmit} className="space-y-8 pb-32">

            {/* Top Bar */}
            <div className="flex items-center justify-between sticky top-2 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-3">
                <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    <ArrowLeftIcon className="w-4 h-4" /> Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isSaving || availability === 'taken'}
                    className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-1.5 rounded-sm text-sm font-bold flex items-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                    {isSaving && <LoadingSpinner className="w-4 h-4 text-current" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Profile Info */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col items-center gap-3">
                        <div
                            className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-800 cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Image src={previewUrl || '/placeholder-user.jpg'} alt="Profile" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                <PhotoIcon className="w-8 h-8 text-white" />
                            </div>
                            <input type="file" name="profile_pic" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-indigo-500 hover:text-indigo-400">
                            Change Photo
                        </button>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Display Name</label>
                                <input type="text" name="display_name" defaultValue={profile.display_name} required className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-sm px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Username</label>
                                    {availability === 'taken' && <span className="text-[10px] text-red-500 font-bold">Taken</span>}
                                    {availability === 'available' && <span className="text-[10px] text-green-500 font-bold">Available</span>}
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    required
                                    className={`w-full bg-zinc-50 dark:bg-zinc-950 border rounded-sm px-3 py-2 text-sm outline-none transition-colors ${availability === 'taken' ? 'border-red-500 text-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600'}`}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Bio</label>
                            <textarea name="bio" rows={3} defaultValue={profile.bio || ''} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-sm px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors resize-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sections Area */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                    <h2 className={`${PlayWriteNewZealandFont.className} text-xl font-bold`}>Sections</h2>

                    {/* Add Buttons */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 mr-2 whitespace-nowrap">Add:</span>
                        <button type="button" onClick={() => addSection('mixed')} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" title="Add Mixed Collection"><Bars3Icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400"/></button>
                        <button type="button" onClick={() => addSection('movie')} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" title="Add Movie Collection"><FilmIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400"/></button>
                        <button type="button" onClick={() => addSection('tv')} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" title="Add TV Collection"><TvIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400"/></button>
                        <button type="button" onClick={() => addSection('person')} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors" title="Add People Collection"><UserIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400"/></button>
                    </div>
                </div>

                <div className="space-y-6">
                    {editableSections.map((section, index) => (
                        <SectionEditor
                            key={section.id}
                            index={index}
                            totalSections={editableSections.length}
                            section={section}
                            onUpdate={(s) => {
                                const newSections = [...editableSections];
                                newSections[index] = s;
                                setEditableSections(newSections);
                            }}
                            onRemove={() => removeSection(index)}
                            onMove={(dir) => moveSection(index, dir)}
                        />
                    ))}

                    {editableSections.length === 0 && (
                        <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-md text-center">
                            <p className="text-zinc-500 font-medium">No sections added yet.</p>
                            <p className="text-zinc-400 text-sm mt-1">Use the icons above to create your first collection.</p>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}