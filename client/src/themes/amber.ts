import { Theme } from '../types/theme';

export const amberTheme: Theme = {
  id: 'amber',
  name: 'Amber Terminal',
  description: 'Vintage amber CRT monitor aesthetic',
  category: 'vintage',
  colors: {
    bg: '#0f0a00',
    bgAlt: '#1a1400',
    border: '#443300',
    surface: '#1a1400',
    text: '#ffffff',
    textDim: '#ffcc66',
    accent: '#ffa500',
    warning: '#ff8c00',
    error: '#ff4500',
    info: '#ffaa00',
    success: '#ffb000',
  },
  fontWeight: 'medium',
  borderRadius: 'lg',
};