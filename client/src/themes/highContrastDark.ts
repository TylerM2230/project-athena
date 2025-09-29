import { Theme } from '../types/theme';

export const highContrastDarkTheme: Theme = {
  id: 'high-contrast-dark',
  name: 'High Contrast Dark',
  description: 'Maximum contrast dark theme for optimal accessibility',
  category: 'high-contrast',
  colors: {
    bg: '#000000',
    bgAlt: '#1a1a1a',
    border: '#666666',
    surface: '#0d0d0d',
    text: '#ffffff',
    textDim: '#cccccc',
    accent: '#00ffff',
    warning: '#ffff00',
    error: '#ff4444',
    info: '#00aaff',
    success: '#00ff00',
  },
  fontWeight: 'medium',
  borderRadius: 'md',
};