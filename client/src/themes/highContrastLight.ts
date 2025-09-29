import { Theme } from '../types/theme';

export const highContrastLightTheme: Theme = {
  id: 'high-contrast-light',
  name: 'High Contrast Light',
  description: 'Maximum contrast light theme for optimal accessibility',
  category: 'high-contrast',
  colors: {
    bg: '#ffffff',
    bgAlt: '#f0f0f0',
    border: '#808080',
    surface: '#fafafa',
    text: '#000000',
    textDim: '#333333',
    accent: '#0000ff',
    warning: '#cc6600',
    error: '#cc0000',
    info: '#0066cc',
    success: '#006600',
  },
  fontWeight: 'medium',
  borderRadius: 'md',
};