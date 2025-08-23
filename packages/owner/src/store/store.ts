import { create } from 'zustand';

type ColorModeState = {
  isNightMode: boolean;
  toggleColorMode: (isNightMode: boolean) => void;
};

export const useColorModeStore = create<ColorModeState>((set) => ({
    isNightMode: false,
    toggleColorMode: (isNightMode: boolean) => set({ isNightMode }),
}));
