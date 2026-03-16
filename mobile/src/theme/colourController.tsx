import React, { createContext, useContext, useState } from 'react';
import { DefaultColours } from './colours';
import { ThemeContextType } from '../model/ThemeContextType.ts';

export const ThemeContext = createContext<ThemeContextType>({
  theme: DefaultColours,
  accessibility: {
    largeText: false,
    dyslexicFont: false,
    highlightText: false,
  },
  updateTheme: () => {},
  updateAccessibility: () => {},
});

export function ThemeProvider({ children }: any) {
  const [theme, setTheme] = useState(DefaultColours);

  const [accessibility, setAccessibility] = useState({
    largeText: false,
    dyslexicFont: false,
    highlightText: false,
  });

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