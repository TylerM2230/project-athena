import { Theme, ThemeAccessibility } from '../types/theme';
import { getContrastRatio, checkWcagCompliance, WcagLevel } from '../utils/contrast';
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

// New high-contrast themes
import { corporateBlueTheme } from './corporateBlue';
import { monochromeTheme } from './monochrome';
import { forestTheme } from './forest';
import { sunsetTheme } from './sunset';
import { lavenderTheme } from './lavender';
import { roseGoldTheme } from './roseGold';
import { highContrastDarkTheme } from './highContrastDark';
import { highContrastLightTheme } from './highContrastLight';

export const themes: Record<string, Theme> = {
  // Original themes
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

  // New high-contrast themes
  'corporate-blue': corporateBlueTheme,
  monochrome: monochromeTheme,
  forest: forestTheme,
  sunset: sunsetTheme,
  lavender: lavenderTheme,
  'rose-gold': roseGoldTheme,
  'high-contrast-dark': highContrastDarkTheme,
  'high-contrast-light': highContrastLightTheme,
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

export const computeThemeAccessibility = (theme: Theme): ThemeAccessibility => {
  const { colors } = theme;

  const textOnBgRatio = getContrastRatio(colors.text, colors.bg);
  const textOnBgAltRatio = getContrastRatio(colors.text, colors.bgAlt);
  const textDimOnBgRatio = getContrastRatio(colors.textDim, colors.bg);
  const accentOnBgRatio = getContrastRatio(colors.accent, colors.bg);

  const textOnBgLevel = checkWcagCompliance(colors.text, colors.bg);
  const textOnBgAltLevel = checkWcagCompliance(colors.text, colors.bgAlt);
  const textDimOnBgLevel = checkWcagCompliance(colors.textDim, colors.bg);
  const accentOnBgLevel = checkWcagCompliance(colors.accent, colors.bg);

  // Determine overall WCAG level
  const levels = [textOnBgLevel, textOnBgAltLevel, textDimOnBgLevel, accentOnBgLevel];
  const hasFailures = levels.includes(WcagLevel.FAIL);
  const allAAA = levels.every(level => level === WcagLevel.AAA);

  let wcagLevel: 'fail' | 'aa' | 'aaa';
  if (hasFailures) {
    wcagLevel = 'fail';
  } else if (allAAA) {
    wcagLevel = 'aaa';
  } else {
    wcagLevel = 'aa';
  }

  const isHighContrast = textOnBgRatio >= 7 && textDimOnBgRatio >= 4.5;

  return {
    textOnBgRatio,
    textOnBgAltRatio,
    textDimOnBgRatio,
    accentOnBgRatio,
    wcagLevel,
    isHighContrast,
  };
};

export const getThemeWithAccessibility = (theme: Theme): Theme => {
  return {
    ...theme,
    accessibility: theme.accessibility || computeThemeAccessibility(theme),
  };
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

// Export new themes
export * from './corporateBlue';
export * from './monochrome';
export * from './forest';
export * from './sunset';
export * from './lavender';
export * from './roseGold';
export * from './highContrastDark';
export * from './highContrastLight';