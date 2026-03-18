import React, { createContext, useContext, useEffect, useState } from 'react';
import { DefaultColours } from './colours';
import { ThemeContextType } from '../model/ThemeContextType.ts';
import { getSettings } from '../logic/SettingsService.ts';
import AuthenticationService from '../logic/AuthenticationService.ts';

const defaultAccessibility = {
  largeText: false,
  dyslexicFont: false,
  highlightText: false,
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: DefaultColours,
  accessibility: defaultAccessibility,
  updateTheme: () => {},
  updateAccessibility: () => {},
});

export function ThemeProvider({ children }: any) {
  const [theme, setTheme] = useState(DefaultColours);

  const [accessibility, setAccessibility] = useState(defaultAccessibility);

  function updateTheme(newColours: Partial<typeof DefaultColours>) {
    setTheme((prev) => ({
      ...prev,
      ...newColours,
    }));
  }

  function updateAccessibility(newSettings: Partial<typeof accessibility>) {
    setAccessibility((prev) => ({
      ...prev,
      ...newSettings,
    }));
  }

  // Load settings from backend when the user logs in
  useEffect(() => {
    async function loadSettings() {
      try {
        await AuthenticationService.extractClaims(); // will throw if not logged in

        const data = await getSettings();

        // Update accessibility settings
        setAccessibility({
          largeText: data.largeText,
          dyslexicFont: data.dyslexicFont,
          highlightText: data.highlightText,
        });

        // Update theme settings
        setTheme((prev) => ({
          ...prev,
          redPrimary: data.accentColour,
          black: data.textColour,
          greyBackground: data.backgroundColour,
        }));

      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }

    loadSettings();
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        accessibility,
        updateTheme,
        updateAccessibility,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}