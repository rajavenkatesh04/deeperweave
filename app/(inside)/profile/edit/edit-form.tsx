'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
// 1. IMPORT THIS
import { useQueryClient } from '@tanstack/react-query';
import { Reorder, useDragControls } from 'framer-motion';
import { UserProfile, ProfileSection } from '@/lib/definitions';
import { updateProfile, EditProfileState, checkUsernameAvailability } from '@/lib/actions/profile-actions';
import { searchCinematic, type CinematicSearchResult } from '@/lib/actions/cinematic-actions';
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import LoadingSpinner from '@/app/ui/loading-spinner';

// ... (Keep existing Icons and Types exactly the same) ...
import {
    MdSearch, MdOutlineMovie, MdOutlineTv, MdOutlinePerson, MdOutlineViewList,
    MdAdd, MdClose, MdArrowBack, MdOutlineDelete, MdKeyboardArrowUp,
    MdKeyboardArrowDown, MdDragIndicator, MdOutlineAddAPhoto, MdCheckCircle,
    MdCancel, MdEdit
} from 'react-icons/md';

const MAX_ITEMS_PER_SECTION = 6;

type EditableItem = {
    id: number | string;
    tmdb_id: number;
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

// ... (Keep SearchModal, DraggableItem, SectionEditor components exactly the same) ...
function SearchModal({ isOpen, sectionType, onClose, onSelect }: any) {
    // ... Copy your existing SearchModal code ...
    // (I am omitting the body here to save space, stick to your previous code for these sub-components)
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CinematicSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
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
                const filtered = data.filter((item: any) => {
                    if (sectionType === 'movie') return item.media_type === 'movie';
                    if (sectionType === 'tv') return item.media_type === 'tv';
                    if (sectionType === 'person') return item.media_type === 'person';
                    return item.media_type !== 'person';
                });
                setResults(filtered);
            } catch (e) {
                toast.error("Search failed");
            } finally {
                setLoading(false);
            }
        }, 400);
        return () => clearTimeout(handler);
    }, [query, sectionType]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-50 dark:bg-zinc-950 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="relative flex-1">
                    <MdSearch className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={`Search ${sectionType}...`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-zinc-100 dark:bg-zinc-900 border-none rounded-lg outline-none text-base placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-100"
                    />
                </div>
                <button onClick={onClose} className="p-2 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors font-medium text-sm">Cancel</button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 bg-zinc-50 dark:bg-zinc-950">
                {loading ? <div className="py-12 flex justify-center"><LoadingSpinner /></div> : (
                    <div className="space-y-2">
                        {results.map((item: any) => (
                            <button key={item.id} onClick={() => { onSelect(item); onClose(); }} className="w-full flex items-center gap-4 p-2 hover:bg-white dark:hover:bg-zinc-900 active:bg-zinc-200 dark:active:bg-zinc-800 rounded-xl transition-colors text-left group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                                <div className="w-10 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex-shrink-0 relative overflow-hidden shadow-sm">
                                    {(item.poster_path || item.profile_path) ? (
                                        <Image src={`https://image.tmdb.org/t/p/w92${item.poster_path || item.profile_path}`} alt="" fill className="object-cover" />
                                    ) : <MdOutlineMovie className="w-5 h-5 m-auto text-zinc-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{item.title || item.name}</h4>
                                    <p className="text-xs text-zinc-500">{item.media_type}</p>
                                </div>
                                <MdAdd className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function DraggableItem({ item, onRemove }: any) {
    const dragControls = useDragControls();
    return (
        <Reorder.Item value={item} dragListener={false} dragControls={dragControls} className="flex items-center gap-3 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm relative group select-none">
            <div onPointerDown={(e) => dragControls.start(e)} className="p-2 -ml-2 text-zinc-400 cursor-grab active:cursor-grabbing hover:text-zinc-600 dark:hover:text-zinc-200 touch-none">
                <MdDragIndicator className="w-6 h-6" />
            </div>
            <div className="w-10 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-lg relative overflow-hidden flex-shrink-0 border border-zinc-100 dark:border-zinc-800">
                {item.image_path ? <Image src={`https://image.tmdb.org/t/p/w92${item.image_path}`} alt="" fill className="object-cover" /> : <MdOutlineMovie className="w-4 h-4 m-auto text-zinc-400"/>}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{item.title}</p>
                <p className="text-xs text-zinc-500">{item.type} {item.year && `• ${item.year}`}</p>
            </div>
            <button type="button" onClick={onRemove} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"><MdClose className="w-5 h-5" /></button>
        </Reorder.Item>
    );
}

function SectionEditor({ section, index, totalSections, onUpdate, onRemove, onMove }: any) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    // ... keep logic ...
    const handleAddItem = (result: any) => {
        if (section.items.length >= MAX_ITEMS_PER_SECTION) { toast.error("Max items reached"); return; }
        const newItem: EditableItem = {
            id: `${result.id}-${Date.now()}`,
            tmdb_id: result.id,
            title: result.title || result.name,
            image_path: (result.poster_path || result.profile_path)?.replace('https://image.tmdb.org/t/p/w500', ''),
            type: result.media_type,
            year: result.release_date?.split('-')[0]
        };
        onUpdate({ ...section, items: [...section.items, newItem] });
    };

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <SearchModal isOpen={isSearchOpen} sectionType={section.type} onClose={() => setIsSearchOpen(false)} onSelect={handleAddItem} />
            <div className="flex items-center gap-3 p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500"><MdOutlineViewList className="w-5 h-5"/></div>
                <input type="text" value={section.title} onChange={(e) => onUpdate({...section, title: e.target.value})} className="flex-1 bg-transparent font-bold text-base outline-none text-zinc-900 dark:text-zinc-100" placeholder="Collection Name" />
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-20"><MdKeyboardArrowUp className="w-5 h-5"/></button>
                    <button type="button" onClick={() => onMove(1)} disabled={index === totalSections - 1} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-20"><MdKeyboardArrowDown className="w-5 h-5"/></button>
                    <button type="button" onClick={onRemove} className="p-1.5 text-zinc-400 hover:text-red-500"><MdOutlineDelete className="w-5 h-5"/></button>
                </div>
            </div>
            <div className="p-3 space-y-2">
                <Reorder.Group axis="y" values={section.items} onReorder={(newOrder) => onUpdate({ ...section, items: newOrder })} className="space-y-2">
                    {section.items.map((item: any) => (
                        <DraggableItem key={item.id} item={item} onRemove={() => onUpdate({ ...section, items: section.items.filter((i:any) => i.id !== item.id) })} />
                    ))}
                </Reorder.Group>
                {section.items.length < MAX_ITEMS_PER_SECTION && (
                    <button type="button" onClick={() => setIsSearchOpen(true)} className="w-full py-3 flex items-center justify-center gap-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-sm font-semibold"><MdAdd className="w-5 h-5" /> Add Item</button>
                )}
            </div>
        </div>
    );
}

// --- MAIN FORM ---

export default function ProfileEditForm({ profile, sections }: { profile: UserProfile; sections: ProfileSection[] }) {
    const router = useRouter();
    // 2. INITIALIZE QUERY CLIENT
    const queryClient = useQueryClient();

    const [previewUrl, setPreviewUrl] = useState<string | null>(profile.profile_pic_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [username, setUsername] = useState(profile.username);
    const [availability, setAvailability] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [editableSections, setEditableSections] = useState<EditableSection[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (sections.length > 0) {
            setEditableSections(sections.map(s => ({
                id: s.id,
                title: s.title,
                type: s.type,
                items: s.items.sort((a, b) => a.rank - b.rank).map((item, idx) => {
                    const obj = item.movie || item.series || item.person;
                    if (!obj) return null;
                    const title = 'title' in obj ? obj.title : obj.name;
                    const imagePath = 'poster_url' in obj
                        ? obj.poster_url?.replace('https://image.tmdb.org/t/p/w500', '')
                        : obj.profile_path?.replace('https://image.tmdb.org/t/p/w500', '');

                    return {
                        id: `${obj.tmdb_id}-${idx}-${Date.now()}`,
                        tmdb_id: obj.tmdb_id,
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreviewUrl(URL.createObjectURL(file));
    };

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
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        setEditableSections(updated);
    };

    const removeSection = (index: number) => {
        if (confirm("Delete this section?")) {
            setEditableSections(editableSections.filter((_, i) => i !== index));
        }
    };

    useEffect(() => {
        if (username === profile.username || username.length < 3) { setAvailability('idle'); return; }
        const handler = setTimeout(() => {
            setAvailability('checking');
            checkUsernameAvailability(username).then(r => setAvailability(r.available ? 'available' : 'taken'));
        }, 500);
        return () => clearTimeout(handler);
    }, [username, profile.username]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData(e.currentTarget);
        const sectionsToSave = editableSections.map(s => ({
            ...s,
            items: s.items.map((item, index) => ({
                ...item,
                id: item.tmdb_id,
                rank: index + 1
            }))
        }));
        formData.set('sections_json', JSON.stringify(sectionsToSave));

        try {
            const result = await updateProfile({ message: null }, formData);

            if (result.message === 'Success') {
                // 3. THIS IS THE CRITICAL FIX
                // Wipe the TanStack cache so when we land on /profile, it fetches FRESH data.
                await queryClient.invalidateQueries();

                // Force Next.js Router Cache to clear
                router.refresh();

                toast.success("Profile updated!", {
                    duration: 4000,
                    style: { background: '#18181b', color: '#fff', borderColor: '#27272a' }
                });

                // Redirect
                router.push('/profile');
            } else {
                toast.error(result.message || "Failed to update");
                setIsSaving(false);
            }
        } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred.");
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-32">
            <div className="flex items-center justify-between sticky top-2 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-3">
                <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    <MdArrowBack className="w-4 h-4" /> Cancel
                </Link>
                <button type="submit" disabled={isSaving || availability === 'taken'} className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity min-w-[140px]">
                    {isSaving ? <><LoadingSpinner className="w-4 h-4" /><span>Saving...</span></> : 'Save Changes'}
                </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-800 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                            <Image src={previewUrl || '/placeholder-user.jpg'} alt="Profile" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><MdOutlineAddAPhoto className="w-8 h-8 text-white" /></div>
                            <input type="file" name="profile_pic" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full"><MdEdit className="w-3.5 h-3.5" /> Change Photo</button>
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500">Display Name</label>
                                <input type="text" name="display_name" defaultValue={profile.display_name} required className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between"><label className="text-xs font-bold text-zinc-500">Username</label>{availability === 'taken' && <span className="text-xs text-red-500 font-bold flex items-center gap-1"><MdCancel className="w-3 h-3"/> Taken</span>}{availability === 'available' && <span className="text-xs text-green-500 font-bold flex items-center gap-1"><MdCheckCircle className="w-3 h-3"/> Available</span>}</div>
                                <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} required className={`w-full bg-zinc-50 dark:bg-zinc-950 border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${availability === 'taken' ? 'border-red-500 text-red-500' : 'border-zinc-200 dark:border-zinc-800'}`} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500">Bio</label>
                            <textarea name="bio" rows={3} defaultValue={profile.bio || ''} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none resize-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                    <h2 className={`${PlayWriteNewZealandFont.className} text-xl font-bold`}>Sections</h2>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        <span className="text-xs font-bold text-zinc-400 mr-2 whitespace-nowrap">Add:</span>
                        <button type="button" onClick={() => addSection('mixed')} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"><MdOutlineViewList className="w-5 h-5"/></button>
                        <button type="button" onClick={() => addSection('movie')} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"><MdOutlineMovie className="w-5 h-5"/></button>
                        <button type="button" onClick={() => addSection('tv')} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"><MdOutlineTv className="w-5 h-5"/></button>
                        <button type="button" onClick={() => addSection('person')} className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"><MdOutlinePerson className="w-5 h-5"/></button>
                    </div>
                </div>
                <div className="space-y-6">
                    {editableSections.map((section, index) => (
                        <SectionEditor key={section.id} index={index} totalSections={editableSections.length} section={section} onUpdate={(s: any) => { const newSections = [...editableSections]; newSections[index] = s; setEditableSections(newSections); }} onRemove={() => removeSection(index)} onMove={(dir: any) => moveSection(index, dir)} />
                    ))}
                    {editableSections.length === 0 && <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center"><p className="text-zinc-500">No sections added.</p></div>}
                </div>
            </div>
        </form>
    );
}