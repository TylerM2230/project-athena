import { useThemeStore } from '../stores/themeStore';
import type { ThemeCategory } from '../types/theme';
import { getAllThemes, getThemesByCategory } from '../themes';

export function useTheme() {
  const { currentTheme, setTheme, getTheme, applyTheme } = useThemeStore();

  const currentThemeData = getTheme();

  const switchTheme = (themeId: string) => {
    setTheme(themeId);
  };

  const getAvailableThemes = () => {
    return getAllThemes();
  };

  const getThemesByType = (category: ThemeCategory) => {
    return getThemesByCategory(category);
  };

  const isCurrentTheme = (themeId: string) => {
    return currentTheme === themeId;
  };

  return {
    currentTheme,
    currentThemeData,
    switchTheme,
    getAvailableThemes,
    getThemesByType,
    isCurrentTheme,
    applyTheme,
  };
}