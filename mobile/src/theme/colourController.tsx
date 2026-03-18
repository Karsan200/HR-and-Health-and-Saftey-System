import React, { createContext, useContext, useState } from 'react';
import { DefaultColours } from './colours';
import { ThemeContextType } from '../model/ThemeContextType.ts';

export const ThemeContext = createContext<ThemeContextType>({
  theme: DefaultColours,
  updateTheme: () => {},
});

export function ThemeProvider({ children }: any) {
  const [theme, setTheme] = useState(DefaultColours);

  function updateTheme(newColours: Partial<typeof DefaultColours>) {
    setTheme((prev) => ({
      ...prev,
      ...newColours,
    }));
  }

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}