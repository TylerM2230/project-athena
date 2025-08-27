import { ReactNode, useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { getTheme, applyTheme } = useThemeStore();

  useEffect(() => {
    // Apply the current theme on mount
    const currentTheme = getTheme();
    applyTheme(currentTheme);
  }, [getTheme, applyTheme]);

  return <>{children}</>;
}