'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserProfile, ProfileSection } from '@/lib/definitions';
import { updateProfile, EditProfileState, checkUsernameAvailability } from '@/lib/actions/profile-actions';
import { searchCinematic, type CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import {
    PhotoIcon, CheckCircleIcon, XCircleIcon, FilmIcon,
    XMarkIcon, MagnifyingGlassIcon, ArrowLeftIcon, PlusIcon,
    ArrowPathIcon, TrashIcon, Bars3Icon, UserIcon, TvIcon,
    ChevronUpIcon, ChevronDownIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/app/ui/loading-spinner';
import { clsx } from 'clsx';

// --- Types for local state ---
type EditableItem = {
    id: number | string;
    title: string;
    image_path: string | null;
    type: 'movie' | 'tv' | 'person';
    year?: string;
};

type EditableSection = {
    id: string; // temp id for key
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
            inputRef.current?.focus();
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (query.trim().length < 2) return;
            setLoading(true);
            try {
                // Fetch basic results
                const data = await searchCinematic(query);

                // Filter based on Section Type
                const filtered = data.filter(item => {
                    if (sectionType === 'movie') return item.media_type === 'movie';
                    if (sectionType === 'tv') return item.media_type === 'tv';
                    if (sectionType === 'person') return item.media_type === 'person';
                    return item.media_type !== 'person'; // Mixed usually excludes people unless specified
                });

                setResults(filtered);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }, 500);
        return () => clearTimeout(handler);
    }, [query, sectionType]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] rounded-xl">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="font-bold">Add to {sectionType === 'mixed' ? 'Collection' : sectionType} list</h3>
                    <button onClick={onClose}><XMarkIcon className="w-5 h-5" /></button>
                </div>
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 relative">
                    <MagnifyingGlassIcon className="absolute left-7 top-7 w-5 h-5 text-zinc-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-12 pl-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg outline-none"
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? <div className="py-10 text-center"><LoadingSpinner/></div> :
                        results.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { onSelect(item); onClose(); }}
                                className="w-full flex items-center gap-4 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-left"
                            >
                                {item.poster_path || item.profile_path ? (
                                    <Image src={`https://image.tmdb.org/t/p/w92${item.poster_path || item.profile_path}`} alt={item.title || item.name} width={40} height={60} className="rounded object-cover" />
                                ) : (
                                    <div className="w-10 h-[60px] bg-zinc-800 rounded flex items-center justify-center"><FilmIcon className="w-4 h-4 text-zinc-600"/></div>
                                )}
                                <div>
                                    <h4 className="font-bold text-sm">{item.title || item.name}</h4>
                                    <p className="text-xs text-zinc-500 uppercase">{item.media_type} • {item.release_date?.split('-')[0]}</p>
                                </div>
                            </button>
                        ))}
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
        newItems[activeSlot] = {
            id: result.id,
            title: result.title || result.name,
            image_path: result.poster_path || result.profile_path,
            type: result.media_type as 'movie' | 'tv' | 'person',
            year: result.release_date?.split('-')[0]
        };
        onUpdate({ ...section, items: newItems });
    };

    const handleRemoveItem = (slotIndex: number) => {
        const newItems = [...section.items];
        newItems[slotIndex] = null;
        onUpdate({ ...section, items: newItems });
    };

    return (
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 relative group transition-all hover:border-zinc-400 dark:hover:border-zinc-600">
            <SearchModal
                isOpen={isSearchOpen}
                sectionType={section.type}
                onClose={() => setIsSearchOpen(false)}
                onSelect={handleAddItem}
            />

            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500">
                        {section.type === 'movie' && <FilmIcon className="w-5 h-5"/>}
                        {section.type === 'tv' && <TvIcon className="w-5 h-5"/>}
                        {section.type === 'person' && <UserIcon className="w-5 h-5"/>}
                        {section.type === 'mixed' && <Bars3Icon className="w-5 h-5"/>}
                    </div>
                    <input
                        type="text"
                        value={section.title}
                        onChange={(e) => onUpdate({...section, title: e.target.value})}
                        className="bg-transparent text-xl font-bold border-b border-transparent hover:border-zinc-700 focus:border-white outline-none w-full"
                    />
                </div>
                <div className="flex items-center gap-1 ml-4">
                    <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="p-2 hover:bg-zinc-800 rounded disabled:opacity-30"><ChevronUpIcon className="w-4 h-4"/></button>
                    <button type="button" disabled={index === totalSections - 1} onClick={() => onMove(1)} className="p-2 hover:bg-zinc-800 rounded disabled:opacity-30"><ChevronDownIcon className="w-4 h-4"/></button>
                    <div className="w-px h-4 bg-zinc-800 mx-2"/>
                    <button type="button" onClick={onRemove} className="p-2 text-red-500 hover:bg-red-950/30 rounded"><TrashIcon className="w-4 h-4"/></button>
                </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map(i => {
                    const item = section.items[i];
                    return (
                        <div key={i} className="aspect-[2/3] relative bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 group/item">
                            {item ? (
                                <>
                                    {item.image_path ? (
                                        <Image src={`https://image.tmdb.org/t/p/w342${item.image_path}`} alt={item.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-600"><FilmIcon className="w-8 h-8"/></div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                                        <p className="text-xs font-bold text-white line-clamp-2 mb-2">{item.title}</p>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => { setActiveSlot(i); setIsSearchOpen(true); }} className="p-2 bg-white text-black rounded-full hover:scale-110 transition"><ArrowPathIcon className="w-4 h-4"/></button>
                                            <button type="button" onClick={() => handleRemoveItem(i)} className="p-2 bg-red-600 text-white rounded-full hover:scale-110 transition"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <button type="button" onClick={() => { setActiveSlot(i); setIsSearchOpen(true); }} className="w-full h-full flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                                    <PlusIcon className="w-8 h-8 mb-1 opacity-50"/>
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Add</span>
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

    // Sections State
    const [editableSections, setEditableSections] = useState<EditableSection[]>([]);

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
                    return {
                        id: obj.tmdb_id,
                        title: 'title' in obj ? obj.title : obj.name,
                        image_path: 'poster_url' in obj ? obj.poster_url?.replace('https://image.tmdb.org/t/p/w500', '') : obj.profile_path,
                        type: item.item_type,
                        year: 'release_date' in obj ? obj.release_date?.split('-')[0] : undefined
                    } as EditableItem;
                })
            })));
        } else {
            // Default Start: Top 3 Favorites
            setEditableSections([{ id: 'default-1', title: 'Top 3 Favorites', type: 'mixed', items: [null, null, null] }]);
        }
    }, [sections]);

    // Handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreviewUrl(URL.createObjectURL(file));
    };

    const addSection = (type: EditableSection['type']) => {
        const id = `new-${Date.now()}`;
        let title = "New List";
        if (type === 'movie') title = "Top Movies";
        if (type === 'tv') title = "Top Series";
        if (type === 'person') title = "Favorite Stars";
        setEditableSections([...editableSections, { id, title, type, items: [null, null, null] }]);
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

    // Username Check
    useEffect(() => {
        if (username === profile.username || username.length < 3) { setAvailability('idle'); return; }
        const handler = setTimeout(() => {
            setAvailability('checking');
            checkUsernameAvailability(username).then(r => setAvailability(r.available ? 'available' : 'taken'));
        }, 500);
        return () => clearTimeout(handler);
    }, [username, profile.username]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/profile" className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity">
                        <ArrowLeftIcon className="w-4 h-4" /> Back to Profile
                    </Link>
                    <span className="text-sm font-medium opacity-50">Editing Profile</span>
                </div>
            </header>

            <div className="pt-24 max-w-4xl mx-auto px-4">
                <form action={formAction} className="space-y-12">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start">
                        {/* Avatar */}
                        <div className="flex justify-center md:justify-start">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-900 shadow-xl overflow-hidden bg-zinc-200 relative">
                                    <Image src={previewUrl || '/placeholder-user.jpg'} alt="Profile" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><PhotoIcon className="w-8 h-8 text-white" /></div>
                                </div>
                                <input type="file" name="profile_pic" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Display Name</label>
                                    <input type="text" name="display_name" defaultValue={profile.display_name} required className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-2 focus:border-zinc-900 dark:focus:border-white outline-none rounded-none" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Username</label>
                                        {availability === 'taken' && <span className="text-xs text-red-500 flex items-center gap-1"><XCircleIcon className="w-3 h-3"/> Taken</span>}
                                        {availability === 'available' && <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircleIcon className="w-3 h-3"/> Available</span>}
                                    </div>
                                    <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} required className={`w-full bg-transparent border-b py-2 outline-none rounded-none ${availability === 'taken' ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white'}`} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Bio</label>
                                <textarea name="bio" rows={3} defaultValue={profile.bio || ''} className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 py-2 focus:border-zinc-900 dark:focus:border-white outline-none resize-none rounded-none" placeholder="Your story..." />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-zinc-200 dark:border-zinc-800 my-8"/>

                    {/* Dynamic Sections */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className={`${PlayWriteNewZealandFont.className} text-2xl font-bold`}>Profile Showcase</h2>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => addSection('mixed')} className="px-3 py-1.5 text-xs font-bold uppercase bg-zinc-100 dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">+ Mixed</button>
                                <button type="button" onClick={() => addSection('movie')} className="px-3 py-1.5 text-xs font-bold uppercase bg-zinc-100 dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">+ Movie</button>
                                <button type="button" onClick={() => addSection('tv')} className="px-3 py-1.5 text-xs font-bold uppercase bg-zinc-100 dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">+ TV</button>
                                <button type="button" onClick={() => addSection('person')} className="px-3 py-1.5 text-xs font-bold uppercase bg-zinc-100 dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">+ Person</button>
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
                        </div>
                    </div>

                    {/* Hidden Input for JSON Data */}
                    <input type="hidden" name="sections_json" value={JSON.stringify(editableSections)} />

                    {/* Footer Actions */}
                    <div className="sticky bottom-4 z-40 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black p-4 rounded-xl flex justify-between items-center shadow-2xl">
                        <span className="text-sm font-medium px-2">Unsaved Changes</span>
                        <div className="flex gap-4">
                            <Link href="/profile" className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-bold">Discard</Link>
                            <button type="button" onClick={(e) => {
                                const form = e.currentTarget.closest('form');
                                if (form) form.requestSubmit();
                            }} disabled={state.message === 'Success'} className="px-6 py-2 rounded-lg bg-white text-black dark:bg-black dark:text-white text-sm font-bold hover:scale-105 transition-transform">
                                {state.message === 'Success' ? 'Saved!' : 'Save Profile'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}