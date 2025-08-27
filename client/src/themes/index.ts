import { Theme } from '../types/theme';
import { matrixTheme } from './matrix';
import { oceanTheme } from './ocean';
import { draculaTheme } from './dracula';
import { tomorrowTheme } from './tomorrow';
import { nordTheme } from './nord';
import { oneDarkTheme } from './onedark';
import { amberTheme } from './amber';
import { cyberpunkTheme } from './cyberpunk';
import { solarizedTheme } from './solarized';
import { gruvboxTheme } from './gruvbox';

export const themes: Record<string, Theme> = {
  matrix: matrixTheme,
  ocean: oceanTheme,
  dracula: draculaTheme,
  tomorrow: tomorrowTheme,
  nord: nordTheme,
  onedark: oneDarkTheme,
  amber: amberTheme,
  cyberpunk: cyberpunkTheme,
  solarized: solarizedTheme,
  gruvbox: gruvboxTheme,
};

export const defaultTheme = matrixTheme;

export const getThemeById = (id: string): Theme => {
  return themes[id] || defaultTheme;
};

export const getThemesByCategory = (category: Theme['category']): Theme[] => {
  return Object.values(themes).filter(theme => theme.category === category);
};

export const getAllThemes = (): Theme[] => {
  return Object.values(themes);
};

// Export individual themes
export * from './matrix';
export * from './ocean';
export * from './dracula';
export * from './tomorrow';
export * from './nord';
export * from './onedark';
export * from './amber';
export * from './cyberpunk';
export * from './solarized';
export * from './gruvbox';