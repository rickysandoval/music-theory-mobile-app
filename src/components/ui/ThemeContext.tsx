/**
 * Theme context for dark/light mode support
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { lightTheme, darkTheme, Theme } from '@/src/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorScheme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  colorScheme: ColorScheme;
  isDark: boolean;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = '@music_theory_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('system');

  // Load saved theme preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((value) => {
      if (value === 'light' || value === 'dark' || value === 'system') {
        setColorSchemeState(value);
      }
    });
  }, []);

  // Determine actual theme based on preference
  const isDark = colorScheme === 'system' 
    ? systemColorScheme === 'dark' 
    : colorScheme === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  const setColorScheme = async (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, isDark, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
