export interface ThemeColors {
  // Background colors
  bg: string;
  bgAlt: string;
  
  // Border and surface colors
  border: string;
  surface: string;
  
  // Text colors
  text: string;
  textDim: string;
  
  // Accent and semantic colors
  accent: string;
  warning: string;
  error: string;
  info: string;
  success: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'vintage' | 'futuristic' | 'minimal';
  colors: ThemeColors;
  
  // Optional theme-specific settings
  fontWeight?: 'light' | 'normal' | 'medium' | 'semibold';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg';
}

export interface ThemeState {
  currentTheme: string;
  themes: Record<string, Theme>;
  setTheme: (themeId: string) => void;
  getTheme: (themeId?: string) => Theme;
  applyTheme: (theme: Theme) => void;
}

export type ThemeCategory = 'professional' | 'vintage' | 'futuristic' | 'minimal';

export interface ThemePreview {
  id: string;
  name: string;
  category: ThemeCategory;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
}