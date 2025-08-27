import { Theme } from '../types/theme';

export const matrixTheme: Theme = {
  id: 'matrix',
  name: 'Matrix Terminal',
  description: 'Classic green-on-black terminal experience',
  category: 'professional',
  colors: {
    bg: '#0a0a0a',
    bgAlt: '#1a1a1a',
    border: '#333333',
    surface: '#1a1a1a',
    text: '#e0e0e0',
    textDim: '#888888',
    accent: '#00ff00',
    warning: '#ffff00',
    error: '#ff0000',
    info: '#00ffff',
    success: '#00ff00',
  },
  fontWeight: 'normal',
  borderRadius: 'lg',
};