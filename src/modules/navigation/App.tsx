import React, { useMemo } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './RootNavigator';
import { useTheme } from '../core/hooks/useTheme';

export const App = () => {
  const theme = useTheme();
  const systemDark = useColorScheme() === 'dark';

  // Merge design tokens into the React Navigation theme so headers/tabs
  // follow the in-app light/dark choice, not just the OS setting.
  const navTheme = useMemo(() => {
    const base = systemDark ? NavDarkTheme : NavLightTheme;
    return {
      ...base,
      dark: theme.colors.background === '#000000',
      colors: {
        ...base.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
      },
    };
  }, [theme, systemDark]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={theme.colors.background === '#000000' ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
