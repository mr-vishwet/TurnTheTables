import { ThemeMode } from '../modules/core/types';

// Design tokens per project_context.md §5. A single token shape serves both
// themes; components consume useTheme() rather than raw hex values.

export interface ThemeTokens {
  colors: {
    primary: string;
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    destructive: string;
  };
  typography: {
    fontFamily: string;
    sizes: { xs: number; sm: number; md: number; lg: number; xl: number };
    weights: { regular: string; medium: string; bold: string };
  };
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
  radii: { sm: number; md: number; lg: number; pill: number };
}

const typography: ThemeTokens['typography'] = {
  fontFamily: 'System',
  sizes: { xs: 11, sm: 13, md: 15, lg: 18, xl: 24 },
  weights: { regular: '400', medium: '500', bold: '700' },
};

const spacing: ThemeTokens['spacing'] = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const radii: ThemeTokens['radii'] = { sm: 4, md: 8, lg: 16, pill: 999 };

export const lightTheme: ThemeTokens = {
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    surfaceAlt: '#FFFFFF',
    text: '#000000',
    textMuted: '#6C707E',
    border: '#D1D1D6',
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    destructive: '#FF3B30',
  },
  typography,
  spacing,
  radii,
};

export const darkTheme: ThemeTokens = {
  ...lightTheme,
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    surface: '#1C1C1E',
    surfaceAlt: '#2C2C2E',
    text: '#FFFFFF',
    textMuted: '#98989F',
    border: '#38383A',
    success: '#30D158',
    error: '#FF453A',
    warning: '#FF9F0A',
    destructive: '#FF453A',
  },
};

/** Resolve a stored ThemeMode against the OS preference. */
export const resolveTheme = (mode: ThemeMode, systemDark: boolean): ThemeTokens => {
  if (mode === 'light') return lightTheme;
  if (mode === 'dark') return darkTheme;
  return systemDark ? darkTheme : lightTheme;
};

// Backwards-compatible flat export (kept for any legacy imports).
export const colors = lightTheme.colors;
