import React, { createContext, useContext, useEffect, useState } from 'react';
import { DefaultColours } from './colours';
import { ThemeContextType } from '../model/ThemeContextType.ts';
import { getSettings } from '../logic/SettingsService.ts';
import AuthenticationService from '../logic/AuthenticationService.ts';
import {generateColorSet} from "../screens/personal/SettingsScreen.tsx";
import { HttpException } from '../exception/HttpException.ts';

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

        const accentSet = generateColorSet(data.accentColour);
        const textSet = generateColorSet(data.textColour);
        const backgroundSet = generateColorSet(data.backgroundColour);

        // Update accessibility settings
        setAccessibility({
          largeText: data.largeText,
          dyslexicFont: data.dyslexicFont,
          highlightText: data.highlightText,
        });

        if (data.themePreset) {
          switch (data.themePreset) {
            case "DEFAULT": updateTheme(DefaultColours); break;
            case "BLUE": updateTheme({
              ...DefaultColours,
              redPrimary: "#0066FF",
              redTextDark: "#003A99",
              redBackgroundLight: "#DCE8FF"
            }); break;
            case "GREEN": updateTheme({
              ...DefaultColours,
              redPrimary: "#2E7D32",
              redTextDark: "#1B5E20",
              redBackgroundLight: "#C8E6C9"
            }); break;
            case "DARK": updateTheme({
              // Basic colours
              black: '#FFFFFF',
              white: '#1D1D1D',
              // Basic Red Colours
              redPrimary: '#D20413',
              redTextDark: '#F6CDD0',
              redBackgroundLight: '#AE010B',
              // Traffic Light Colours
              redTrafficTextDark: '#F6CDD0',
              redTrafficBackgroundLight: '#AE010B',
              amberTextDark: '#FFECCD',
              amberBackgroundLight: '#9B6302',
              greenTextDark: '#D0EDDE',
              greenBackgroundLight: '#0D7B42',
              //Grey Colours
              greyPrimaryMainText: '#ABABB3',
              greyIconLight: '#FFFFFF',
              greyBackground: '#101010',
              // Miscellaneous colours
              blueDark: '#E6ECF9',
              blueLight: '#002A80',
            }); break;
            default: console.warn("Unknown preset", data.themePreset);
          }
        } else {

          // Update theme settings
          setTheme((prev) => ({
            ...prev,
            // Accent
            redPrimary: accentSet.primary,
            redTextDark: accentSet.dark,
            redBackgroundLight: accentSet.light,

            // Text
            black: textSet.dark,
            greyPrimaryMainText: textSet.primary,
            greyIconLight: textSet.light,

            // Background
            greyBackground: backgroundSet.primary,
            white: backgroundSet.light,
          }));
        }

      } catch (err) {
        if (err instanceof HttpException && err.statusCode === 401) {
          console.warn(err.message);
        }
        else {
          console.error('Failed to load settings:', err);
        }
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