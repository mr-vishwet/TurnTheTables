import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/appStore';
import { resolveTheme, ThemeTokens } from '../../../theme';

/** Current theme per stored mode, resolved against the OS preference. */
export const useTheme = (): ThemeTokens => {
  const themeMode = useAppStore(s => s.themeMode);
  const systemDark = useColorScheme() === 'dark';
  return resolveTheme(themeMode, systemDark);
};
