import { create } from 'zustand'

interface UIState {
    isModalOpen: boolean
    setModalOpen: (isOpen: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
    isModalOpen: false,
    setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
}))