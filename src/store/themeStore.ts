// src/store/themeStore.ts
import { create } from 'zustand';
import { darkTheme, lightTheme, Theme } from '../config/theme';

type ThemeState = {
  theme: Theme;
  mode: 'dark' | 'light';
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: darkTheme,
  mode: 'dark',
  toggleTheme: () => {
    const current = get().mode;
    const next = current === 'dark' ? 'light' : 'dark';
    set({
      mode: next,
      theme: next === 'dark' ? darkTheme : lightTheme,
    });
  },
}));
