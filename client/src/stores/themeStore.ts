import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeState, Theme } from '../types/theme';
import { themes, defaultTheme } from '../themes';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: defaultTheme.id,
      themes,
      
      setTheme: (themeId: string) => {
        const theme = get().themes[themeId];
        if (theme) {
          set({ currentTheme: themeId });
          get().applyTheme(theme);
        }
      },
      
      getTheme: (themeId?: string) => {
        const id = themeId || get().currentTheme;
        return get().themes[id] || defaultTheme;
      },
      
      applyTheme: (theme: Theme) => {
        const root = document.documentElement;
        
        // Apply CSS custom properties
        root.style.setProperty('--theme-bg', theme.colors.bg);
        root.style.setProperty('--theme-bg-alt', theme.colors.bgAlt);
        root.style.setProperty('--theme-border', theme.colors.border);
        root.style.setProperty('--theme-surface', theme.colors.surface);
        root.style.setProperty('--theme-text', theme.colors.text);
        root.style.setProperty('--theme-text-dim', theme.colors.textDim);
        root.style.setProperty('--theme-accent', theme.colors.accent);
        root.style.setProperty('--theme-warning', theme.colors.warning);
        root.style.setProperty('--theme-error', theme.colors.error);
        root.style.setProperty('--theme-info', theme.colors.info);
        root.style.setProperty('--theme-success', theme.colors.success);
        
        // Apply theme class to document
        root.className = root.className.replace(/theme-\w+/g, '');
        root.classList.add(`theme-${theme.id}`);
        
        // Store theme preference
        localStorage.setItem('athena-theme', theme.id);
      },
    }),
    {
      name: 'athena-theme-store',
      partialize: (state) => ({ currentTheme: state.currentTheme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply the persisted theme on app load
          const theme = state.getTheme();
          state.applyTheme(theme);
        }
      },
    }
  )
);