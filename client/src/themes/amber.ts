import { Theme } from '../types/theme';

export const amberTheme: Theme = {
  id: 'amber',
  name: 'Amber Terminal',
  description: 'Vintage amber CRT monitor aesthetic',
  category: 'vintage',
  colors: {
    bg: '#0f0a00',
    bgAlt: '#1a1400',
    border: '#332800',
    surface: '#1a1400',
    text: '#ffffff',
    textDim: '#cc9900',
    accent: '#ffa500',
    warning: '#ff8c00',
    error: '#ff4500',
    info: '#cc8800',
    success: '#ffb000',
  },
  fontWeight: 'medium',
  borderRadius: 'lg',
};