import { Theme } from '../types/theme';

export const monochromeTheme: Theme = {
  id: 'monochrome',
  name: 'Monochrome',
  description: 'Pure black and white theme for maximum readability and focus',
  category: 'professional',
  colors: {
    bg: '#ffffff',
    bgAlt: '#f5f5f5',
    border: '#d1d5db',
    surface: '#f9f9f9',
    text: '#000000',
    textDim: '#4b5563',
    accent: '#1f2937',
    warning: '#b45309',
    error: '#991b1b',
    info: '#1e40af',
    success: '#166534',
  },
  fontWeight: 'medium',
  borderRadius: 'md',
};