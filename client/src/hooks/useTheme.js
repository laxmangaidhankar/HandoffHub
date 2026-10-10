import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const initializeTheme = () => {
  try {
    const stored = localStorage.getItem('handoffhub-theme');
    if (stored) {
      const state = JSON.parse(stored).state;
      if (state && state.theme) {
        document.documentElement.setAttribute('data-theme', state.theme);
        return;
      }
    }
  } catch {
    // Ignore
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
};

export const useTheme = create(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', newTheme);
          return { theme: newTheme };
        }),
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
    }),
    {
      name: 'handoffhub-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);
