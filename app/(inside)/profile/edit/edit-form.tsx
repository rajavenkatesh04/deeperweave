'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { UserProfile, ProfileSection } from '@/lib/definitions';
import { updateProfile, EditProfileState, checkUsernameAvailability } from '@/lib/actions/profile-actions';
import { searchCinematic, type CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import {
    PhotoIcon, CheckCircleIcon, XCircleIcon, FilmIcon,
    XMarkIcon, ArrowLeftIcon, PlusIcon,
    ArrowPathIcon, TrashIcon, Bars3Icon, UserIcon, TvIcon,
    ChevronUpIcon, ChevronDownIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';

// --- Types ---
type EditableItem = {
    id: number | string;
    title: string;
    image_path: string | null;
    type: 'movie' | 'tv' | 'person';
    year?: string;
};

type EditableSection = {
    id: string;
    title: string;
    type: 'mixed' | 'movie' | 'tv' | 'person';
    items: (EditableItem | null)[];
};

// --- SUB-COMPONENTS ---

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

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setResults([]);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (query.trim().length < 2) return;
            setLoading(true);
            try {
                const data = await searchCinematic(query);
                const filtered = data.filter(item => {
                    if (sectionType === 'movie') return item.media_type === 'movie';
                    if (sectionType === 'tv') return item.media_type === 'tv';
                    if (sectionType === 'person') return item.media_type === 'person';
                    return item.media_type !== 'person';
                });
                setResults(filtered);
            } catch (e) {
                toast.error("Failed to search. Please try again.");
            } finally {
                setLoading(false);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [query, sectionType]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-950/80 backdrop-blur-sm flex items-start md:items-center justify-center animate-in fade-in duration-200">
            {/* Full screen on mobile, modal on desktop */}
            <div className="w-full h-full md:h-auto md:max-h-[85vh] md:max-w-xl bg-white dark:bg-zinc-900 md:border border-zinc-200 dark:border-zinc-800 md:rounded-lg shadow-2xl overflow-hidden flex flex-col">

                <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 bg-white dark:bg-zinc-900 sticky top-0 z-10">
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full h-10 bg-transparent outline-none text-base placeholder:text-zinc-500"
                        />
                    </div>
                    {loading && <LoadingSpinner className="w-4 h-4 text-zinc-500" />}
                </div>

                <div className="flex-1 overflow-y-auto p-2 bg-zinc-50 dark:bg-zinc-950">
                    {results.length === 0 && !loading && query.length > 1 && (
                        <div className="text-center py-10 text-zinc-500 text-sm">No results found</div>
                    )}
                    <div className="space-y-1">
                        {results.map((item) => {
                            const imagePath = item.poster_path || item.profile_path;
                            const displayTitle = item.title || item.name || 'Unknown';
                            const year = item.release_date?.split('-')[0] || '';

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => { onSelect(item); onClose(); }}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors text-left group"
                                >
                                    <div className="w-10 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-sm flex-shrink-0 relative overflow-hidden">
                                        {imagePath ? (
                                            <Image src={`https://image.tmdb.org/t/p/w92${imagePath}`} alt="" fill className="object-cover" />
                                        ) : <FilmIcon className="w-4 h-4 m-auto text-zinc-400"/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm truncate text-zinc-900 dark:text-zinc-100">{displayTitle}</h4>
                                        <p className="text-xs text-zinc-500">{item.media_type} {year && `• ${year}`}</p>
                                    </div>
                                    <PlusIcon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionEditor({
                           section,
                           index,
                           onUpdate,
                           onRemove,
                           onMove,
                           totalSections
                       }: {
    section: EditableSection,
    index: number,
    onUpdate: (s: EditableSection) => void,
    onRemove: () => void,
    onMove: (dir: -1 | 1) => void,
    totalSections: number
}) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeSlot, setActiveSlot] = useState<number>(0);

    const handleAddItem = (result: CinematicSearchResult) => {
        const newItems = [...section.items];
        const title = result.title || result.name || 'Unknown';
        const imagePath = result.poster_path || result.profile_path || null;

        newItems[activeSlot] = {
            id: result.id,
            title: title,
            image_path: imagePath ? imagePath.replace('https://image.tmdb.org/t/p/w500', '') : null,
            type: result.media_type as 'movie' | 'tv' | 'person',
            year: result.release_date?.split('-')[0]
        };
        onUpdate({ ...section, items: newItems });
        toast.success(`Added ${title}`);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <SearchModal
                isOpen={isSearchOpen}
                sectionType={section.type}
                onClose={() => setIsSearchOpen(false)}
                onSelect={handleAddItem}
            />

            {/* Header */}
            <div className="flex items-center gap-3 p-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="p-1.5 bg-white dark:bg-zinc-800 rounded-sm border border-zinc-200 dark:border-zinc-700 text-zinc-500">
                    {section.type === 'movie' && <FilmIcon className="w-4 h-4"/>}
                    {section.type === 'tv' && <TvIcon className="w-4 h-4"/>}
                    {section.type === 'person' && <UserIcon className="w-4 h-4"/>}
                    {section.type === 'mixed' && <Bars3Icon className="w-4 h-4"/>}
                </div>

                <input
                    type="text"
                    value={section.title}
                    onChange={(e) => onUpdate({...section, title: e.target.value})}
                    className="flex-1 bg-transparent font-semibold text-sm outline-none placeholder:text-zinc-400"
                    placeholder="Section Title"
                />

                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => onMove(-1)} disabled={index === 0} title="Move Section Up" className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-sm disabled:opacity-20 transition-colors">
                        <ChevronUpIcon className="w-4 h-4"/>
                    </button>
                    <button type="button" onClick={() => onMove(1)} disabled={index === totalSections - 1} title="Move Section Down" className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-sm disabled:opacity-20 transition-colors">
                        <ChevronDownIcon className="w-4 h-4"/>
                    </button>
                    <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1"/>
                    <button type="button" onClick={onRemove} title="Delete Section" className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-sm transition-colors">
                        <TrashIcon className="w-4 h-4"/>
                    </button>
                </div>
            </div>

            {/* Items */}
            <div className="grid grid-cols-3 gap-2 p-3">
                {[0, 1, 2].map(i => {
                    const item = section.items[i];
                    return (
                        <div key={i} className="aspect-[2/3] relative bg-zinc-100 dark:bg-zinc-800 rounded-sm overflow-hidden border border-zinc-200 dark:border-zinc-700 group/item">
                            {item ? (
                                <>
                                    {item.image_path ? (
                                        <Image src={`https://image.tmdb.org/t/p/w342${item.image_path}`} alt={item.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><FilmIcon className="w-6 h-6 text-zinc-300"/></div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { setActiveSlot(i); setIsSearchOpen(true); }}
                                            className="p-2 bg-white text-black rounded-full hover:scale-105 transition shadow-sm"
                                            title="Replace Item"
                                        >
                                            <ArrowPathIcon className="w-4 h-4"/>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newItems = [...section.items];
                                                newItems[i] = null;
                                                onUpdate({ ...section, items: newItems });
                                            }}
                                            className="p-2 bg-red-600 text-white rounded-full hover:scale-105 transition shadow-sm"
                                            title="Remove Item"
                                        >
                                            <TrashIcon className="w-4 h-4"/>
                                        </button>
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 p-1 bg-gradient-to-t from-black/80 to-transparent md:hidden">
                                        <p className="text-[10px] text-white truncate text-center">{item.title}</p>
                                    </div>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => { setActiveSlot(i); setIsSearchOpen(true); }}
                                    className="w-full h-full flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                    title="Add Item"
                                >
                                    <PlusIcon className="w-6 h-6 opacity-50"/>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// --- MAIN FORM ---

export default function ProfileEditForm({ profile, sections }: { profile: UserProfile; sections: ProfileSection[] }) {
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
                items: [0, 1, 2].map(i => {
                    const item = s.items.find(it => it.rank === i + 1);
                    if (!item) return null;
                    const obj = item.movie || item.series || item.person;
                    if (!obj) return null;
                    const title = 'title' in obj ? obj.title : obj.name;
                    const imagePath = 'poster_url' in obj
                        ? obj.poster_url?.replace('https://image.tmdb.org/t/p/w500', '')
                        : obj.profile_path?.replace('https://image.tmdb.org/t/p/w500', '');

                    return {
                        id: obj.tmdb_id, title, image_path: imagePath, type: item.item_type,
                        year: 'release_date' in obj ? obj.release_date?.split('-')[0] : undefined
                    } as EditableItem;
                })
            })));
        } else {
            setEditableSections([{ id: 'default-1', title: 'Favorites', type: 'mixed', items: [null, null, null] }]);
        }
    }, [sections]);

    // Toast Feedback
    useEffect(() => {
        if (state.message === 'Success') {
            toast.success("Profile saved successfully");
            setIsSaving(false);
        } else if (state.message) {
            toast.error(state.message);
            setIsSaving(false);
        }
    }, [state.message]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreviewUrl(URL.createObjectURL(file));
    };

    const addSection = (type: EditableSection['type']) => {
        const id = `new-${Date.now()}`;
        setEditableSections([...editableSections, { id, title: "New Section", type, items: [null, null, null] }]);
        // Minimal timeout to allow render before scroll
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
    };

    const updateSection = (index: number, newData: EditableSection) => {
        const updated = [...editableSections];
        updated[index] = newData;
        setEditableSections(updated);
    };

    const removeSection = (index: number) => {
        if (confirm("Delete this section?")) {
            setEditableSections(editableSections.filter((_, i) => i !== index));
        }
    };

    const moveSection = (index: number, dir: -1 | 1) => {
        const newIndex = index + dir;
        if (newIndex < 0 || newIndex >= editableSections.length) return;
        const updated = [...editableSections];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        setEditableSections(updated);
    };

    // Username Check logic remains same
    useEffect(() => {
        if (username === profile.username || username.length < 3) { setAvailability('idle'); return; }
        const handler = setTimeout(() => {
            setAvailability('checking');
            checkUsernameAvailability(username).then(r => setAvailability(r.available ? 'available' : 'taken'));
        }, 500);
        return () => clearTimeout(handler);
    }, [username, profile.username]);

    return (
        <form action={formAction} onSubmit={() => setIsSaving(true)} className="space-y-8">

            {/* Top Controls - Squarish, integrated */}
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 sticky top-2 z-30 shadow-sm">
                <h1 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Edit Profile</h1>
                <div className="flex items-center gap-3">
                    <Link href="/profile" className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSaving || availability === 'taken'}
                        className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold rounded-sm disabled:opacity-50 hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors"
                    >
                        {isSaving && <LoadingSpinner className="w-3 h-3" />}
                        {isSaving ? 'Saving' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-8">

                {/* Avatar Column */}
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div
                        className="group relative w-32 h-32 md:w-48 md:h-48 cursor-pointer rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image src={previewUrl || '/placeholder-user.jpg'} alt="Profile" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <PhotoIcon className="w-8 h-8 text-white" />
                        </div>
                        <input type="file" name="profile_pic" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>
                    <p className="text-xs text-zinc-500 text-center md:text-left">Click image to update</p>
                </div>

                {/* Inputs Column */}
                <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Display Name</label>
                            <input type="text" name="display_name" defaultValue={profile.display_name} required className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm focus:border-zinc-900 dark:focus:border-zinc-100 outline-none transition-colors" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Username</label>
                                {availability === 'taken' && <span className="text-xs text-red-500 flex items-center gap-1"><XCircleIcon className="w-3 h-3"/> Taken</span>}
                                {availability === 'available' && <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircleIcon className="w-3 h-3"/> Ok</span>}
                            </div>
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                required
                                className={`w-full bg-transparent border rounded-md px-3 py-2 text-sm outline-none transition-colors ${availability === 'taken' ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-100'}`}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Bio</label>
                        <textarea name="bio" rows={4} defaultValue={profile.bio || ''} className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm focus:border-zinc-900 dark:focus:border-zinc-100 outline-none resize-none transition-colors" placeholder="Write something..." />
                    </div>
                </div>
            </div>

            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

            {/* Sections Area */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className={`${PlayWriteNewZealandFont.className} text-xl md:text-2xl font-bold`}>Sections</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 mr-2 hidden sm:inline">Add Section:</span>
                        {/* Compact + Icons */}
                        <button type="button" onClick={() => addSection('mixed')} title="Add Mixed Section" className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-sm border border-zinc-200 dark:border-zinc-700 transition-colors"><Bars3Icon className="w-4 h-4"/></button>
                        <button type="button" onClick={() => addSection('movie')} title="Add Movie Section" className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-sm border border-zinc-200 dark:border-zinc-700 transition-colors"><FilmIcon className="w-4 h-4"/></button>
                        <button type="button" onClick={() => addSection('tv')} title="Add TV Section" className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-sm border border-zinc-200 dark:border-zinc-700 transition-colors"><TvIcon className="w-4 h-4"/></button>
                        <button type="button" onClick={() => addSection('person')} title="Add Person Section" className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-sm border border-zinc-200 dark:border-zinc-700 transition-colors"><UserIcon className="w-4 h-4"/></button>
                    </div>
                </div>

                <div className="space-y-6">
                    {editableSections.map((section, index) => (
                        <SectionEditor
                            key={section.id}
                            index={index}
                            section={section}
                            onUpdate={(s) => updateSection(index, s)}
                            onRemove={() => removeSection(index)}
                            onMove={(dir) => moveSection(index, dir)}
                            totalSections={editableSections.length}
                        />
                    ))}
                    {editableSections.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-md">
                            <p className="text-zinc-500 text-sm">No sections yet. Click an icon above to add one.</p>
                        </div>
                    )}
                </div>
            </div>

            <input type="hidden" name="sections_json" value={JSON.stringify(editableSections)} />
        </form>
    );
}