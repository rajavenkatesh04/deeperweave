import { create } from 'zustand'

interface ImmersiveState {
    isImmersive: boolean
    setImmersive: (active: boolean) => void
}

export const useImmersiveMode = create<ImmersiveState>((set) => ({
    isImmersive: false,
    setImmersive: (active) => set({ isImmersive: active }),
}))